import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalysisWithCalculations, TreatmentStats } from '@/lib/types';

/**
 * Exportar dados para Excel
 */
export async function exportToExcel(analyses: AnalysisWithCalculations[], stats: TreatmentStats[]) {
  try {
    const { utils, writeFile } = await import('xlsx');
    const ws = utils.json_to_sheet(analyses.map(a => ({
      Tratamento: a.treatment,
      Cultivar: a.cultivar || '—',
      Rep: a.repetition,
      'Peso (kg)': a.sampleWeight.toFixed(4),
      'Umidade (%)': a.moisture.toFixed(2),
      'PMS (g)': a.seedWeight1000.toFixed(2),
      'Área (m²)': a.harvestedArea ? a.harvestedArea.toFixed(2) : '—',
      'Peso Corr. 14%': a.correctedWeight14.toFixed(3),
      'Produtividade (kg/ha)': a.productivityKgHa ? a.productivityKgHa.toFixed(1) : '—',
    })));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Análises');
    writeFile(wb, 'analises-trigo.xlsx');
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
  }
}

/**
 * Exportar dados para PDF com tabela
 */
export async function exportToPDF(analyses: AnalysisWithCalculations[], stats: TreatmentStats[]) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('Relatório de Análises de Sementes - Trigo', 14, 15);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 25);

    const tableData = analyses.map(a => [
      a.treatment,
      a.cultivar || '—',
      a.repetition.toString(),
      a.sampleWeight.toFixed(4),
      a.moisture.toFixed(2),
      a.seedWeight1000.toFixed(2),
      a.harvestedArea ? a.harvestedArea.toFixed(2) : '—',
      a.correctedWeight14.toFixed(3),
      a.productivityKgHa ? a.productivityKgHa.toFixed(1) : '—',
    ]);

    autoTable(doc, {
      head: [['Tratamento', 'Cultivar', 'Rep', 'Peso (kg)', 'Umidade (%)', 'PMS (g)', 'Área (m²)', 'Peso Corr. 14%', 'Produtividade (kg/ha)']],
      body: tableData,
      startY: 35,
      margin: 10,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [33, 115, 70], textColor: [255, 255, 255] },
    });

    doc.save('relatorio-trigo.pdf');
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
  }
}

/**
 * Exportar gráficos como imagens PNG - versão simplificada
 * Aguarda um tempo para os gráficos renderizarem completamente
 */
export async function exportChartsAsImage(chartContainerId: string) {
  try {
    const container = document.getElementById(chartContainerId);
    if (!container) {
      console.error('Container de gráficos não encontrado');
      return;
    }

    // Aguarda um pouco para garantir que os gráficos estão renderizados
    await new Promise(resolve => setTimeout(resolve, 500));

    // Encontra todos os ChartCard (divs com rounded-lg que contêm os gráficos)
    const chartCards = container.querySelectorAll('div.rounded-lg');
    if (chartCards.length === 0) {
      console.error('Nenhum gráfico encontrado');
      return;
    }

    const chartNames = ['produtividade', 'umidade', 'pms', 'peso_corrigido'];
    let exportedCount = 0;

    for (let i = 0; i < Math.min(chartCards.length, chartNames.length); i++) {
      const card = chartCards[i] as HTMLElement;
      
      try {
        // Clona o card para não afetar a página original
        const clone = card.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        clone.style.width = card.offsetWidth + 'px';
        clone.style.height = card.offsetHeight + 'px';
        clone.style.zIndex = '-9999';
        document.body.appendChild(clone);

        // Aguarda um pouco para o clone renderizar
        await new Promise(resolve => setTimeout(resolve, 300));

        // Converte para canvas
        const canvas = await html2canvas(clone, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          imageTimeout: 5000,
        });

        // Salva como PNG
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `grafico_${chartNames[i]}.png`);
            exportedCount++;
            console.log(`✓ Gráfico ${chartNames[i]} exportado com sucesso`);
          }
        }, 'image/png');

        // Remove o clone
        document.body.removeChild(clone);

        // Aguarda antes do próximo gráfico
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Erro ao exportar gráfico ${chartNames[i]}:`, error);
      }
    }

    if (exportedCount > 0) {
      console.log(`${exportedCount} gráfico(s) exportado(s) com sucesso`);
    }
  } catch (error) {
    console.error('Erro geral ao exportar gráficos:', error);
  }
}
