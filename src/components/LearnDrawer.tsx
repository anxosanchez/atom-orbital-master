import { useEffect, useRef } from 'react';
import { GraduationCap, X } from 'lucide-react';
import { useOrbitalStore } from '../store/useOrbitalStore';
import { LearnPanel } from './LearnPanel';

/**
 * CAIXÓN DE APRENDIZAXE
 * =====================
 * A secuencia guiada, o contexto forestal, as probas e o vocabulario
 * ocupaban 1875 px dentro dun panel lateral de 1000 px, así que as súas
 * pestanas quedaban FÓRA da pantalla e non eran accesibles en escritorio.
 *
 * Aqui convértense nun caixón despregable que se superpón á escena:
 *  - accesible desde calquera tamaño de pantalla,
 *  - péchase con Escape e mais premendo fóra,
 *  - o foco trasládase ao caixón ao abrir e volve ao botón ao pechar,
 *  - a escena queda visible detrás (fondo translúcido), de xeito que se pode
 *    ler un paso e mirar o orbital ao mesmo tempo, que é o obxectivo didáctico.
 */
export const LearnDrawer = () => {
  const open = useOrbitalStore((s) => s.learnOpen);
  const setOpen = useOrbitalStore((s) => s.setLearnOpen);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Escape para pechar + foco ao abrir
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    // Levar o foco ao caixón para que o teclado funcione dentro del
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('[role="tab"]')?.focus();
    }, 30);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, setOpen]);

  // Devolver o foco ao botón que abriu
  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      {/* Botón de apertura: sempre visible, fóra do panel lateral */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="caixon-aprendizaxe"
        className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-surface-1/85 px-3.5 py-2 text-[11px] font-semibold text-ink-2 shadow-lg shadow-black/40 backdrop-blur-xl transition-all hover:border-brand-400/40 hover:text-ink-1 lg:left-auto lg:right-[25.5rem] lg:top-3"
      >
        <GraduationCap size={15} aria-hidden="true" className="text-brand-300" />
        Aprender
      </button>

      {/* Caixón */}
      {open && (
        <div
          className="absolute inset-0 z-30 flex justify-end bg-surface-0/55 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            id="caixon-aprendizaxe"
            role="dialog"
            aria-modal="true"
            aria-label="Material de aprendizaxe"
            className="flex h-full w-full max-w-[42rem] flex-col border-l border-white/10 bg-surface-1/97 shadow-2xl shadow-black/60"
          >
            <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-card bg-gradient-to-br from-brand-400 to-hybrid-500 ring-1 ring-inset ring-white/20"
                >
                  <GraduationCap size={16} className="text-white" />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold leading-tight text-ink-1">
                    Material de aprendizaxe
                  </h2>
                  <p className="text-[10px] text-ink-3">
                    Secuencia guiada · contexto forestal · autoavaliación · vocabulario
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Pechar o material de aprendizaxe"
                className="rounded-control p-1.5 text-ink-3 transition-colors hover:bg-white/10 hover:text-ink-1"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <LearnPanel />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
