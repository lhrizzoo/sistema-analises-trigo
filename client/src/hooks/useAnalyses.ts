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

  // Analyses with calculations
  const analysesWithCalc = useMemo<AnalysisWithCalculations[]>(
    () => analyses.map(withCalculations),
    [analyses]
  );

  // Get unique treatment base names
  const treatmentNames = useMemo(() => {
    const bases = new Set<string>();
    for (const a of analyses) {
      bases.add(getTreatmentBase(a.treatment));
    }
    return ['Todos', ...Array.from(bases).sort()];
  }, [analyses]);

  // Treatment counts
  const treatmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set('Todos', analyses.length);
    for (const a of analyses) {
      const base = getTreatmentBase(a.treatment);
      counts.set(base, (counts.get(base) || 0) + 1);
    }
    return counts;
  }, [analyses]);

  // Filtered analyses
  const filteredAnalyses = useMemo(() => {
    if (selectedTreatment === 'Todos') return analysesWithCalc;
    return analysesWithCalc.filter(a => getTreatmentBase(a.treatment) === selectedTreatment);
  }, [analysesWithCalc, selectedTreatment]);

  // Statistics
  const stats = useMemo(
    () => calcTreatmentStats(selectedTreatment === 'Todos' ? analysesWithCalc : filteredAnalyses),
    [analysesWithCalc, filteredAnalyses, selectedTreatment]
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
    stats,
  };
}
