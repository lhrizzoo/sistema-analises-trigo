import type { Analysis, AnalysisWithCalculations, TreatmentStats } from './types';

/**
 * Calcula o peso corrigido para 14% de umidade
 * Fórmula: PesoCorrigido = (PesoAtual × (100 - UmidadeAtual)) / (100 - 14)
 */
export function calcCorrectedWeight14(sampleWeight: number, moisture: number): number {
  const corrected = (sampleWeight * (100 - moisture)) / (100 - 14);
  return Math.round(corrected * 1000) / 1000; // 3 casas decimais
}

/**
 * Calcula a produtividade em kg/ha
 * Fórmula: kg/ha = (PesoCorrigido / AreaColhida) × 10000
 */
export function calcProductivityKgHa(correctedWeight14: number, harvestedArea: number | null): number | null {
  if (!harvestedArea || harvestedArea <= 0) return null;
  const productivity = (correctedWeight14 / harvestedArea) * 10000;
  return Math.round(productivity * 10) / 10; // 1 casa decimal
}

/**
 * Adiciona campos calculados a uma análise
 */
export function withCalculations(analysis: Analysis): AnalysisWithCalculations {
  const correctedWeight14 = calcCorrectedWeight14(analysis.sampleWeight, analysis.moisture);
  const productivityKgHa = calcProductivityKgHa(correctedWeight14, analysis.harvestedArea);
  return {
    ...analysis,
    correctedWeight14,
    productivityKgHa,
  };
}

/**
 * Calcula desvio padrão
 */
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calcula coeficiente de variação (%)
 */
function coeffVar(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  return (stdDev(values) / mean) * 100;
}

/**
 * Calcula estatísticas por tratamento
 */
export function calcTreatmentStats(analyses: AnalysisWithCalculations[]): TreatmentStats[] {
  const groups = new Map<string, AnalysisWithCalculations[]>();

  for (const a of analyses) {
    const key = getTreatmentBase(a.treatment);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }

  const stats: TreatmentStats[] = [];

  for (const [treatment, items] of groups) {
    const moistures = items.map(i => i.moisture);
    const seeds = items.map(i => i.seedWeight1000);
    const corrected = items.map(i => i.correctedWeight14);
    const productivities = items.filter(i => i.productivityKgHa !== null).map(i => i.productivityKgHa!);

    const avgMoisture = moistures.reduce((a: number, b: number) => a + b, 0) / moistures.length;
    const avgSeedWeight1000 = seeds.reduce((a: number, b: number) => a + b, 0) / seeds.length;
    const avgCorrectedWeight14 = corrected.reduce((a: number, b: number) => a + b, 0) / corrected.length;

    stats.push({
      treatment,
      count: items.length,
      avgMoisture: Math.round(avgMoisture * 100) / 100,
      stdMoisture: Math.round(stdDev(moistures) * 100) / 100,
      cvMoisture: Math.round(coeffVar(moistures) * 100) / 100,
      avgSeedWeight1000: Math.round(avgSeedWeight1000 * 100) / 100,
      stdSeedWeight1000: Math.round(stdDev(seeds) * 100) / 100,
      cvSeedWeight1000: Math.round(coeffVar(seeds) * 100) / 100,
      avgCorrectedWeight14: Math.round(avgCorrectedWeight14 * 1000) / 1000,
      stdCorrectedWeight14: Math.round(stdDev(corrected) * 1000) / 1000,
      cvCorrectedWeight14: Math.round(coeffVar(corrected) * 100) / 100,
      avgProductivityKgHa: productivities.length > 0
        ? Math.round((productivities.reduce((a: number, b: number) => a + b, 0) / productivities.length) * 10) / 10
        : null,
      stdProductivityKgHa: productivities.length > 1
        ? Math.round(stdDev(productivities) * 10) / 10
        : null,
      cvProductivityKgHa: productivities.length > 1
        ? Math.round(coeffVar(productivities) * 100) / 100
        : null,
    });
  }

  return stats.sort((a, b) => a.treatment.localeCompare(b.treatment));
}

/**
 * Extrai o nome base do tratamento (sem número de repetição)
 */
export function getTreatmentBase(treatment: string): string {
  return treatment.replace(/\s*\d+$/, '').trim();
}

/**
 * Extrai o número de repetição do tratamento
 */
export function getRepetitionNumber(treatment: string): string {
  const match = treatment.match(/(\d+)$/);
  return match ? match[1] : '';
}
