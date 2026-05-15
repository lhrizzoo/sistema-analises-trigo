import { useState, useCallback, useMemo } from 'react';
import type { Analysis, AnalysisWithCalculations } from '@/lib/types';
import { withCalculations, calcTreatmentStats, getTreatmentBase } from '@/lib/calculations';
import { initialAnalyses } from '@/lib/initialData';

const STORAGE_KEY = 'trigo-analyses-v1';

function loadAnalyses(): Analysis[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // First load: use initial data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAnalyses));
  return initialAnalyses;
}

function saveAnalyses(analyses: Analysis[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
}

let nextId = Date.now();
function generateId(): string {
  return String(nextId++);
}

export function useAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>(loadAnalyses);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('Todos');

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

  // Analyses with calculations
  const analysesWithCalc = useMemo<AnalysisWithCalculations[]>(
    () => analyses.map(withCalculations),
    [analyses]
  );

  // Get unique treatment base names
  const treatmentNames = useMemo(() => {
    const bases = new Set<string>();
    let hasBayer = false;
    for (const a of analyses) {
      const base = getTreatmentBase(a.treatment);
      if (/^B[1-7]$/.test(base)) {
        hasBayer = true;
      } else {
        bases.add(base);
      }
    }
    const result = ['Todos'];
    if (hasBayer) result.push('Bayer');
    result.push(...Array.from(bases).sort());
    return result;
  }, [analyses]);

  // Treatment counts
  const treatmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set('Todos', analyses.length);
    let bayerCount = 0;
    for (const a of analyses) {
      const base = getTreatmentBase(a.treatment);
      if (/^B[1-7]$/.test(base)) {
        bayerCount++;
      } else {
        counts.set(base, (counts.get(base) || 0) + 1);
      }
    }
    if (bayerCount > 0) counts.set('Bayer', bayerCount);
    return counts;
  }, [analyses]);

  // Filtered analyses
  const filteredAnalyses = useMemo(() => {
    if (selectedTreatment === 'Todos') return analysesWithCalc;
    if (selectedTreatment === 'Bayer') {
      return analysesWithCalc.filter(a => /^B[1-7]$/.test(getTreatmentBase(a.treatment)));
    }
    return analysesWithCalc.filter(a => getTreatmentBase(a.treatment) === selectedTreatment);
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
  };
}
