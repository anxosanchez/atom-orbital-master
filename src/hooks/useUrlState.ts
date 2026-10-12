import { useEffect } from 'react';
import { useOrbitalStore, type OrbitalType, type HybridType } from '../store/useOrbitalStore.ts';

/**
 * ESTADO COMPARTIBLE POR URL
 * ==========================
 * Permite que o profesorado ligue un exercicio ou unha comprobación concreta
 * directamente desde o enunciado, e que o alumnado comparta o que está a ver.
 *
 * Formato:  #n=3&l=2&m=0&tipo=real&modo=cloud&hib=sp3&hi=0&cm=phase&g=0.18&q=64
 *
 * Decisións de deseño:
 *
 *  - **Emprégase o fragmento (`#`), non a query string.** O fragmento non se
 *    envía ao servidor, así que funciona igual cun despregamento estático en
 *    GitHub Pages e non precisa ningunha configuración de servidor.
 *
 *  - **Só se escriben valores VALIDADOS.** Todo o que chega pola URL pasa por
 *    `setQuantum` e polos `set*` do store, que xa limitan os rangos. Isto é
 *    importante: antes de ler nada da URL, os valores numéricos compróbanse
 *    con `Number.isFinite` e as cadeas contra listas pechadas. Sen iso, unha
 *    URL manipulada podería introducir valores absurdos (por exemplo n=1e9,
 *    que bloquearía a xeración da textura).
 *
 *  - **A URL é a fonte de verdade só na carga inicial.** Despois, a aplicación
 *    escribe a URL, pero non a volve ler. Así evítanse bucles de sincronización
 *    e o comportamento é previsible ao moverse cos botóns do navegador.
 */

const TYPES: readonly OrbitalType[] = ['complex', 'real', 'hybrid'];
const HYBRIDS: readonly HybridType[] = ['sp', 'sp2', 'sp3'];

/** Le e aplica o estado da URL. Devolve true se aplicou algo. */
export function applyStateFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return false;

  const params = new URLSearchParams(hash);
  const store = useOrbitalStore.getState();
  let applied = false;

  const num = (key: string): number | null => {
    const raw = params.get(key);
    if (raw === null || raw.trim() === '') return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };

  // Os índices cuánticos van xuntos: coheréncianse de vez
  const n = num('n');
  const l = num('l');
  const m = num('m');
  if (n !== null || l !== null || m !== null) {
    // Valores enteiros e dentro do rango que admite o store
    const safeN = n === null ? undefined : Math.round(Math.max(1, Math.min(8, n)));
    const safeL = l === null ? undefined : Math.round(Math.max(0, Math.min(7, l)));
    const safeM = m === null ? undefined : Math.round(Math.max(-7, Math.min(7, m)));
    store.setQuantum({ n: safeN, l: safeL, m: safeM });
    applied = true;
  }

  const tipo = params.get('tipo');
  if (tipo && (TYPES as readonly string[]).includes(tipo)) {
    store.setOrbitalType(tipo as OrbitalType);
    applied = true;
  }

  const hib = params.get('hib');
  if (hib && (HYBRIDS as readonly string[]).includes(hib)) {
    store.setHybridType(hib as HybridType);
    applied = true;
  }

  const hi = num('hi');
  if (hi !== null) {
    store.setHybridIndex(Math.round(hi));
    applied = true;
  }

  const modo = params.get('modo');
  if (modo === 'cloud' || modo === 'surface') {
    store.setVisualizationMode(modo);
    applied = true;
  }

  const cm = params.get('cm');
  if (cm === 'phase' || cm === 'density') {
    store.setColorMode(cm);
    applied = true;
  }

  const g = num('g');
  if (g !== null) {
    store.setGamma(g);
    applied = true;
  }

  const q = num('q');
  if (q !== null) {
    store.setQuality(q);
    applied = true;
  }

  return applied;
}

/** Serializa o estado actual á URL (sen recargar). */
function writeStateToUrl(): void {
  if (typeof window === 'undefined') return;
  const s = useOrbitalStore.getState();
  const params = new URLSearchParams();
  params.set('n', String(s.n));
  params.set('l', String(s.l));
  params.set('m', String(s.m));
  params.set('tipo', s.orbitalType);
  if (s.orbitalType === 'hybrid') {
    params.set('hib', s.hybridType);
    params.set('hi', String(s.hybridIndex));
  }
  params.set('modo', s.visualizationMode);
  params.set('cm', s.colorMode);
  params.set('g', s.gamma.toFixed(2));
  params.set('q', String(s.quality));

  const next = `#${params.toString()}`;
  if (window.location.hash !== next) {
    // replaceState non engade entradas ao historial: evita que cada movemento
    // dun control deslizante inunde o botón "atrás" do navegador
    window.history.replaceState(null, '', next);
  }
}

/**
 * Sincroniza o estado do visor coa URL. Chámase unha soa vez no nivel superior.
 */
export function useUrlStateSync(): void {
  useEffect(() => {
    // 1) Ler o estado da URL antes de subscribirse, para non reescribila
    //    inmediatamente cos valores por defecto.
    applyStateFromUrl();
    // 2) A partir de aquí, a aplicación é a que escribe na URL.
    const unsubscribe = useOrbitalStore.subscribe(writeStateToUrl);
    writeStateToUrl();
    return unsubscribe;
  }, []);
}
