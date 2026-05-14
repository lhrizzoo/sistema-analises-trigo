/*
 * Design: Precision Agriculture Dashboard
 * Gráficos de barras profissionais com paleta acessível para daltônicos
 * Grid 2x2 em desktop, 1 coluna em mobile
 */
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import type { TreatmentStats } from '@/lib/types';
import { getChartColor } from '@/lib/chartColors';

interface ChartsProps {
  stats: TreatmentStats[];
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
      </div>
      <div className="w-full" style={{ height: 280 }}>
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

export default function Charts({ stats }: ChartsProps) {
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    stats.forEach((s, i) => map.set(s.treatment, getChartColor(i)));
    return map;
  }, [stats]);

  if (stats.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        <p className="text-sm">Nenhum dado disponível para gráficos.</p>
      </div>
    );
  }

  const productivityData = stats
    .filter(s => s.avgProductivityKgHa !== null)
    .map(s => ({
      name: s.treatment,
      value: s.avgProductivityKgHa!,
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

  const xAxisProps = {
    dataKey: 'name',
    tick: { fontSize: 10, fill: 'var(--muted-foreground)' },
    angle: -35,
    textAnchor: 'end' as const,
    height: 60,
    interval: 0,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Produtividade */}
        <ChartCard title="Produtividade (kg/ha)" subtitle="Média por tratamento — peso corrigido a 14%">
          {productivityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid {...gridProps} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="kg/ha" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {productivityData.map((entry, i) => (
                    <Cell key={entry.name} fill={colorMap.get(stats.find(s => s.avgProductivityKgHa === entry.value)?.treatment || '') || getChartColor(i)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Informe a área colhida para visualizar a produtividade
            </div>
          )}
        </ChartCard>

        {/* Umidade */}
        <ChartCard title="Umidade (%)" subtitle="Média por tratamento">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moistureData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Umidade %" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {moistureData.map((entry, i) => (
                  <Cell key={entry.name} fill={colorMap.get(entry.name) || getChartColor(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PMS */}
        <ChartCard title="Peso de Mil Sementes (g)" subtitle="Média por tratamento">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pmsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="PMS (g)" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {pmsData.map((entry, i) => (
                  <Cell key={entry.name} fill={colorMap.get(entry.name) || getChartColor(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peso Corrigido 14% */}
        <ChartCard title="Peso Corrigido 14% (kg)" subtitle="Média por tratamento">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={correctedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Peso Corr. 14%" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {correctedData.map((entry, i) => (
                  <Cell key={entry.name} fill={colorMap.get(entry.name) || getChartColor(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
