/*
 * Design: Precision Agriculture Dashboard
 * KPI cards compactos com métricas-resumo no topo
 */
import { FlaskConical, Droplets, Scale, Wheat } from 'lucide-react';
import type { AnalysisWithCalculations } from '@/lib/types';

interface KPICardsProps {
  analyses: AnalysisWithCalculations[];
}

export default function KPICards({ analyses }: KPICardsProps) {
  if (analyses.length === 0) return null;

  const totalSamples = analyses.length;
  const avgMoisture = analyses.reduce((s, a) => s + a.moisture, 0) / analyses.length;
  const avgPMS = analyses.reduce((s, a) => s + a.seedWeight1000, 0) / analyses.length;
  const avgCorrected = analyses.reduce((s, a) => s + a.correctedWeight14, 0) / analyses.length;
  const withProductivity = analyses.filter(a => a.productivityKgHa !== null);
  const avgProductivity = withProductivity.length > 0
    ? withProductivity.reduce((s, a) => s + a.productivityKgHa!, 0) / withProductivity.length
    : null;

  const cards = [
    {
      icon: FlaskConical,
      label: 'Total de Amostras',
      value: String(totalSamples),
      unit: '',
      color: 'var(--primary)',
      bgColor: 'var(--secondary)',
    },
    {
      icon: Droplets,
      label: 'Umidade Média',
      value: avgMoisture.toFixed(2),
      unit: '%',
      color: '#0077BB',
      bgColor: '#E8F4FD',
    },
    {
      icon: Scale,
      label: 'PMS Médio',
      value: avgPMS.toFixed(1),
      unit: 'g',
      color: '#EE7733',
      bgColor: '#FFF3E8',
    },
    {
      icon: Wheat,
      label: 'Peso Corr. 14% Médio',
      value: avgCorrected.toFixed(3),
      unit: 'kg',
      color: '#009988',
      bgColor: '#E6F7F5',
    },
  ];

  if (avgProductivity !== null) {
    cards.push({
      icon: Wheat,
      label: 'Produtividade Média',
      value: avgProductivity.toFixed(1),
      unit: 'kg/ha',
      color: '#CC3311',
      bgColor: '#FDECEA',
    });
  }

  return (
    <section className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className="kpi-card rounded-lg p-3.5"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: card.bgColor }}
              >
                <card.icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
            </div>
            <div className="font-data text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {card.value}
              {card.unit && <span className="text-xs font-normal ml-1" style={{ color: 'var(--muted-foreground)' }}>{card.unit}</span>}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
