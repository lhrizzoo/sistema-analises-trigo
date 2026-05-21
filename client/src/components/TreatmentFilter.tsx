/*
 * Design: Precision Agriculture Dashboard
 * Filtros de tratamento com badges de contagem, estilo pill buttons
 * NOVO: Botão de relatório por grupo de tratamento
 */
import { FileUp, Download } from 'lucide-react';

interface TreatmentFilterProps {
  treatments: string[];
  counts: Map<string, number>;
  selected: string;
  onSelect: (treatment: string) => void;
  treatmentReports?: Map<string, { file: string; fileName: string }>;
  onReportUpload?: (treatment: string, file: string, fileName: string) => void;
  onReportDownload?: (treatment: string) => void;
}

export default function TreatmentFilter({ 
  treatments, 
  counts, 
  selected, 
  onSelect,
  treatmentReports,
  onReportUpload,
  onReportDownload
}: TreatmentFilterProps) {
  return (
    <section className="mb-6">
      <div className="section-label mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: 'var(--primary)' }} />
        Tratamentos
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {treatments.map(t => {
          const isActive = t === selected;
          const count = counts.get(t) || 0;
          return (
            <button
              key={t}
              onClick={() => onSelect(t)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
              style={{
                background: isActive ? 'var(--primary)' : 'var(--card)',
                color: isActive ? 'var(--primary-foreground)' : 'var(--foreground)',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              {t}
              <span
                className="font-data text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--muted)',
                  color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
        
        {/* Relatório do grupo selecionado */}
        <div className="ml-auto flex items-center gap-2">
          <label className="p-2 rounded-md hover:bg-blue-50 transition-colors cursor-pointer" title="Upload relatório para o grupo">
            <FileUp className="w-4 h-4 text-blue-600" />
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onReportUpload) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    onReportUpload(selected, evt.target?.result as string, file.name);
                  };
                  reader.readAsDataURL(file);
                }
              }} 
            />
          </label>
          {treatmentReports?.get(selected) && onReportDownload && (
            <button 
              onClick={() => onReportDownload(selected)} 
              className="p-2 rounded-md hover:bg-green-50 transition-colors" 
              title="Download relatório"
            >
              <Download className="w-4 h-4 text-green-600" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
