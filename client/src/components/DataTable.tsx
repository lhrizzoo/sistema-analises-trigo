/*
 * Design: Precision Agriculture Dashboard
 * Tabela de dados com cabeçalho verde escuro, campos calculados destacados
 * Colunas de resultado com fundo verde-menta claro
 */
import { useState } from 'react';
import { Pencil, Trash2, Check, X, Calculator } from 'lucide-react';
import type { Analysis, AnalysisWithCalculations } from '@/lib/types';

interface DataTableProps {
  analyses: AnalysisWithCalculations[];
  onUpdate: (id: string, updates: Partial<Analysis>) => void;
  onDelete: (id: string) => void;
  onAdd: (analysis: Omit<Analysis, 'id'>) => void;
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

export default function DataTable({ analyses, onUpdate, onDelete, onAdd }: DataTableProps) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const handleAdd = () => {
    if (!form.treatment.trim() || !form.sampleWeight || !form.moisture || !form.seedWeight1000) return;
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
  };

  const startEdit = (a: AnalysisWithCalculations) => {
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
    onUpdate(editingId, {
      treatment: editForm.treatment.trim(),
      cultivar: editForm.cultivar.trim(),
      repetition: editForm.repetition.trim(),
      sampleWeight: parseFloat(editForm.sampleWeight) || 0,
      moisture: parseFloat(editForm.moisture) || 0,
      seedWeight1000: parseFloat(editForm.seedWeight1000) || 0,
      harvestedArea: editForm.harvestedArea ? parseFloat(editForm.harvestedArea) : null,
    });
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const inputClass = "w-full px-2 py-1.5 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)] font-data";
  const inputClassSmall = "w-full px-1.5 py-1 text-xs border rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--ring)] font-data";

  return (
    <section className="mb-8">
      <div className="section-label mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: 'var(--primary)' }} />
        Dados de Entrada e Resultados
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
              {analyses.map((a, idx) => (
                <tr
                  key={a.id}
                  className="border-b transition-colors duration-100 hover:bg-[var(--muted)]"
                  style={{
                    borderColor: 'var(--border)',
                    background: idx % 2 === 0 ? 'var(--card)' : 'var(--muted)',
                  }}
                >
                  {editingId === a.id ? (
                    <>
                      <td className="px-2 py-1.5"><input className={inputClassSmall} value={editForm.treatment} onChange={e => setEditForm(p => ({ ...p, treatment: e.target.value }))} /></td>
                      <td className="px-2 py-1.5"><input className={inputClassSmall} value={editForm.cultivar} onChange={e => setEditForm(p => ({ ...p, cultivar: e.target.value }))} /></td>
                      <td className="px-2 py-1.5"><input className={inputClassSmall} value={editForm.repetition} onChange={e => setEditForm(p => ({ ...p, repetition: e.target.value }))} /></td>
                      <td className="px-2 py-1.5"><input className={inputClassSmall} type="number" step="0.0001" value={editForm.sampleWeight} onChange={e => setEditForm(p => ({ ...p, sampleWeight: e.target.value }))} /></td>
                      <td className="px-2 py-1.5"><input className={inputClassSmall} type="number" step="0.01" value={editForm.moisture} onChange={e => setEditForm(p => ({ ...p, moisture: e.target.value }))} /></td>
                      <td className="px-2 py-1.5"><input className={inputClassSmall} type="number" step="0.01" value={editForm.seedWeight1000} onChange={e => setEditForm(p => ({ ...p, seedWeight1000: e.target.value }))} /></td>
                      <td className="px-2 py-1.5"><input className={inputClassSmall} type="number" step="0.01" value={editForm.harvestedArea} onChange={e => setEditForm(p => ({ ...p, harvestedArea: e.target.value }))} placeholder="m²" /></td>
                      <td className="px-3 py-1.5 text-right font-data text-xs" style={{ background: 'var(--result-bg)' }}>—</td>
                      <td className="px-3 py-1.5 text-right font-data text-xs" style={{ background: 'var(--result-bg)' }}>—</td>
                      <td className="px-2 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={saveEdit} className="p-1 rounded hover:bg-green-100 text-green-700" title="Salvar"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={cancelEdit} className="p-1 rounded hover:bg-red-100 text-red-500" title="Cancelar"><X className="w-3.5 h-3.5" /></button>
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
                          <button onClick={() => startEdit(a)} className="p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors" title="Editar registro">
                            <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                          </button>
                          <button onClick={() => onDelete(a.id)} className="p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Excluir registro">
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {/* Add row */}
              <tr className="border-t-2" style={{ borderColor: 'var(--primary)', background: 'var(--card)' }}>
                <td className="px-2 py-2"><input className={inputClass} placeholder="Tratamento" value={form.treatment} onChange={e => setForm(p => ({ ...p, treatment: e.target.value }))} /></td>
                <td className="px-2 py-2"><input className={inputClass} placeholder="Cultivar" value={form.cultivar} onChange={e => setForm(p => ({ ...p, cultivar: e.target.value }))} /></td>
                <td className="px-2 py-2"><input className={inputClass} placeholder="Rep." value={form.repetition} onChange={e => setForm(p => ({ ...p, repetition: e.target.value }))} /></td>
                <td className="px-2 py-2"><input className={inputClass} type="number" step="0.0001" placeholder="0.0000" value={form.sampleWeight} onChange={e => setForm(p => ({ ...p, sampleWeight: e.target.value }))} /></td>
                <td className="px-2 py-2"><input className={inputClass} type="number" step="0.01" placeholder="0.00" value={form.moisture} onChange={e => setForm(p => ({ ...p, moisture: e.target.value }))} /></td>
                <td className="px-2 py-2"><input className={inputClass} type="number" step="0.01" placeholder="0.00" value={form.seedWeight1000} onChange={e => setForm(p => ({ ...p, seedWeight1000: e.target.value }))} /></td>
                <td className="px-2 py-2"><input className={inputClass} type="number" step="0.01" placeholder="m²" value={form.harvestedArea} onChange={e => setForm(p => ({ ...p, harvestedArea: e.target.value }))} /></td>
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
