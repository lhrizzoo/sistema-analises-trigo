/*
 * Design: Precision Agriculture Dashboard
 * Gráficos de barras profissionais com paleta acessível para daltônicos
 * Grid 2x2 em desktop, 1 coluna em mobile
 * CADA REPETIÇÃO = UMA BARRA INDIVIDUAL no gráfico
 * Cores agrupadas por tratamento base para fácil identificação
 * Largura dinâmica com scroll horizontal para muitos registros
 */
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, LabelList,
} from 'recharts';
import type { AnalysisWithCalculations } from '@/lib/types';
import { getTreatmentBase } from '@/lib/calculations';
import { getChartColor } from '@/lib/chartColors';

interface ChartsProps {
  analyses: AnalysisWithCalculations[];
}

function ChartCard({ title, subtitle, children, minWidth }: { title: string; subtitle: string; children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
      </div>
      <div className="w-full overflow-x-auto" style={{ height: 420 }}>
        <div style={{ minWidth: minWidth || '100%', height: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border px-3 py-2 shadow-lg" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-data text-xs" style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// Custom label renderer for bar values - rotated for many bars
const renderBarLabel = (props: any, count: number) => {
  const { x, y, width, value } = props;
  if (value === undefined || value === null || value === 0) return null;
  // Hide labels if too many bars and bars are narrow
  if (count > 50 && width < 12) return null;
  const displayValue = typeof value === 'number' ? (value >= 100 ? value.toFixed(0) : value.toFixed(1)) : value;
  
  if (count > 20) {
    // Rotated labels for many bars
    return (
      <text
        x={x + width / 2}
        y={y - 4}
        fill="var(--muted-foreground)"
        textAnchor="end"
        fontSize={7}
        fontFamily="'JetBrains Mono', monospace"
        transform={`rotate(-65, ${x + width / 2}, ${y - 4})`}
      >
        {displayValue}
      </text>
    );
  }
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="var(--muted-foreground)"
      textAnchor="middle"
      fontSize={9}
      fontFamily="'JetBrains Mono', monospace"
    >
      {displayValue}
    </text>
  );
};

export default function Charts({ analyses }: ChartsProps) {
  // Build color map: each treatment base gets a consistent color
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const bases = new Set<string>();
    for (const a of analyses) {
      bases.add(getTreatmentBase(a.treatment));
    }
    const sortedBases = Array.from(bases).sort();
    sortedBases.forEach((base, i) => map.set(base, getChartColor(i)));
    return map;
  }, [analyses]);

  // Build chart data: one entry per individual analysis (repetition)
  const chartData = useMemo(() => {
    return analyses.map(a => ({
      name: a.treatment, // ex: "Foco 1", "Foco 2", etc.
      treatmentBase: getTreatmentBase(a.treatment),
      moisture: a.moisture,
      pms: a.seedWeight1000,
      correctedWeight: a.correctedWeight14,
      productivity: a.productivityKgHa ?? 0,
      hasProductivity: a.productivityKgHa !== null,
    }));
  }, [analyses]);

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        <p className="text-sm">Nenhum dado disponível para gráficos.</p>
      </div>
    );
  }

  const hasAnyProductivity = analyses.some(a => a.productivityKgHa !== null);

  // Compute averages for reference lines
  const avgMoisture = chartData.reduce((s, d) => s + d.moisture, 0) / chartData.length;
  const avgPMS = chartData.reduce((s, d) => s + d.pms, 0) / chartData.length;
  const avgCorrected = chartData.reduce((s, d) => s + d.correctedWeight, 0) / chartData.length;
  // Average productivity (only for entries with data)
  const productivityEntries = chartData.filter(d => d.hasProductivity);
  const avgProductivity = productivityEntries.length > 0 
    ? productivityEntries.reduce((s, d) => s + d.productivity, 0) / productivityEntries.length 
    : 0;

  // Dynamic sizing based on number of items
  const count = chartData.length;
  const barSize = count <= 8 ? 36 : count <= 15 ? 28 : count <= 30 ? 20 : count <= 50 ? 14 : 10;
  
  // Minimum width to ensure bars are readable - each bar needs ~25px minimum
  const minChartWidth = count > 15 ? Math.max(count * 25, 600) : undefined;

  const xAxisProps = {
    dataKey: 'name' as const,
    tick: { fontSize: count > 40 ? 7 : count > 20 ? 8 : 10, fill: 'var(--muted-foreground)' },
    angle: count > 8 ? -55 : -25,
    textAnchor: 'end' as const,
    height: count > 30 ? 100 : count > 15 ? 85 : 65,
    interval: 0 as const,
  };

  const yAxisProps = {
    tick: { fontSize: 10, fill: 'var(--muted-foreground)' },
    width: 55,
  };

  const gridProps = {
    strokeDasharray: '3 3',
    stroke: 'var(--border)',
    opacity: 0.6,
  };

  const labelRenderer = (props: any) => renderBarLabel(props, count);

  return (
    <section className="mb-8" id="charts-container">
      <div className="section-label mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: 'var(--primary)' }} />
        Gráficos Comparativos — Cada Barra = 1 Repetição
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 px-1">
        {Array.from(colorMap.entries()).map(([base, color]) => (
          <div key={base} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{base}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Produtividade */}
        <ChartCard title="Produtividade (kg/ha)" subtitle="Cada barra = 1 repetição individual" minWidth={hasAnyProductivity ? minChartWidth : undefined}>
          {hasAnyProductivity ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 25, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid {...gridProps} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} />
                {avgProductivity > 0 && <ReferenceLine y={avgProductivity} stroke="#CC3311" strokeDasharray="4 4" strokeWidth={3.5} label={{ value: `Média: ${avgProductivity.toFixed(1)}kg/ha`, position: 'top', fontSize: 9, fill: '#CC3311', offset: 10 }} />}
                <Bar dataKey="productivity" name="kg/ha" radius={[3, 3, 0, 0]} maxBarSize={barSize}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.hasProductivity
                        ? (colorMap.get(entry.treatmentBase) || '#0077BB')
                        : '#E0E0E0'
                      }
                      opacity={entry.hasProductivity ? 1 : 0.3}
                    />
                  ))}
                  <LabelList dataKey="productivity" content={labelRenderer} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                Informe a <strong>Área Colhida (m²)</strong> nos registros<br />
                para visualizar a produtividade
              </p>
            </div>
          )}
        </ChartCard>

        {/* Umidade */}
        <ChartCard title="Umidade (%)" subtitle="Cada barra = 1 repetição individual" minWidth={minChartWidth}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 25, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgMoisture} stroke="#CC3311" strokeDasharray="4 4" strokeWidth={3.5} label={{ value: `Média: ${avgMoisture.toFixed(1)}%`, position: 'top', fontSize: 9, fill: '#CC3311', offset: 10 }} />
              <Bar dataKey="moisture" name="Umidade %" radius={[3, 3, 0, 0]} maxBarSize={barSize}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={colorMap.get(entry.treatmentBase) || '#0077BB'} />
                ))}
                <LabelList dataKey="moisture" content={labelRenderer} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PMS */}
        <ChartCard title="Peso de Mil Sementes (g)" subtitle="Cada barra = 1 repetição individual" minWidth={minChartWidth}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 25, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgPMS} stroke="#CC3311" strokeDasharray="4 4" strokeWidth={3.5} label={{ value: `Média: ${avgPMS.toFixed(1)}g`, position: 'top', fontSize: 9, fill: '#CC3311', offset: 10 }} />
              <Bar dataKey="pms" name="PMS (g)" radius={[3, 3, 0, 0]} maxBarSize={barSize}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={colorMap.get(entry.treatmentBase) || '#0077BB'} />
                ))}
                <LabelList dataKey="pms" content={labelRenderer} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peso Corrigido 14% */}
        <ChartCard title="Peso Corrigido 14% (kg)" subtitle="Cada barra = 1 repetição individual" minWidth={minChartWidth}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 25, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgCorrected} stroke="#CC3311" strokeDasharray="4 4" strokeWidth={3.5} label={{ value: `Média: ${avgCorrected.toFixed(2)}kg`, position: 'top', fontSize: 9, fill: '#CC3311', offset: 10 }} />
              <Bar dataKey="correctedWeight" name="Peso Corr. 14%" radius={[3, 3, 0, 0]} maxBarSize={barSize}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={colorMap.get(entry.treatmentBase) || '#0077BB'} />
                ))}
                <LabelList dataKey="correctedWeight" content={labelRenderer} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
