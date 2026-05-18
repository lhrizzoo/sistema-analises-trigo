import type { AnalysisWithCalculations, TreatmentStats } from './types';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Exportar tabela de dados para Excel
 */
export function exportToExcel(
  analyses: AnalysisWithCalculations[],
  stats: TreatmentStats[],
  filename = 'analises-trigo'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Dados completos
  const dataRows = analyses.map(a => ({
    'Tratamento': a.treatment,
    'Cultivar': a.cultivar || '-',
    'Repetição': a.repetition || '-',
    'Peso da Amostra (kg)': a.sampleWeight,
    'Umidade (%)': a.moisture,
    'PMS (g)': a.seedWeight1000,
    'Área Colhida (m²)': a.harvestedArea || '-',
    'Peso Corrigido 14% (kg)': a.correctedWeight14,
    'Produtividade (kg/ha)': a.productivityKgHa ?? '-',
  }));
  const ws1 = XLSX.utils.json_to_sheet(dataRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Dados');

  // Sheet 2: Estatísticas
  const statsRows = stats.map(s => ({
    'Tratamento': s.treatment,
    'N° Repetições': s.count,
    'Umidade Média (%)': s.avgMoisture,
    'Umidade DP': s.stdMoisture,
    'Umidade CV%': s.cvMoisture,
    'PMS Médio (g)': s.avgSeedWeight1000,
    'PMS DP': s.stdSeedWeight1000,
    'PMS CV%': s.cvSeedWeight1000,
    'Peso Corr. 14% Médio': s.avgCorrectedWeight14,
    'Peso Corr. 14% DP': s.stdCorrectedWeight14,
    'Peso Corr. 14% CV%': s.cvCorrectedWeight14,
    'Produtividade Média (kg/ha)': s.avgProductivityKgHa ?? '-',
    'Produtividade DP': s.stdProductivityKgHa ?? '-',
    'Produtividade CV%': s.cvProductivityKgHa ?? '-',
  }));
  const ws2 = XLSX.utils.json_to_sheet(statsRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Estatísticas');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Exportar relatório em PDF
 */
export function exportToPDF(
  analyses: AnalysisWithCalculations[],
  stats: TreatmentStats[],
  filename = 'relatorio-trigo'
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Análise de Sementes — Trigo', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 22);
  doc.text(`Total de amostras: ${analyses.length}`, 14, 27);

  // Table 1: Data
  autoTable(doc, {
    startY: 32,
    head: [['Tratamento', 'Cultivar', 'Rep.', 'Peso (kg)', 'Umidade (%)', 'PMS (g)', 'Área (m²)', 'Peso Corr. 14%', 'Prod. (kg/ha)']],
    body: analyses.map(a => [
      a.treatment,
      a.cultivar || '-',
      a.repetition || '-',
      a.sampleWeight.toFixed(4),
      a.moisture.toFixed(2),
      a.seedWeight1000.toFixed(2),
      a.harvestedArea?.toFixed(2) ?? '-',
      a.correctedWeight14.toFixed(3),
      a.productivityKgHa?.toFixed(1) ?? '-',
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [34, 60, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 250, 245] },
  });

  // New page for stats
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatísticas por Tratamento', 14, 15);

  autoTable(doc, {
    startY: 22,
    head: [['Tratamento', 'N', 'Umid. Média', 'Umid. DP', 'Umid. CV%', 'PMS Médio', 'PMS DP', 'PMS CV%', 'Peso Corr. Médio', 'Peso Corr. DP', 'Peso Corr. CV%', 'Prod. Média', 'Prod. DP', 'Prod. CV%']],
    body: stats.map(s => [
      s.treatment,
      s.count,
      s.avgMoisture.toFixed(2),
      s.stdMoisture.toFixed(2),
      s.cvMoisture.toFixed(2),
      s.avgSeedWeight1000.toFixed(2),
      s.stdSeedWeight1000.toFixed(2),
      s.cvSeedWeight1000.toFixed(2),
      s.avgCorrectedWeight14.toFixed(3),
      s.stdCorrectedWeight14.toFixed(3),
      s.cvCorrectedWeight14.toFixed(2),
      s.avgProductivityKgHa?.toFixed(1) ?? '-',
      s.stdProductivityKgHa?.toFixed(1) ?? '-',
      s.cvProductivityKgHa?.toFixed(2) ?? '-',
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [34, 60, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 250, 245] },
  });

  doc.save(`${filename}.pdf`);
}

/**
<<<<<<< Updated upstream
 * Exportar gráficos como imagem PNG - cada gráfico em um arquivo separado
 */
export async function exportChartsAsImage(chartContainerId: string, filename = 'graficos-trigo') {
  const container = document.getElementById(chartContainerId);
  if (!container) return;

  // Encontrar todos os ChartCard (div com classe rounded-lg que contém os gráficos)
  const chartCards = container.querySelectorAll('div.rounded-lg.border');
  if (chartCards.length === 0) return;

  // Extrair nome da amostra do título ou usar padrão
  const titleElement = container.querySelector('.section-label');
  const sampleName = titleElement?.textContent?.trim() || 'graficos';

  // Exportar cada gráfico individualmente
  for (let i = 0; i < chartCards.length; i++) {
    const card = chartCards[i] as HTMLElement;
    const titleElement = card.querySelector('h3');
    const chartTitle = titleElement?.textContent?.trim() || `grafico_${i + 1}`;
    
    // Sanitizar nome do arquivo
    const sanitizedTitle = chartTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

=======
 * Exportar cada gráfico como imagem PNG separada
 */
export async function exportChartsAsImage(chartContainerId: string) {
  const container = document.getElementById(chartContainerId);
  if (!container) return;

  const chartCards = container.querySelectorAll('div[class*="rounded-lg"]');
  if (chartCards.length === 0) return;

  const chartNames = ['umidade', 'pms', 'peso_corrigido', 'produtividade'];

  for (let i = 0; i < Math.min(chartCards.length, chartNames.length); i++) {
    const card = chartCards[i] as HTMLElement;
>>>>>>> Stashed changes
    try {
      const canvas = await html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
<<<<<<< Updated upstream
        allowTaint: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `${filename}_${sanitizedTitle}.png`;
          saveAs(blob, fileName);
        }
      }, 'image/png', 0.95);

      // Pequeno delay entre exportações para evitar problemas
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Erro ao exportar gráfico "${chartTitle}":`, error);
=======
      });

      canvas.toBlob((blob) => {
        if (blob) saveAs(blob, `grafico_${chartNames[i]}.png`);
      }, 'image/png');

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Erro ao exportar gráfico ${chartNames[i]}:`, error);
>>>>>>> Stashed changes
    }
  }
}
