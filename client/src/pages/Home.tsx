/*
 * Design: Precision Agriculture Dashboard
 * Layout vertical de página única com seções bem demarcadas
 * Fundo off-white, cards brancos, resultados em verde-menta
 */
import Header from '@/components/Header';
import KPICards from '@/components/KPICards';
import TreatmentFilter from '@/components/TreatmentFilter';
import DataTable from '@/components/DataTable';
import Charts from '@/components/Charts';
import StatsTable from '@/components/StatsTable';
import ExportBar from '@/components/ExportBar';
import { useAnalyses } from '@/hooks/useAnalyses';

export default function Home() {
  const {
    analyses,
    filteredAnalyses,
    treatmentNames,
    treatmentCounts,
    selectedTreatment,
    setSelectedTreatment,
    addAnalysis,
    updateAnalysis,
    deleteAnalysis,
    stats,
  } = useAnalyses();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header totalAnalyses={analyses.length} />

      <main className="container py-6 flex-1">
        <KPICards analyses={filteredAnalyses} />

        <TreatmentFilter
          treatments={treatmentNames}
          counts={treatmentCounts}
          selected={selectedTreatment}
          onSelect={setSelectedTreatment}
        />

        <DataTable
          analyses={filteredAnalyses}
          onUpdate={updateAnalysis}
          onDelete={deleteAnalysis}
          onAdd={addAnalysis}
        />

        <Charts stats={stats} />

        <StatsTable stats={stats} />

        <ExportBar analyses={filteredAnalyses} stats={stats} />
      </main>

      <footer className="py-4 text-center text-xs" style={{ color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
        Sistema de Análise de Sementes — Trigo {new Date().getFullYear()}
      </footer>
    </div>
  );
}
