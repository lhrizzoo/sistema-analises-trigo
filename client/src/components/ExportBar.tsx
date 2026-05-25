/*
 * Design: Precision Agriculture Dashboard
 * Barra de exportação com botões para Excel, PDF e gráficos
 */
import { FileSpreadsheet, FileText, Image } from 'lucide-react';
import type { AnalysisWithCalculations, TreatmentStats } from '@/lib/types';
import { exportToExcel, exportToPDF, exportChartsAsImage } from '@/lib/exportUtils';

interface ExportBarProps {
  analyses: AnalysisWithCalculations[];
  stats: TreatmentStats[];
}

export default function ExportBar({ analyses, stats }: ExportBarProps) {
  const btnClass = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 border";

  return (
    <section className="mb-8">
      <div className="section-label mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: 'var(--primary)' }} />
        Exportação
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => exportToExcel(analyses, stats)}
          className={btnClass}
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#217346';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#217346';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--card)';
            e.currentTarget.style.color = 'var(--foreground)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Excel
        </button>

        <button
          onClick={() => exportToPDF(analyses, stats)}
          className={btnClass}
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#c0392b';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#c0392b';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--card)';
            e.currentTarget.style.color = 'var(--foreground)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <FileText className="w-4 h-4" />
          Relatório PDF
        </button>

        <button
          onClick={() => exportChartsAsImage('charts-container')}
          className={btnClass}
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary-foreground)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--card)';
            e.currentTarget.style.color = 'var(--foreground)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <Image className="w-4 h-4" />
          Exportar Gráficos
        </button>
      </div>
    </section>
  );
}
