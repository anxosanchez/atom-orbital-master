import { useMemo } from 'react';
import { X, Lightbulb, AlertTriangle, Eye } from 'lucide-react';
import { useOrbitalStore } from '../store/useOrbitalStore';
import {
  getOrbitalInfo,
  orbitalLabel,
  MODE_EXPLANATION,
  TYPE_EXPLANATION,
  KEY_TAKEAWAYS,
} from '../content/explanations';

/**
 * EXPLICACIÓN CONTEXTUAL
 * ======================
 * Este é o compoñente que converte o visor en material didáctico (AUDIT.md D2).
 * Sen texto, o alumnado ve unha mancha de cor e non ten forma de saber que
 * debería aprender. O contido actualízase automaticamente co estado.
 */

export const Explanation = ({ onClose }: { onClose: () => void }) => {
  const n = useOrbitalStore((s) => s.n);
  const l = useOrbitalStore((s) => s.l);
  const m = useOrbitalStore((s) => s.m);
  const orbitalType = useOrbitalStore((s) => s.orbitalType);
  const hybridType = useOrbitalStore((s) => s.hybridType);
  const hybridIndex = useOrbitalStore((s) => s.hybridIndex);
  const visualizationMode = useOrbitalStore((s) => s.visualizationMode);

  const info = useMemo(() => getOrbitalInfo(n, l, m), [n, l, m]);

  const angularNodes = orbitalType === 'hybrid' ? 0 : l;
  const radialNodes = orbitalType === 'hybrid' ? 0 : Math.max(0, n - l - 1);

  return (
    <section
      aria-label="Explicación didáctica"
      className="absolute right-3 top-3 flex max-h-[calc(100%-19rem)] w-[min(24rem,calc(100%-1.5rem))] flex-col overflow-y-auto rounded-panel border border-white/8 bg-surface-1/90 p-4 text-[12px] leading-relaxed shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/5 backdrop-blur-xl"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h2 className="text-[13px] font-semibold text-ink-1">
          {orbitalType === 'hybrid' ? (
            <>
              Híbrido <span className="font-mono text-purple-300">{hybridType}{hybridIndex + 1}</span>
            </>
          ) : (
            <>
              Orbital <span className="tnum font-mono text-brand-300">{orbitalLabel(n, l, m)}</span>
            </>
          )}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Pechar a explicación"
          className="shrink-0 rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      {orbitalType === 'hybrid' ? (
        <p className="text-ink-2">
          Os orbitais híbridos <span className="font-mono">{hybridType}</span> son combinacións de 2s e 2p.
          Este é o {hybridIndex + 1}º do conxunto. {TYPE_EXPLANATION.hybrid}
        </p>
      ) : (
        <p className="text-ink-2">{info.what}</p>
      )}

      <div className="mt-3 flex items-start gap-2 rounded-card border border-brand-500/25 bg-brand-900/35 p-2.5">
        <Eye size={14} className="mt-0.5 shrink-0 text-blue-300" aria-hidden="true" />
        <p className="text-ink-2">
          <span className="font-semibold text-brand-300">Observa: </span>
          {orbitalType === 'hybrid'
            ? 'Xira a escena e comproba como cada híbrido apunta a unha dirección distinta. No sp³ as catro direccións forman un tetraedro con ángulos de 109,5°.'
            : info.look}
        </p>
      </div>

      {info.misconception && orbitalType !== 'hybrid' && (
        <div className="mt-2 flex items-start gap-2 rounded-card border border-warn-400/25 bg-warn-400/10 p-2.5">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warn-300" aria-hidden="true" />
          <p className="text-ink-2">
            <span className="font-semibold text-warn-300">Coidado con isto: </span>
            {info.misconception}
          </p>
        </div>
      )}

      {/* Reconto de nodos: o obxectivo de aprendizaxe máis avaliado */}
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-white/8 pt-3 text-center">
        <div>
          <dt className="text-[9px] uppercase tracking-[0.14em] text-ink-3">Radiais</dt>
          <dd className="font-mono text-base font-bold text-warn-300">{radialNodes}</dd>
          <dd className="text-[9px] text-ink-4">n − l − 1</dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-[0.14em] text-ink-3">Angulares</dt>
          <dd className="font-mono text-base font-bold text-warn-300">{angularNodes}</dd>
          <dd className="text-[9px] text-ink-4">l</dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-[0.14em] text-ink-3">Totais</dt>
          <dd className="font-mono text-base font-bold text-warn-300">
            {orbitalType === 'hybrid' ? '—' : n - 1}
          </dd>
          <dd className="text-[9px] text-ink-4">n − 1</dd>
        </div>
      </dl>

      <p className="mt-2.5 rounded-lg border border-white/12 bg-white/5 p-2 text-[11px] text-ink-2">
        <span className="font-semibold text-white">
          {visualizationMode === 'cloud' ? 'Nube' : 'Isosuperficie'}:{' '}
        </span>
        {MODE_EXPLANATION[visualizationMode]}
      </p>

      <details className="mt-2 text-[11px]">
        <summary className="cursor-pointer font-semibold text-brand-300 hover:text-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
          Ideas clave que hai que levar
        </summary>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-ink-2">
          {KEY_TAKEAWAYS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </details>

      <p className="mt-2 flex items-start gap-1.5 text-[10px] text-ink-4">
        <Lightbulb size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
        Consello: cambia un número cuántico de cada vez e tenta PREDICIR o que pasará antes de movelo.
      </p>
    </section>
  );
};
