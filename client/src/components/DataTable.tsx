/*
 * Design: Precision Agriculture Dashboard
 * Tabela de dados com cabeçalho verde escuro, campos calculados destacados
 * Colunas de resultado com fundo verde-menta claro
 * Edição in-place: todos os campos são editáveis
 * O registro permanece no mesmo grupo (aba) mesmo se o nome do tratamento mudar
 * porque o filtro usa treatmentBase (original) e não o nome atual
 */
import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Calculator, CopyPlus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Analysis, AnalysisWithCalculations } from '@/lib/types';

interface DataTableProps {
  analyses: AnalysisWithCalculations[];
  onUpdate: (id: string, updates: Partial<Analysis>) => void;
  onDelete: (id: string) => void;
  onAdd: (analysis: Omit<Analysis, 'id'>) => void;
  onUpdateAllAreas?: (area: number) => void;
}

const emptyForm = {
  treatment: '',
  cultivar: '',
  repetition: '',
  sampleWeight: '',
  moisture: '',
  seedWeight1000: '',
  harvestedArea: '',
};

export default function DataTable({ analyses, onUpdate, onDelete, onAdd, onUpdateAllAreas }: DataTableProps) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [bulkArea, setBulkArea] = useState('');
  const [showBulkArea, setShowBulkArea] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editRowRef = useRef<HTMLTableRowElement>(null);

  // Scroll to editing row when entering edit mode
  useEffect(() => {
    if (editingId && editRowRef.current) {
      editRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [editingId]);

  const handleAdd = () => {
    if (!form.treatment.trim() || !form.sampleWeight || !form.moisture || !form.seedWeight1000) {
      toast.error('Preencha pelo menos: Tratamento, Peso, Umidade e PMS');
      return;
    }
    onAdd({
      treatment: form.treatment.trim(),
      cultivar: form.cultivar.trim(),
      repetition: form.repetition.trim(),
      sampleWeight: parseFloat(form.sampleWeight),
      moisture: parseFloat(form.moisture),
      seedWeight1000: parseFloat(form.seedWeight1000),
      harvestedArea: form.harvestedArea ? parseFloat(form.harvestedArea) : null,
    });
    setForm(emptyForm);
    toast.success('Registro adicionado com sucesso');
  };

  const startEdit = (a: AnalysisWithCalculations) => {
    // Cancel any pending delete confirmation
    setConfirmDeleteId(null);
    setEditingId(a.id);
    setEditForm({
      treatment: a.treatment,
      cultivar: a.cultivar,
      repetition: a.repetition,
      sampleWeight: String(a.sampleWeight),
      moisture: String(a.moisture),
      seedWeight1000: String(a.seedWeight1000),
      harvestedArea: a.harvestedArea !== null ? String(a.harvestedArea) : '',
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    const newWeight = parseFloat(editForm.sampleWeight);
    const newMoisture = parseFloat(editForm.moisture);
    const newPMS = parseFloat(editForm.seedWeight1000);
    
    if (isNaN(newWeight) || isNaN(newMoisture) || isNaN(newPMS)) {
      toast.error('Valores numéricos inválidos');
      return;
    }

    // Update all fields including treatment name
    // treatmentBase is preserved automatically by useAnalyses
    onUpdate(editingId, {
      treatment: editForm.treatment.trim(),
      cultivar: editForm.cultivar.trim(),
      repetition: editForm.repetition.trim(),
      sampleWeight: newWeight,
      moisture: newMoisture,
      seedWeight1000: newPMS,
      harvestedArea: editForm.harvestedArea ? parseFloat(editForm.harvestedArea) : null,
    });
    
    toast.success(`"${editForm.treatment}" atualizado com sucesso`);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    toast.info('Edição cancelada');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
      toast.success(`"${name}" excluído`);
    } else {
      setConfirmDeleteId(id);
      toast.warning(`Clique novamente para confirmar a exclusão de "${name}"`, { duration: 3000 });
      // Auto-cancel after 3 seconds
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 3000);
    }
  };

  const handleBulkArea = () => {
    const area = parseFloat(bulkArea);
    if (!area || area <= 0 || !onUpdateAllAreas) return;
    onUpdateAllAreas(area);
    setBulkArea('');
    setShowBulkArea(false);
    toast.success(`Área de ${area} m² aplicada a todos os registros visíveis`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const inputClass = "w-full px-2 py-1.5 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)] font-data";
  const inputClassSmall = "w-full px-1.5 py-1 text-xs border rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--ring)] font-data";

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="section-label flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: 'var(--primary)' }} />
          Dados de Entrada e Resultados
        </div>

        {/* Botão para aplicar área em massa */}
        {onUpdateAllAreas && (
          <div className="flex items-center gap-2">
            {showBulkArea ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--primary)', background: 'var(--result-bg)' }}>
                <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                  Área (m²) para todos:
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ex: 10.8"
                  value={bulkArea}
                  onChange={e => setBulkArea(e.target.value)}
                  className="w-24 px-2 py-1 text-xs border rounded font-data bg-white focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                  onKeyDown={e => e.key === 'Enter' && handleBulkArea()}
                />
                <button
                  onClick={handleBulkArea}
                  className="px-2.5 py-1 rounded text-xs font-semibold text-white transition-colors"
                  style={{ background: 'var(--primary)' }}
                >
                  Aplicar
                </button>
                <button
                  onClick={() => { setShowBulkArea(false); setBulkArea(''); }}
                  className="p-1 rounded hover:bg-red-50"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowBulkArea(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-150"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
                title="Aplicar mesma área colhida a todos os registros"
              >
                <CopyPlus className="w-3.5 h-3.5" />
                Aplicar Área a Todos
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header-green">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Tratamento</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Cultivar</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Rep.</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Peso (kg)</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Umidade (%)</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">PMS (g)</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Área (m²)</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <span className="flex items-center justify-end gap-1">
                    <Calculator className="w-3 h-3" />
                    Peso Corr. 14%
                  </span>
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <span className="flex items-center justify-end gap-1">
                    <Calculator className="w-3 h-3" />
                    kg/ha
                  </span>
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider w-20">Ação</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((a, idx) => {
                const isEditing = editingId === a.id;
                const isConfirmingDelete = confirmDeleteId === a.id;

                return (
                  <tr
                    key={a.id}
                    ref={isEditing ? editRowRef : undefined}
                    className={`border-b transition-colors duration-100 ${isEditing ? 'ring-2 ring-inset' : 'hover:bg-[var(--muted)]'}`}
                    style={{
                      borderColor: 'var(--border)',
                      background: isEditing
                        ? 'oklch(0.96 0.02 145)' // light green highlight for editing row
                        : idx % 2 === 0 ? 'var(--card)' : 'var(--muted)',
                      ...(isEditing ? { '--tw-ring-color': 'var(--primary)' } as React.CSSProperties : {}),
                    }}
                  >
                    {isEditing ? (
                      <>
                        {/* All fields EDITABLE during edit mode */}
                        <td className="px-2 py-1.5">
                          <input
                            className={inputClassSmall}
                            value={editForm.treatment}
                            onChange={e => setEditForm(p => ({ ...p, treatment: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            autoFocus
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={inputClassSmall}
                            value={editForm.cultivar}
                            onChange={e => setEditForm(p => ({ ...p, cultivar: e.target.value }))}
                            onKeyDown={handleKeyDown}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={inputClassSmall}
                            value={editForm.repetition}
                            onChange={e => setEditForm(p => ({ ...p, repetition: e.target.value }))}
                            onKeyDown={handleKeyDown}
                          />
                        </td>
                        {/* Numeric fields */}
                        <td className="px-2 py-1.5">
                          <input
                            className={inputClassSmall}
                            type="number"
                            step="0.0001"
                            value={editForm.sampleWeight}
                            onChange={e => setEditForm(p => ({ ...p, sampleWeight: e.target.value }))}
                            onKeyDown={handleKeyDown}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={inputClassSmall}
                            type="number"
                            step="0.01"
                            value={editForm.moisture}
                            onChange={e => setEditForm(p => ({ ...p, moisture: e.target.value }))}
                            onKeyDown={handleKeyDown}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={inputClassSmall}
                            type="number"
                            step="0.01"
                            value={editForm.seedWeight1000}
                            onChange={e => setEditForm(p => ({ ...p, seedWeight1000: e.target.value }))}
                            onKeyDown={handleKeyDown}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={inputClassSmall}
                            type="number"
                            step="0.01"
                            value={editForm.harvestedArea}
                            onChange={e => setEditForm(p => ({ ...p, harvestedArea: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            placeholder="m²"
                          />
                        </td>
                        {/* Calculated fields show preview during edit */}
                        <td className="px-3 py-1.5 text-right font-data text-xs" style={{ background: 'var(--result-bg)' }}>
                          {(() => {
                            const w = parseFloat(editForm.sampleWeight);
                            const m = parseFloat(editForm.moisture);
                            if (!isNaN(w) && !isNaN(m)) {
                              return ((w * (100 - m)) / 86).toFixed(3);
                            }
                            return '—';
                          })()}
                        </td>
                        <td className="px-3 py-1.5 text-right font-data text-xs" style={{ background: 'var(--result-bg)' }}>
                          {(() => {
                            const w = parseFloat(editForm.sampleWeight);
                            const m = parseFloat(editForm.moisture);
                            const area = parseFloat(editForm.harvestedArea);
                            if (!isNaN(w) && !isNaN(m) && !isNaN(area) && area > 0) {
                              const corrected = (w * (100 - m)) / 86;
                              return ((corrected / area) * 10000).toFixed(1);
                            }
                            return '—';
                          })()}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                              title="Salvar (Enter)"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                              title="Cancelar (Esc)"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2 font-medium text-sm">{a.treatment}</td>
                        <td className="px-3 py-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>{a.cultivar || '—'}</td>
                        <td className="px-3 py-2 font-data text-sm">{a.repetition || '—'}</td>
                        <td className="px-3 py-2 text-right font-data text-sm">{a.sampleWeight.toFixed(4)}</td>
                        <td className="px-3 py-2 text-right font-data text-sm">{a.moisture.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-data text-sm">{a.seedWeight1000.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-data text-sm">{a.harvestedArea?.toFixed(2) ?? '—'}</td>
                        <td className="px-3 py-2 text-right font-data text-sm font-medium" style={{ background: 'var(--result-bg)', color: 'var(--accent-foreground)' }}>
                          {a.correctedWeight14.toFixed(3)}
                        </td>
                        <td className="px-3 py-2 text-right font-data text-sm font-medium" style={{ background: 'var(--result-bg)', color: 'var(--accent-foreground)' }}>
                          {a.productivityKgHa !== null ? a.productivityKgHa.toFixed(1) : '—'}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(a)}
                              className="p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors"
                              title="Editar registro"
                            >
                              <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                            </button>
                            <button
                              onClick={() => handleDelete(a.id, a.treatment)}
                              className={`p-1.5 rounded-md transition-colors ${isConfirmingDelete ? 'bg-red-100 ring-2 ring-red-400' : 'hover:bg-red-50'}`}
                              title={isConfirmingDelete ? 'Clique novamente para confirmar exclusão' : 'Excluir registro'}
                            >
                              {isConfirmingDelete ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              )}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {/* Add row */}
              <tr className="border-t-2" style={{ borderColor: 'var(--primary)', background: 'var(--card)' }}>
                <td className="px-2 py-2"><input className={inputClass} placeholder="Tratamento" value={form.treatment} onChange={e => setForm(p => ({ ...p, treatment: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAdd()} /></td>
                <td className="px-2 py-2"><input className={inputClass} placeholder="Cultivar" value={form.cultivar} onChange={e => setForm(p => ({ ...p, cultivar: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAdd()} /></td>
                <td className="px-2 py-2"><input className={inputClass} placeholder="Rep." value={form.repetition} onChange={e => setForm(p => ({ ...p, repetition: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAdd()} /></td>
                <td className="px-2 py-2"><input className={inputClass} type="number" step="0.0001" placeholder="0.0000" value={form.sampleWeight} onChange={e => setForm(p => ({ ...p, sampleWeight: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAdd()} /></td>
                <td className="px-2 py-2"><input className={inputClass} type="number" step="0.01" placeholder="0.00" value={form.moisture} onChange={e => setForm(p => ({ ...p, moisture: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAdd()} /></td>
                <td className="px-2 py-2"><input className={inputClass} type="number" step="0.01" placeholder="0.00" value={form.seedWeight1000} onChange={e => setForm(p => ({ ...p, seedWeight1000: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAdd()} /></td>
                <td className="px-2 py-2"><input className={inputClass} type="number" step="0.01" placeholder="m²" value={form.harvestedArea} onChange={e => setForm(p => ({ ...p, harvestedArea: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAdd()} /></td>
                <td className="px-3 py-2" style={{ background: 'var(--result-bg)' }} />
                <td className="px-3 py-2" style={{ background: 'var(--result-bg)' }} />
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={handleAdd}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    Adicionar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
