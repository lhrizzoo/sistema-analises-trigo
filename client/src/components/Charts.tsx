/*
 * Design: Precision Agriculture Dashboard
 * Gráficos de barras profissionais com paleta acessível para daltônicos
 * Grid 2x2 em desktop, 1 coluna em mobile
 * CORREÇÃO: Todos os tratamentos sempre visíveis em todos os gráficos
 * CORREÇÃO: Produtividade mostra todos os tratamentos (0 para sem área)
 */
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, LabelList,
} from 'recharts';
import type { TreatmentStats } from '@/lib/types';
import { getChartColor } from '@/lib/chartColors';

interface ChartsProps {
  stats: TreatmentStats[];
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
      </div>
      <div className="w-full" style={{ height: 320 }}>
        {children}
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

// Custom label renderer for bar values
const renderBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value === undefined || value === null) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="var(--muted-foreground)"
      textAnchor="middle"
      fontSize={9}
      fontFamily="'JetBrains Mono', monospace"
    >
      {typeof value === 'number' ? (value >= 100 ? value.toFixed(0) : value.toFixed(1)) : value}
    </text>
  );
};

export default function Charts({ stats }: ChartsProps) {
  // Stable color map based on treatment name
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const sortedTreatments = [...stats].sort((a, b) => a.treatment.localeCompare(b.treatment));
    sortedTreatments.forEach((s, i) => map.set(s.treatment, getChartColor(i)));
    return map;
  }, [stats]);

  if (stats.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        <p className="text-sm">Nenhum dado disponível para gráficos.</p>
      </div>
    );
  }

  // CORREÇÃO: Produtividade mostra TODOS os tratamentos, com 0 para os sem área
  const hasAnyProductivity = stats.some(s => s.avgProductivityKgHa !== null);
  const productivityData = stats.map(s => ({
    name: s.treatment,
    value: s.avgProductivityKgHa ?? 0,
    hasData: s.avgProductivityKgHa !== null,
  }));

  const moistureData = stats.map(s => ({
    name: s.treatment,
    value: s.avgMoisture,
  }));

  const pmsData = stats.map(s => ({
    name: s.treatment,
    value: s.avgSeedWeight1000,
  }));

  const correctedData = stats.map(s => ({
    name: s.treatment,
    value: s.avgCorrectedWeight14,
  }));

  // Compute average for reference line
  const avgMoisture = moistureData.length > 0
    ? moistureData.reduce((s, d) => s + d.value, 0) / moistureData.length
    : 0;
  const avgPMS = pmsData.length > 0
    ? pmsData.reduce((s, d) => s + d.value, 0) / pmsData.length
    : 0;
  const avgCorrected = correctedData.length > 0
    ? correctedData.reduce((s, d) => s + d.value, 0) / correctedData.length
    : 0;

  // Dynamic bar size based on number of treatments
  const barSize = stats.length <= 7 ? 40 : stats.length <= 14 ? 28 : 20;

  const xAxisProps = {
    dataKey: 'name' as const,
    tick: { fontSize: stats.length > 10 ? 9 : 10, fill: 'var(--muted-foreground)' },
    angle: stats.length > 8 ? -40 : -25,
    textAnchor: 'end' as const,
    height: stats.length > 8 ? 70 : 55,
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

  return (
    <section className="mb-8" id="charts-container">
      <div className="section-label mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: 'var(--primary)' }} />
        Gráficos Comparativos por Tratamento
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Produtividade */}
        <ChartCard title="Produtividade (kg/ha)" subtitle="Média por tratamento — peso corrigido a 14%">
          {hasAnyProductivity ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid {...gridProps} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="kg/ha" radius={[4, 4, 0, 0]} maxBarSize={barSize}>
                  {productivityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.hasData
                        ? (colorMap.get(entry.name) || '#0077BB')
                        : '#E0E0E0'
                      }
                      opacity={entry.hasData ? 1 : 0.4}
                    />
                  ))}
                  <LabelList dataKey="value" content={renderBarLabel} />
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
        <ChartCard title="Umidade (%)" subtitle="Média por tratamento">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moistureData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgMoisture} stroke="#CC3311" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Média: ${avgMoisture.toFixed(1)}%`, position: 'insideTopRight', fontSize: 9, fill: '#CC3311' }} />
              <Bar dataKey="value" name="Umidade %" radius={[4, 4, 0, 0]} maxBarSize={barSize}>
                {moistureData.map((entry) => (
                  <Cell key={entry.name} fill={colorMap.get(entry.name) || '#0077BB'} />
                ))}
                <LabelList dataKey="value" content={renderBarLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PMS */}
        <ChartCard title="Peso de Mil Sementes (g)" subtitle="Média por tratamento">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pmsData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgPMS} stroke="#CC3311" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Média: ${avgPMS.toFixed(1)}g`, position: 'insideTopRight', fontSize: 9, fill: '#CC3311' }} />
              <Bar dataKey="value" name="PMS (g)" radius={[4, 4, 0, 0]} maxBarSize={barSize}>
                {pmsData.map((entry) => (
                  <Cell key={entry.name} fill={colorMap.get(entry.name) || '#0077BB'} />
                ))}
                <LabelList dataKey="value" content={renderBarLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peso Corrigido 14% */}
        <ChartCard title="Peso Corrigido 14% (kg)" subtitle="Média por tratamento">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={correctedData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgCorrected} stroke="#CC3311" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Média: ${avgCorrected.toFixed(2)}kg`, position: 'insideTopRight', fontSize: 9, fill: '#CC3311' }} />
              <Bar dataKey="value" name="Peso Corr. 14%" radius={[4, 4, 0, 0]} maxBarSize={barSize}>
                {correctedData.map((entry) => (
                  <Cell key={entry.name} fill={colorMap.get(entry.name) || '#0077BB'} />
                ))}
                <LabelList dataKey="value" content={renderBarLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
