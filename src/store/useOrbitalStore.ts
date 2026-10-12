import { create } from 'zustand';

/**
 * ESTADO DA VISUALIZACIÓN
 * =======================
 * Ademais dos números cuánticos, gárdase todo o que a interface necesita para
 * ser usable e accesible:
 *  - `gamma` e `isovalue`: controlan o aspecto do volume sen factores máxicos.
 *  - `showNodes` / `showAxes`: capas didácticas que o alumnado pode acender.
 *  - `panelOpen`: o panel convértese en desprazable en pantallas pequenas.
 *  - `colorMode`: antes era estado morto (declarado e nunca lido); agora
 *    permite distinguir "fase" (signo de ψ) de "densidade" (só cantidade),
 *    que é a confusión conceptual máis documentada do alumnado.
 */

export type OrbitalType = 'complex' | 'real' | 'hybrid';
export type HybridType = 'sp' | 'sp2' | 'sp3';
export type VisualizationMode = 'cloud' | 'surface';
export type ColorMode = 'phase' | 'density';

interface OrbitalState {
  n: number;
  l: number;
  m: number;
  orbitalType: OrbitalType;
  hybridType: HybridType;
  hybridIndex: number;
  quality: number;
  opacity: number;
  gamma: number;
  isovalue: number;
  visualizationMode: VisualizationMode;
  colorMode: ColorMode;
  showAxes: boolean;
  showNodes: boolean;
  /**
   * Híbridos que se amosan superpostos, cada un nunha malla independente coa
   * súa propia cor. Permite escoller 1, 2, 3 ou 4 (sp³) e ver a xeometría
   * xirando a escena.
   */
  hybridSelection: number[];
  /** Hai un cálculo de volume en curso (amosado ao alumnado). */
  busy: boolean;
  /** Caixón de aprendizaxe despregado. */
  learnOpen: boolean;
  panelOpen: boolean;
  /** Orbital de comparación (null = desactivado). */
  compareWith: { n: number; l: number; m: number } | null;

  setN: (n: number) => void;
  setL: (l: number) => void;
  setM: (m: number) => void;
  setQuantum: (p: { n?: number; l?: number; m?: number }) => void;
  setOrbitalType: (type: OrbitalType) => void;
  setHybridType: (type: HybridType) => void;
  setHybridIndex: (index: number) => void;
  setVisualizationMode: (mode: VisualizationMode) => void;
  setColorMode: (mode: ColorMode) => void;
  setOpacity: (opacity: number) => void;
  setGamma: (gamma: number) => void;
  setIsovalue: (v: number) => void;
  setQuality: (quality: number) => void;
  setShowAxes: (v: boolean) => void;
  setShowNodes: (v: boolean) => void;
  setHybridSelection: (v: number[]) => void;
  setBusy: (v: boolean) => void;
  setLearnOpen: (v: boolean) => void;
  toggleHybrid: (index: number) => void;
  selectAllHybrids: () => void;
  setPanelOpen: (v: boolean) => void;
  setCompareWith: (v: { n: number; l: number; m: number } | null) => void;
  reset: () => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Coherencia dos números cuánticos: n ≥ 1, 0 ≤ l ≤ n−1, |m| ≤ l. */
function cohere(n: number, l: number, m: number) {
  const cn = clamp(Math.round(n), 1, 8);
  const cl = clamp(Math.round(l), 0, cn - 1);
  const cm = clamp(Math.round(m), -cl, cl);
  return { n: cn, l: cl, m: cm };
}

const DEFAULTS = {
  n: 3,
  l: 2,
  m: 0,
  orbitalType: 'real' as OrbitalType,
  hybridType: 'sp3' as HybridType,
  hybridIndex: 0,
  quality: 64,
  opacity: 0.55,
  gamma: 0.18,
  isovalue: 0.12,
  visualizationMode: 'cloud' as VisualizationMode,
  colorMode: 'phase' as ColorMode,
  showAxes: true,
  showNodes: false,
  hybridSelection: [0],
  busy: false,
  learnOpen: false,
  panelOpen: false,
  compareWith: null,
};

export const useOrbitalStore = create<OrbitalState>((set) => ({
  ...DEFAULTS,

  setN: (n) => set((s) => cohere(n, s.l, s.m)),
  setL: (l) => set((s) => cohere(s.n, l, s.m)),
  setM: (m) => set((s) => cohere(s.n, s.l, m)),
  setQuantum: (p) => set((s) => cohere(p.n ?? s.n, p.l ?? s.l, p.m ?? s.m)),

  setOrbitalType: (orbitalType) => set({ orbitalType }),
  setHybridType: (hybridType) =>
    set((s) => ({
      hybridType,
      // Índice sempre dentro do rango válido: antes podía quedar fóra e a
      // función devolvía 0 (orbital en branco) sen ningún erro visible.
      hybridIndex: clamp(s.hybridIndex, 0, hybridType === 'sp3' ? 3 : hybridType === 'sp2' ? 2 : 1),
      // O número de híbridos cambia co tipo: axustar a selección
      hybridSelection: [0],
  busy: false,
  learnOpen: false,
    })),
  setHybridIndex: (hybridIndex) =>
    set((s) => ({
      hybridIndex: clamp(
        hybridIndex,
        0,
        s.hybridType === 'sp3' ? 3 : s.hybridType === 'sp2' ? 2 : 1,
      ),
    })),

  setVisualizationMode: (visualizationMode) => set({ visualizationMode }),
  setColorMode: (colorMode) => set({ colorMode }),
  setOpacity: (opacity) => set({ opacity: clamp(opacity, 0.05, 1) }),
  setGamma: (gamma) => set({ gamma: clamp(gamma, 0.1, 1) }),
  setIsovalue: (isovalue) => set({ isovalue: clamp(isovalue, 0.02, 0.6) }),
  setQuality: (quality) => set({ quality: clamp(Math.round(quality), 24, 128) }),
  setShowAxes: (showAxes) => set({ showAxes }),
  setShowNodes: (showNodes) => set({ showNodes }),
  setHybridSelection: (hybridSelection) => set({ hybridSelection }),
  setBusy: (busy) => set({ busy }),
  setLearnOpen: (learnOpen) => set({ learnOpen }),
  toggleHybrid: (index) =>
    set((s) => {
      const has = s.hybridSelection.includes(index);
      const next = has
        ? s.hybridSelection.filter((i) => i !== index)
        : [...s.hybridSelection, index].sort((a, b) => a - b);
      // Nunca deixar a escena baleira
      return { hybridSelection: next.length > 0 ? next : [index] };
    }),
  selectAllHybrids: () =>
    set((s) => ({
      hybridSelection: Array.from(
        { length: s.hybridType === 'sp3' ? 4 : s.hybridType === 'sp2' ? 3 : 2 },
        (_, i) => i,
      ),
    })),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setCompareWith: (compareWith) => set({ compareWith }),
  reset: () => set({ ...DEFAULTS }),
}));
