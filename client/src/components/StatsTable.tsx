/*
 * Design: Precision Agriculture Dashboard
 * Tabela de estatísticas com média, desvio padrão, CV% e número de repetições
 */
import { TrendingUp } from 'lucide-react';
import type { TreatmentStats } from '@/lib/types';

interface StatsTableProps {
  stats: TreatmentStats[];
}

export default function StatsTable({ stats }: StatsTableProps) {
  if (stats.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="section-label mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: 'var(--amber-accent)' }} />
        Estatísticas por Tratamento
      </div>

      <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header-green">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" rowSpan={2}>Tratamento</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider" rowSpan={2}>N</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wider border-b border-white/20" colSpan={3}>Umidade (%)</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wider border-b border-white/20" colSpan={3}>PMS (g)</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wider border-b border-white/20" colSpan={3} style={{ background: 'rgba(255,255,255,0.08)' }}>Peso Corr. 14% (kg)</th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wider border-b border-white/20" colSpan={3} style={{ background: 'rgba(255,255,255,0.08)' }}>Produtividade (kg/ha)</th>
              </tr>
              <tr className="table-header-green">
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider">Média</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider">DP</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider">CV%</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider">Média</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider">DP</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider">CV%</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider" style={{ background: 'rgba(255,255,255,0.08)' }}>Média</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider" style={{ background: 'rgba(255,255,255,0.08)' }}>DP</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider" style={{ background: 'rgba(255,255,255,0.08)' }}>CV%</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider" style={{ background: 'rgba(255,255,255,0.08)' }}>Média</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider" style={{ background: 'rgba(255,255,255,0.08)' }}>DP</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium tracking-wider" style={{ background: 'rgba(255,255,255,0.08)' }}>CV%</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, idx) => (
                <tr
                  key={s.treatment}
                  className="border-b transition-colors duration-100 hover:bg-[var(--muted)]"
                  style={{
                    borderColor: 'var(--border)',
                    background: idx % 2 === 0 ? 'var(--card)' : 'var(--muted)',
                  }}
                >
                  <td className="px-3 py-2 font-medium text-sm">{s.treatment}</td>
                  <td className="px-3 py-2 text-center font-data text-sm">{s.count}</td>
                  <td className="px-2 py-2 text-right font-data text-xs">{s.avgMoisture.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.stdMoisture.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.cvMoisture.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs">{s.avgSeedWeight1000.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.stdSeedWeight1000.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.cvSeedWeight1000.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs font-medium" style={{ background: 'var(--result-bg)', color: 'var(--accent-foreground)' }}>{s.avgCorrectedWeight14.toFixed(3)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs" style={{ background: 'var(--result-bg)', color: 'var(--muted-foreground)' }}>{s.stdCorrectedWeight14.toFixed(3)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs" style={{ background: 'var(--result-bg)', color: 'var(--muted-foreground)' }}>{s.cvCorrectedWeight14.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-data text-xs font-medium" style={{ background: 'var(--result-bg)', color: 'var(--accent-foreground)' }}>{s.avgProductivityKgHa?.toFixed(1) ?? '—'}</td>
                  <td className="px-2 py-2 text-right font-data text-xs" style={{ background: 'var(--result-bg)', color: 'var(--muted-foreground)' }}>{s.stdProductivityKgHa?.toFixed(1) ?? '—'}</td>
                  <td className="px-2 py-2 text-right font-data text-xs" style={{ background: 'var(--result-bg)', color: 'var(--muted-foreground)' }}>{s.cvProductivityKgHa?.toFixed(2) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
