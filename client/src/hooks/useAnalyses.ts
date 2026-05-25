import { useState, useCallback, useMemo } from 'react';
import type { Analysis, AnalysisWithCalculations } from '@/lib/types';
import { withCalculations, calcTreatmentStats, getTreatmentBase } from '@/lib/calculations';
import { initialAnalyses } from '@/lib/initialData';

const STORAGE_KEY = 'trigo-analyses-v3';
const REPORTS_STORAGE_KEY = 'trigo-reports-v1';

function loadAnalyses(): Analysis[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge: update harvestedArea from initialData for records that have null area
        const initialMap = new Map(initialAnalyses.map(a => [a.id, a]));
        const merged = parsed.map((a: Analysis) => {
          const initial = initialMap.get(a.id);
          if (initial && (a.harvestedArea === null || a.harvestedArea === undefined) && initial.harvestedArea !== null) {
            return { ...a, harvestedArea: initial.harvestedArea };
          }
          return a;
        });
        saveAnalyses(merged);
        return merged;
      }
    }
  } catch { /* ignore */ }
  // First load: use initial data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAnalyses));
  return initialAnalyses;
}

function saveAnalyses(analyses: Analysis[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
}

function loadReports(): Map<string, { file: string; fileName: string }> {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    }
  } catch { /* ignore */ }
  return new Map();
}

function saveReports(reports: Map<string, { file: string; fileName: string }>) {
  const obj = Object.fromEntries(reports);
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(obj));
}

let nextId = Date.now();
function generateId(): string {
  return String(nextId++);
}

export function useAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>(loadAnalyses);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('Todos');
  const [treatmentReports, setTreatmentReports] = useState<Map<string, { file: string; fileName: string }>>(loadReports);

  const updateAndSave = useCallback((updater: (prev: Analysis[]) => Analysis[]) => {
    setAnalyses(prev => {
      const next = updater(prev);
      saveAnalyses(next);
      return next;
    });
  }, []);

  const addAnalysis = useCallback((analysis: Omit<Analysis, 'id'>) => {
    updateAndSave(prev => [...prev, { ...analysis, id: generateId() }]);
  }, [updateAndSave]);

  const updateAnalysis = useCallback((id: string, updates: Partial<Analysis>) => {
    updateAndSave(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [updateAndSave]);

  const deleteAnalysis = useCallback((id: string) => {
    updateAndSave(prev => prev.filter(a => a.id !== id));
  }, [updateAndSave]);

  /**
   * Aplica uma área colhida a todos os registros visíveis (filtrados)
   * ou a todos os registros se nenhum filtro estiver ativo
   */
  const updateAllAreas = useCallback((area: number, treatmentFilter?: string) => {
    updateAndSave(prev => prev.map(a => {
      if (treatmentFilter && treatmentFilter !== 'Todos') {
        const base = getTreatmentBase(a.treatment);
        if (base !== treatmentFilter) return a;
      }
      return { ...a, harvestedArea: area };
    }));
  }, [updateAndSave]);

  /**
   * Reseta os dados para o estado inicial
   */
  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAnalyses(initialAnalyses);
    saveAnalyses(initialAnalyses);
  }, []);

  const uploadReport = useCallback((treatment: string, file: string, fileName: string) => {
    const updated = new Map(treatmentReports);
    updated.set(treatment, { file, fileName });
    setTreatmentReports(updated);
    saveReports(updated);
  }, [treatmentReports]);

  const downloadReport = useCallback((treatment: string) => {
    const report = treatmentReports.get(treatment);
    if (report) {
      const link = document.createElement('a');
      link.href = report.file;
      link.download = report.fileName;
      link.click();
    }
  }, [treatmentReports]);

  // Analyses with calculations
  const analysesWithCalc = useMemo<AnalysisWithCalculations[]>(
    () => analyses.map(withCalculations),
    [analyses]
  );

  // Get unique treatment base names — usa treatmentBase salvo no registro (estável ao renomear)
  const treatmentNames = useMemo(() => {
    const bases = new Set<string>();
    for (const a of analyses) {
      bases.add(a.treatmentBase || getTreatmentBase(a.treatment));
    }
    return ['Todos', ...Array.from(bases).sort()];
  }, [analyses]);

  // Treatment counts
  const treatmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set('Todos', analyses.length);
    for (const a of analyses) {
      const base = a.treatmentBase || getTreatmentBase(a.treatment);
      counts.set(base, (counts.get(base) || 0) + 1);
    }
    return counts;
  }, [analyses]);

  // Filtered analyses
  const filteredAnalyses = useMemo(() => {
    if (selectedTreatment === 'Todos') return analysesWithCalc;
    return analysesWithCalc.filter(a => (a.treatmentBase || getTreatmentBase(a.treatment)) === selectedTreatment);
  }, [analysesWithCalc, selectedTreatment]);

  // Statistics — always compute from ALL data for charts, but also provide filtered stats
  const allStats = useMemo(
    () => calcTreatmentStats(analysesWithCalc),
    [analysesWithCalc]
  );

  const filteredStats = useMemo(
    () => selectedTreatment === 'Todos' ? allStats : calcTreatmentStats(filteredAnalyses),
    [allStats, filteredAnalyses, selectedTreatment]
  );

  return {
    analyses,
    analysesWithCalc,
    filteredAnalyses,
    treatmentNames,
    treatmentCounts,
    selectedTreatment,
    setSelectedTreatment,
    addAnalysis,
    updateAnalysis,
    deleteAnalysis,
    updateAllAreas,
    resetData,
    allStats,
    stats: filteredStats,
    treatmentReports,
    uploadReport,
    downloadReport,
  };
}
