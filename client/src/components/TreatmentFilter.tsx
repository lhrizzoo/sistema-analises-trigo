/*
 * Design: Precision Agriculture Dashboard
 * Filtros de tratamento com badges de contagem, estilo pill buttons
 * Agrupamento por empresa: Bayer (B1-B7), Yara, etc.
 */

interface TreatmentFilterProps {
  treatments: string[];
  counts: Map<string, number>;
  selected: string;
  onSelect: (treatment: string) => void;
}

// Mapeamento de tratamentos para empresa
const treatmentCompany: Record<string, string> = {
  'B1': 'Bayer', 'B2': 'Bayer', 'B3': 'Bayer', 'B4': 'Bayer', 'B5': 'Bayer', 'B6': 'Bayer', 'B7': 'Bayer',
  'Yara': 'Yara',
  'Foco': 'Foco',
  'BioAct': 'BioAct',
  'BioAgreen': 'BioAgreen',
  'C-Tec Crop': 'C-Tec Crop',
  'Leaf': 'Leaf',
  'Rizobacter': 'Rizobacter',
};

// Agrupar tratamentos por empresa
const groupedTreatments = (treatments: string[]) => {
  const groups: Record<string, string[]> = {};
  for (const t of treatments) {
    if (t === 'Todos') continue;
    const company = treatmentCompany[t] || t;
    if (!groups[company]) groups[company] = [];
    groups[company].push(t);
  }
  return groups;
};

export default function TreatmentFilter({ treatments, counts, selected, onSelect }: TreatmentFilterProps) {
  const groups = groupedTreatments(treatments);
  const companies = Object.keys(groups).sort();
  const isBayerSelected = companies.some(c => c === 'Bayer' && groups[c].some(t => selected === t));
  
  return (
    <section className="mb-6">
      <div className="section-label mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: 'var(--primary)' }} />
        Tratamentos
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Botão Todos */}
        <button
          onClick={() => onSelect('Todos')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
          style={{
            background: selected === 'Todos' ? 'var(--primary)' : 'var(--card)',
            color: selected === 'Todos' ? 'var(--primary-foreground)' : 'var(--foreground)',
            border: selected === 'Todos' ? '1px solid var(--primary)' : '1px solid var(--border)',
            boxShadow: selected === 'Todos' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          Todos
          <span
            className="font-data text-xs px-1.5 py-0.5 rounded-full"
            style={{
              background: selected === 'Todos' ? 'rgba(255,255,255,0.2)' : 'var(--muted)',
              color: selected === 'Todos' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            }}
          >
            {counts.get('Todos') || 0}
          </span>
        </button>

        {/* Botão Bayer (agrupa B1-B7) */}
        {groups['Bayer'] && (
          <button
            onClick={() => onSelect('Bayer')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
            style={{
              background: selected === 'Bayer' ? 'var(--primary)' : 'var(--card)',
              color: selected === 'Bayer' ? 'var(--primary-foreground)' : 'var(--foreground)',
              border: selected === 'Bayer' ? '1px solid var(--primary)' : '1px solid var(--border)',
              boxShadow: selected === 'Bayer' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            Bayer
            <span
              className="font-data text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: selected === 'Bayer' ? 'rgba(255,255,255,0.2)' : 'var(--muted)',
                color: selected === 'Bayer' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {groups['Bayer'].reduce((sum, t) => sum + (counts.get(t) || 0), 0)}
            </span>
          </button>
        )}

        {/* Outros tratamentos individuais */}
        {treatments.map(t => {
          if (t === 'Todos' || t.startsWith('B')) return null; // Skip Todos e Bayer items
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
      </div>
    </section>
  );
}
