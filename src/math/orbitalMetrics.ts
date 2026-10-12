/**
 * MÉTRICAS RADIAIS PARA O ENMARCADO DA VISUALIZACIÓN
 * ==================================================
 * A visualización 3D necesitaba dous números que o código orixinal inventaba
 * con fórmulas máxicas (rango = n*10+5, boost = n⁶·500). Iso producía dous
 * defectos visuais graves, confirmados con capturas reais:
 *
 *   1. ENMARCADO: para n=1 o orbital ocupaba unha fracción mínima da caixa
 *      (un punto azul nunha pantalla negra); para n=7 quedaba cortado
 *      (r₉₅ = 105 a₀ nunha caixa de só 75 a₀ de semiancho).
 *   2. SATURACIÓN: o factor n⁶ facía que o alfa acumulado chegase ao tope no
 *      PRIMEIRO paso de integración para calquera orbital, de xeito que todos
 *      se vían como unha mancha saturada sen estrutura interna.
 *
 * Aquí os dous números derívanse da propia distribución de probabilidade
 * P(r) = r²|R_nl(r)|², de xeito que o enmarcado e a escala son comparables
 * entre orbitais distintos — que é xustamente o que precisa o alumnado para
 * poder comparar.
 */

import { radialWaveFunction } from './physics.ts';

export interface RadialMetrics {
  /** Raio que contén o 98% da probabilidade radial (unidades de a₀). */
  rContain: number;
  /** Radio máis probable: onde P(r) é máxima (a₀). */
  rMostProbable: number;
  /** Densidade máxima |ψ|² (produto radial × angular) (a₀⁻³). */
  maxDensity: number;
  /** Radio medio ⟨r⟩ = ∫rP(r)dr (a₀). */
  meanRadius: number;
  /** Número de nodos radiais (n−l−1). */
  nodes: number;
}

const Y00_SQUARED = 1 / (4 * Math.PI);

const cache = new Map<string, RadialMetrics>();

/**
 * Calcula as métricas radiais para un estado (n,l) e un tipo de orbital.
 * O resultado memorízase: só depende de n e l.
 */
export function getRadialMetrics(n: number, l: number, hybrid = false): RadialMetrics {
  const key = `${n}|${l}|${hybrid}`;
  const hit = cache.get(key);
  if (hit) return hit;

  // Malla radial logarítmica: densa no núcleo, ampla na cola exponencial.
  const rMax = Math.max(40, 14 * n * n);
  const steps = 4000;
  const r: number[] = new Array(steps + 1);
  const p: number[] = new Array(steps + 1);

  let total = 0;
  for (let i = 0; i <= steps; i++) {
    // Distribución de pasos cadrada para refinar preto da orixe
    const f = i / steps;
    const rr = f * f * rMax + 1e-9;
    r[i] = rr;
    const R = radialWaveFunction(n, l, rr);
    p[i] = rr * rr * R * R;
  }
  for (let i = 1; i <= steps; i++) total += ((p[i] + p[i - 1]) / 2) * (r[i] - r[i - 1]);
  if (total <= 0) total = 1;

  // r máis probable e radio de contención do 98%
  let rMostProbable = 0;
  let best = -1;
  let rContain = r[steps];
  let acc = 0;
  for (let i = 0; i <= steps; i++) {
    if (p[i] > best) {
      best = p[i];
      rMostProbable = r[i];
    }
    if (i > 0) acc += ((p[i] + p[i - 1]) / 2) * (r[i] - r[i - 1]);
    if (acc / total >= 0.98) {
      rContain = r[i];
      break;
    }
  }

  // Radio medio
  let num = 0;
  for (let i = 1; i <= steps; i++) {
    const dr = r[i] - r[i - 1];
    const avg = ((r[i] * p[i] + r[i - 1] * p[i - 1]) / 2) * dr;
    num += avg;
  }
  const meanRadius = num / total;

  // Densidade máxima radial |R(r)|². Emprégase só como referencia de escala
  // para normalizar a textura 3D (evita o factor máxico n⁶ que saturaba todo).
  // Para l=0 o máximo está en r→0; para l>0 o máximo radial está fóra do núcleo.
  let maxRadialDensity = 0;
  for (let i = 0; i <= steps; i++) {
    const R = radialWaveFunction(n, l, r[i]);
    const d = R * R;
    if (d > maxRadialDensity) maxRadialDensity = d;
  }

  const metrics: RadialMetrics = {
    rContain,
    rMostProbable,
    maxDensity: maxRadialDensity * Y00_SQUARED,
    meanRadius,
    nodes: Math.max(0, n - l - 1),
  };

  cache.set(key, metrics);
  return metrics;
}

/**
 * Semiancho da caixa de visualización en unidades de a₀.
 * Orixinal: n*10+5  →  causaba mal enmarcado en ambos extremos.
 * Agora derívase da contención real do 98% cunha marxe do 22%.
 */
export function getVisualizationRange(n: number, l: number, hybrid = false): number {
  if (hybrid) {
    // Os híbridos constrúense con orbitais n=2; unha caixa fixa é axeitada
    // e permite comparar sp, sp² e sp³ entre si.
    return 14;
  }
  const { rContain } = getRadialMetrics(n, l);
  return rContain * 1.22;
}
