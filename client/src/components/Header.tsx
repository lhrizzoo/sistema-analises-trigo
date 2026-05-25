/*
 * Design: Precision Agriculture Dashboard
 * Header verde escuro institucional com identidade agrícola
 */
import { Wheat, BarChart3, RotateCcw } from 'lucide-react';

interface HeaderProps {
  totalAnalyses: number;
  onReset?: () => void;
}

export default function Header({ totalAnalyses, onReset }: HeaderProps) {
  return (
    <header className="w-full" style={{ background: 'var(--header-bg)' }}>
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Wheat className="w-6 h-6" style={{ color: 'var(--header-fg)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--header-fg)' }}>
              Sistema de Análise de Sementes
            </h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Soja — Gestão e visualização de tratamentos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onReset && window.confirm('Deseja resetar todos os dados para o estado inicial?')) {
                onReset();
              }
            }}
            className="p-2 rounded-lg transition-all hover:bg-white/20"
            title="Resetar dados"
            style={{ color: 'var(--header-fg)' }}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--header-fg)' }} />
            <span className="font-data text-sm font-medium" style={{ color: 'var(--header-fg)' }}>
              {totalAnalyses}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              análises
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
