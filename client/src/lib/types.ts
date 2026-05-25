export interface Analysis {
  id: string;
  treatment: string;
  cultivar: string;
  repetition: string;
  sampleWeight: number;
  moisture: number;
  seedWeight1000: number;
  harvestedArea: number | null;
  treatmentBase: string;
  reportFile?: string; // Base64 encoded file
  reportFileName?: string;
}

export interface AnalysisWithCalculations extends Analysis {
  correctedWeight14: number;
  productivityKgHa: number | null;
}

export interface TreatmentStats {
  treatment: string;
  count: number;
  avgMoisture: number;
  stdMoisture: number;
  cvMoisture: number;
  avgSeedWeight1000: number;
  stdSeedWeight1000: number;
  cvSeedWeight1000: number;
  avgCorrectedWeight14: number;
  stdCorrectedWeight14: number;
  cvCorrectedWeight14: number;
  avgProductivityKgHa: number | null;
  stdProductivityKgHa: number | null;
  cvProductivityKgHa: number | null;
}

export type SortField = 'treatment' | 'sampleWeight' | 'moisture' | 'seedWeight1000' | 'correctedWeight14' | 'productivityKgHa';
export type SortDirection = 'asc' | 'desc';
