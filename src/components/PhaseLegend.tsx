import { useOrbitalStore } from '../store/useOrbitalStore';
import { HYBRID_PALETTE } from '../math/densityVolume';

/**
 * LENDA DE FASE
 * =============
 * Resolve dous problemas á vez:
 *
 *  1. ACCESIBILIDADE (WCAG 1.4.1). A fase transmitíase SÓ por cor. Simulado
 *     con deuteranopía, o rosa e o azul do shader colapsan á mesma matiz
 *     (~8% dos estudantes varóns non podían ler o signo de ψ, que é o punto
 *     central do recurso). Aquí a información duplícase con SÍMBOLOS (+ / −)
 *     e co nome, de xeito que non depende da cor.
 *
 *  2. CONCEPTUAL. A confusión ψ (con signo, con nodos) fronte a |ψ|²
 *     (densidade, sempre ≥ 0) é a idea errónea máis documentada nesta
 *     materia. A lenda explica explicitamente que a cor é o SIGNO.
 */

export const PhaseLegend = () => {
  const orbitalType = useOrbitalStore((s) => s.orbitalType);
  const colorMode = useOrbitalStore((s) => s.colorMode);
  const hybridSelection = useOrbitalStore((s) => s.hybridSelection);
  const hybridType = useOrbitalStore((s) => s.hybridType);

  const isComplex = orbitalType === 'complex';
  const isHybridStack = orbitalType === 'hybrid' && hybridSelection.length > 1;

  // A paleta vén dunha única fonte (HYBRID_PALETTE); un test comproba que
  // coincide coas cores escritas no shader.
  const hybridColors = HYBRID_PALETTE[hybridType] ?? HYBRID_PALETTE.sp3;
  const hybridCount = hybridColors.length;
  const SHAPE: Record<string, string> = {
    sp: 'lineal, 180°',
    sp2: 'trigonal plana, 120°',
    sp3: 'tetraédrica, 109,5°',
  };

  return (
    <aside
      aria-label="Lenda da representación de cores"
      className="absolute left-3 top-3 w-[min(17rem,calc(100%-1.5rem))] rounded-panel border border-white/8 bg-surface-1/85 p-3 text-[10px] leading-snug shadow-xl shadow-black/40 ring-1 ring-inset ring-white/5 backdrop-blur-xl lg:top-14"
    >
      {isHybridStack ? (
        <>
          <p className="mb-1.5 font-bold uppercase tracking-[0.12em] text-ink-2">
            Cada cor, un híbrido
          </p>
          <ul className="space-y-1">
            {hybridColors.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-white/40 text-[10px] font-black text-black/70"
                  style={{ backgroundColor: c }}
                >
                  {i + 1}
                </span>
                <span className="text-ink-2">
                  <span className="font-semibold text-ink-1">Híbrido {i + 1}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 border-t border-white/12 pt-1.5 text-ink-2">
            Os {hybridCount} lóbulos superpostos forman unha xeometría{' '}
            <span className="font-semibold text-ink-1">{SHAPE[hybridType]}</span>. Os números
            repiten a información da cor, para que se poida ler sen distinguir cores.
          </p>
          <p className="mt-1 text-ink-3">
            A densidade total é esférica (os híbridos son ortogonais entre si): o que revela a
            xeometría é <span className="font-semibold">que híbrido domina en cada dirección</span>,
            que é o que indica a cor.
          </p>
        </>
      ) : isComplex ? (
        <p className="text-ink-2">
          <span className="font-semibold text-ink-1">Orbital complexo.</span> A densidade |ψ|² é constante
          ao xirar arredor de <span className="font-mono">z</span>; non hai lóbulos de signo, polo que se
          emprega unha <span className="font-semibold text-ok-400">cor única</span>. Isto é correcto:
          un orbital 2p₊₁ ten forma de anel, non de catro lóbulos.
        </p>
      ) : colorMode === 'density' ? (
        <p className="text-ink-2">
          <span className="font-semibold text-ink-1">Modo densidade.</span> A cor indica SÓ a cantidade de
          probabilidade. Neste modo non se distingue o signo de ψ — úsao para comparar tamaños e formas,
          non signos.
        </p>
      ) : (
        <>
          <p className="mb-1.5 font-bold uppercase tracking-[0.12em] text-ink-2">Signo de ψ (fase)</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-white/40 text-[11px] font-black text-white"
                style={{ backgroundColor: 'rgb(242,76,173)' }}
              >
                +
              </span>
              <span className="text-ink-2">
                <span className="font-semibold text-ink-1">ψ positiva</span> (lóbulo claro)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-white/40 text-[11px] font-black text-white"
                style={{ backgroundColor: 'rgb(61,158,255)' }}
              >
                −
              </span>
              <span className="text-ink-2">
                <span className="font-semibold text-ink-1">ψ negativa</span> (lóbulo escuro)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-warn-400/60 bg-surface-0 text-[10px] font-black text-warn-300"
              >
                0
              </span>
              <span className="text-ink-2">
                <span className="font-semibold text-warn-300">Nodo</span>: ψ = 0, probabilidade nula
              </span>
            </li>
          </ul>
          <p className="mt-1.5 border-t border-white/12 pt-1.5 text-ink-3">
            Os <span className="font-semibold">símbolos + / −</span> repiten a información da cor, para
            que se poida ler sen distinguir cores.
          </p>
          <p className="mt-1 text-ink-3">
            A cor distingue o <span className="font-semibold">signo</span> de ψ, non a cantidade de
            electrón: iso indícao o tamaño e a intensidade da nube.
          </p>
        </>
      )}
    </aside>
  );
};
