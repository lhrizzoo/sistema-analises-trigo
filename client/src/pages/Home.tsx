/*
 * Design: Precision Agriculture Dashboard
 * Layout vertical de página única com seções bem demarcadas
 * Fundo off-white, cards brancos, resultados em verde-menta
 * Gráficos mostram cada repetição individual como uma barra
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
    updateAllAreas,
    stats,
    treatmentReports,
    uploadReport,
    downloadReport,
  } = useAnalyses();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header totalAnalyses={analyses.length} onReset={resetData} />

      <main className="container py-6 flex-1">
        <KPICards analyses={filteredAnalyses} />

        <TreatmentFilter
          treatments={treatmentNames}
          counts={treatmentCounts}
          selected={selectedTreatment}
          onSelect={setSelectedTreatment}
          treatmentReports={treatmentReports}
          onReportUpload={uploadReport}
          onReportDownload={downloadReport}
        />

        <DataTable
          analyses={filteredAnalyses}
          onUpdate={updateAnalysis}
          onDelete={deleteAnalysis}
          onAdd={addAnalysis}
          onUpdateAllAreas={(area) => updateAllAreas(area, selectedTreatment)}
        />

        {/* Gráficos com cada repetição individual como barra */}
        <Charts analyses={filteredAnalyses} />

        <StatsTable stats={stats} />

        <ExportBar analyses={filteredAnalyses} stats={stats} />
      </main>

      <footer className="py-4 text-center text-xs" style={{ color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
        Sistema de Análise de Sementes — Trigo {new Date().getFullYear()}
      </footer>
    </div>
  );
}
