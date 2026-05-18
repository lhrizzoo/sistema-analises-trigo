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
 * Converter cores OKLCH para RGB (compatível com html2canvas)
 */
function convertOklchToRgb(element: HTMLElement): void {
  const style = window.getComputedStyle(element);
  
  // Converte background color
  const bgColor = style.backgroundColor;
  if (bgColor && bgColor.includes('oklch')) {
    const match = bgColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      const rgb = oklchToRgb(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
      element.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
  }
  
  // Converte text color
  const textColor = style.color;
  if (textColor && textColor.includes('oklch')) {
    const match = textColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      const rgb = oklchToRgb(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
      element.style.color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
  }
  
  // Converte border color
  const borderColor = style.borderColor;
  if (borderColor && borderColor.includes('oklch')) {
    const match = borderColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      const rgb = oklchToRgb(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
      element.style.borderColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
  }

  // Recursivamente converte filhos
  for (let i = 0; i < element.children.length; i++) {
    convertOklchToRgb(element.children[i] as HTMLElement);
  }
}

/**
 * Converter OKLCH para RGB
 * Baseado em: https://bottosson.github.io/posts/oklab/
 */
function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291486575 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = 4.0767416621 * l3 - 3.3077363322 * m3 + 0.2309101289 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193761 * s3;
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return {
    r: Math.max(0, Math.min(255, Math.round(linearToSrgb(r) * 255))),
    g: Math.max(0, Math.min(255, Math.round(linearToSrgb(g) * 255))),
    b: Math.max(0, Math.min(255, Math.round(linearToSrgb(bl) * 255))),
  };
}

/**
 * Converter linear RGB para sRGB
 */
function linearToSrgb(x: number): number {
  if (x <= 0.0031308) {
    return 12.92 * x;
  }
  return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

/**
 * Exportar gráficos como imagens PNG
 */
export async function exportChartsAsImage(chartContainerId: string) {
  try {
    const container = document.getElementById(chartContainerId);
    if (!container) {
      console.error('Container de gráficos não encontrado');
      alert('Erro: Container de gráficos não encontrado');
      return;
    }

    // Aguarda renderização completa
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Encontra todos os cards de gráficos
    const chartCards = Array.from(container.querySelectorAll('div.rounded-lg'));
    if (chartCards.length === 0) {
      console.error('Nenhum gráfico encontrado');
      alert('Erro: Nenhum gráfico encontrado');
      return;
    }

    const chartNames = ['produtividade', 'umidade', 'pms', 'peso_corrigido'];
    let successCount = 0;

    for (let i = 0; i < Math.min(chartCards.length, chartNames.length); i++) {
      const card = chartCards[i] as HTMLElement;
      const chartName = chartNames[i];

      try {
        console.log(`Exportando gráfico ${chartName}...`);

        // Clona o card para não afetar a página
        const clone = card.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        clone.style.width = card.offsetWidth + 'px';
        clone.style.height = card.offsetHeight + 'px';
        clone.style.zIndex = '-9999';
        document.body.appendChild(clone);

        // Converte cores OKLCH para RGB
        convertOklchToRgb(clone);

        // Aguarda renderização do clone
        await new Promise(resolve => setTimeout(resolve, 300));

        // Renderiza para canvas
        const canvas = await html2canvas(clone, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          imageTimeout: 10000,
          proxy: undefined,
        });

        // Converte para blob e salva
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `grafico_${chartName}.png`);
            successCount++;
            console.log(`✓ Gráfico ${chartName} exportado`);
          }
        }, 'image/png', 0.95);

        // Remove o clone
        document.body.removeChild(clone);

        // Aguarda entre exportações
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error(`✗ Erro ao exportar ${chartName}:`, error);
      }
    }

    if (successCount === 0) {
      alert('Erro: Não foi possível exportar os gráficos. Verifique o console para mais detalhes.');
    } else {
      alert(`${successCount} gráfico(s) exportado(s) com sucesso!`);
    }
  } catch (error) {
    console.error('Erro geral ao exportar gráficos:', error);
    alert('Erro ao exportar gráficos: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}
