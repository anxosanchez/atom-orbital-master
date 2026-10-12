/**
 * XERACIÓN DA TEXTURA 3D DE DENSIDADE
 * ===================================
 * Esta lóxica extraeuse do compoñente React por tres razóns:
 *
 *  1. É un cálculo puro: dada unha configuración de orbitais, produce un
 *     Float32Array. Pódese testear sen navegador (ver __tests__/texture.test.ts).
 *  2. É o traballo caro da aplicación (262 144 voxels na resolución por
 *     defecto). Ao vivir nun módulo illado pódese mover a un Web Worker sen
 *     tocar o compoñente.
 *  3. Evita que a física do bucle quede escondida nun `useMemo` de 60 liñas.
 *
 * Puntos cientificamente relevantes:
 *  - A densidade GARDA os valores reais de |ψ|² e normalízase polo máximo do
 *    propio orbital. Isto substitúe o antigo factor máxico `n⁶·500`, que
 *    saturaba o alfa no primeiro paso de integración e facía que todos os
 *    orbitais se viran como unha mancha plana.
 *  - Nun orbital complexo (m ≠ 0) a fase gárdase como 0.5 (cor única). Isto é
 *    deliberado: colorear por Re(ψ) debuxaba catro lóbulos falsos nun orbital
 *    que fisicamente ten |ψ| constante en φ (un toro).
 */

import { waveFunction, realWaveFunction, hybridWaveFunction } from './physics.ts';
import { getRadialMetrics } from './orbitalMetrics.ts';

export interface TextureRequest {
  type: 'complex' | 'real' | 'hybrid';
  n: number;
  l: number;
  m: number;
  hybridType: 'sp' | 'sp2' | 'sp3';
  hybridIndex: number;
  quality: number;
  /**
   * Expoñente de compresión da densidade (0 < gamma ≤ 1).
   *
   * POR QUE É NECESARIO: a densidade |ψ|² abrangue moitísimas ordes de
   * magnitude dentro da mesma caixa. Nun orbital 7s, entre o núcleo e o bordo
   * hai ~30 ordes de magnitude, así que cunha escala lineal todos os voxels
   * agás un núcleo minúsculo redondean a cero e o orbital vese EN NEGRO
   * (verificado con captura real). A compresión gamma ten que aplicarse AQUÍ,
   * ao construír a textura: se se fai no shader, os valores xa chegaron
   * esmagados a 0 e non hai nada que recuperar.
   */
  gamma?: number;
  /**
   * Amosar TODOS os híbridos do tipo á vez (só para `type === 'hybrid'`).
   *
   * IMPORTANTE (física): os híbridos son ortogonais entre si, así que SUMAR as
   * amplitudes daría unha función esférica e non se vería ningunha xeometría.
   * O que se fai é:
   *   - densidade = Σ |hᵢ|²  (a envolvente de probabilidade conxunta)
   *   - cor = índice do híbrido que DOMINA nese punto (gañador único)
   * Así vense os catro lóbulos tetraédricos de sp³ diferenciados por cor, que
   * é a confirmación visual da xeometría molecular.
   */
  allHybrids?: boolean;
}

/**
 * Paleta dos híbridos, en formato CSS. É a FONTE ÚNICA de cor para os híbridos:
 * o shader ten os mesmos valores en GLSL e un test comproba que coinciden.
 */
export const HYBRID_PALETTE: Record<'sp' | 'sp2' | 'sp3', string[]> = {
  sp: ['rgb(64,191,255)', 'rgb(255,115,38)'],
  sp2: ['rgb(64,191,255)', 'rgb(255,217,51)', 'rgb(230,64,242)'],
  sp3: ['rgb(64,204,255)', 'rgb(255,217,51)', 'rgb(38,242,140)', 'rgb(255,89,140)'],
};

/**
 * Nota: antes as cores dos híbridos estaban escritas DENTRO do shader e a lenda
 * tiña a súa propia copia. Ao pasar a mallas independentes, a cor é un uniform
 * por malla e `HYBRID_PALETTE` queda como única fonte, de xeito que xa non pode
 * haber divergencia entre o que se ve e o que di a lenda.
 */

export function hybridColorRgb(type: 'sp' | 'sp2' | 'sp3', index: number): string {
  const palette = HYBRID_PALETTE[type] ?? HYBRID_PALETTE.sp3;
  return palette[index % palette.length];
}

/** Número de orbitais dun tipo de hibridación. */
export function hybridCount(type: 'sp' | 'sp2' | 'sp3'): number {
  return type === 'sp' ? 2 : type === 'sp2' ? 3 : 4;
}



/**
 * Expoñente de reserva, usado se non hai datos abondos para calculalo.
 * Na práctica o expoñente calcúlase por orbital (ver `shapingExponent`).
 */
export const DEFAULT_SHAPING_GAMMA = 0.5;





/**
 * Resultado listo para subir á GPU como textura de 8 bits.
 *
 * POR QUE 8 BITS E NON Float32: un `Data3DTexture` con `THREE.FloatType` e
 * filtrado linear esixe a extensión `OES_texture_float_linear`. Cando non está
 * dispoñible (moitas GPU móbiles, Safari/iOS), as mostras da textura devolven
 * 0 e o orbital vese NEGRO ou como un punto, sen ningún erro en consola —
 * exactamente o defecto que se observou nun 7s mentres os datos de CPU eran
 * correctos. Unha textura de 8 bits con filtrado linear está soportada en
 * TODAS partes, a densidade xa está normalizada a [0,1] (polo que 8 bits abonda
 * para amosar) e ocupa catro veces menos memoria de GPU (1 MiB en vez de 4).
 */
export interface ByteTextureResult {
  data: Uint8Array;
  size: number;
  range: number;
  maxDensity: number;
  shapingGamma: number;
}

export interface TextureResult {
  data: Float32Array;
  size: number;
  /** Expoñente de compresión aplicado (calculado se non se fixou). */
  shapingGamma: number;
  /** Semiancho físico da caixa, en unidades de a₀. */
  range: number;
  /** Densidade máxima real do orbital (a₀⁻³), antes de normalizar. */
  maxDensity: number;
}

/** Semiancho da caixa de visualización en a₀. */
export function visualizationRange(req: Pick<TextureRequest, 'type' | 'n' | 'l'>): number {
  if (req.type === 'hybrid') return 11;
  // Marxe do 40% sobre o radio que contén o 98% da probabilidade. A densidade
  // xa é minúscula alí, pero cómpre ademais atenuar (ver `edgeTaper`) porque
  // a compresión gamma eleva as densidades pequenas e senón a bruma chega ao
  // bordo do cubo e debúxase o seu contorno — que é o "seccionamento cúbico"
  // que se observaba.
  return getRadialMetrics(req.n, req.l).rContain * 1.4;
}

/**
 * Atenuación cara ao bordo da caixa.
 *
 * O volume é un cubo finito, así que fóra del non hai datos: se a densidade
 * aínda ten un valor visible no bordo, o raymarch remata en seco e vese o
 * contorno do cubo. Aquí a densidade redúcese suavemente a cero entre o radio
 * que contén o 98% da probabilidade e o bordo. Non altera o orbital (a
 * atenuación empeza fóra da rexión onde está practicamente toda a
 * probabilidade), só elimina a bruma residual do recinto.
 */
function edgeTaper(r: number, rData: number, rEdge: number): number {
  if (r <= rData) return 1;
  if (r >= rEdge) return 0;
  const u = (r - rData) / (rEdge - rData); // 0..1
  const s = u * u * (3 - 2 * u); // smoothstep
  return 1 - s;
}

/** Converte o volume normalizado a un Uint8Array RGBA listo para a GPU. */
export function buildDensityVolumeBytes(req: TextureRequest): ByteTextureResult {
  const float = buildDensityVolume(req);
  const bytes = new Uint8Array(float.data.length);
  for (let i = 0; i < float.data.length; i++) {
    const v = float.data[i];
    bytes[i] = v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * 255);
  }
  return {
    data: bytes,
    size: float.size,
    range: float.range,
    maxDensity: float.maxDensity,
    shapingGamma: float.shapingGamma,
  };
}

/**
 * Escala do cubo en unidades de MUNDO.
 *
 * A malla é un cubo UNITARIO (`boxGeometry args={[1,1,1]}`), así que a súa
 * semiextensión en mundo é `escala × 0.5`. Para que o cubo ocupe sempre a mesma
 * rexión visible —e, polo tanto, TODOS os orbitais aparezan co mesmo tamaño en
 * pantalla, que é o requisito para comparalos (AUDIT.md D9)— a semiextensión
 * ten que ser CONSTANTE, é dicir `escala = 2 × TARGET_WORLD_HALF_EXTENT`.
 *
 * O cubo contén sempre ±range en a₀ (o rango físico está codificado na textura,
 * non na xeometría), así que non hai que escalar por `range`: facelo era un
 * erro que deixaba o 1s ao 18% do alto da pantalla e o 7s ao 0,6% — «minúsculo,
 * nin o 1% da área visible», tal como se reportou.
 */
export const TARGET_WORLD_HALF_EXTENT = 6;

/**
 * Devolve a escala do cubo unitario. É constante: ver a nota de arriba.
 * Mantense o parámetro para non cambiar as chamadas, pero non se usa.
 */
export function worldScaleForRange(): number {
  return TARGET_WORLD_HALF_EXTENT * 2;
}

/** Avalía a densidade |ψ|² e a fase nun punto (coordenadas esféricas). */
function densityAndPhase(
  req: TextureRequest,
  r: number,
  theta: number,
  phi: number,
): { dens: number; phase: number } {
  if (req.type === 'complex') {
    const psi = waveFunction(req.n, req.l, req.m, r, theta, phi);
    return {
      dens: psi.real * psi.real + psi.imag * psi.imag,
      // Cor única: ver nota da cabeceira
      phase: 0.5,
    };
  }
  if (req.type === 'real') {
    const val = realWaveFunction(req.n, req.l, req.m, r, theta, phi);
    return { dens: val * val, phase: val >= 0 ? 1 : 0 };
  }

  // Híbridos: un só, ou todos superpostos
  const count = hybridCount(req.hybridType);
  if (req.allHybrids) {
    let total = 0;
    let best = -1;
    let bestVal = 0;
    for (let i = 0; i < count; i++) {
      const v = hybridWaveFunction(req.hybridType, i, r, theta, phi);
      const d = v * v;
      total += d;
      if (d > bestVal) {
        bestVal = d;
        best = i;
      }
    }
    // Sen ningún híbrido con densidade apreciable, non hai nada que colorear.
    // Sen esta comprobación, o "gañador" queda definido en TODO o cubo (sempre
    // hai un índice maior, aínda que todos sexan ~0) e o resultado é un cubo
    // coloreado cos bordos visibles, en vez dos catro lóbulos tetraédricos.
    if (bestVal < 1e-9) {
      return { dens: 0, phase: 0.5 };
    }
    // O canal de fase codifica o índice gañador en (0,1), para que o shader
    // poida asignar unha cor distinta a cada híbrido.
    return { dens: total, phase: (best + 0.5) / count };
  }

  const val = hybridWaveFunction(req.hybridType, req.hybridIndex, r, theta, phi);
  return { dens: val * val, phase: val >= 0 ? 1 : 0 };
}

/**
 * Constrúe o volume de densidade normalizado, listo para un Data3DTexture.
 * Devolve un Float32Array RGBA onde:
 *   r = densidade normalizada a [0,1]
 *   g = fase (1 = ψ≥0, 0 = ψ<0, 0.5 = cor única para orbitais complexos)
 */
export function buildDensityVolume(req: TextureRequest): TextureResult {
  const size = req.quality;
  const range = visualizationRange(req);
  const data = new Float32Array(size * size * size * 4);
  const rData = req.type === 'hybrid' ? range * 0.75 : getRadialMetrics(req.n, req.l).rContain;
  let peak = 0;

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (z * size * size + y * size + x) * 4;
        const px = (x / (size - 1) - 0.5) * 2 * range;
        const py = (y / (size - 1) - 0.5) * 2 * range;
        const pz = (z / (size - 1) - 0.5) * 2 * range;
        const r = Math.sqrt(px * px + py * py + pz * pz);
        const theta = Math.acos(Math.max(-1, Math.min(1, pz / (r + 1e-6))));
        const phi = Math.atan2(py, px);

        const raw = densityAndPhase(req, r, theta, phi);
        // Atenuación suave cara ao bordo do cubo (ver edgeTaper)
        const taper = edgeTaper(r, rData, range);
        const dens = raw.dens * taper;
        const phase = raw.phase;
        data[i] = dens;
        data[i + 1] = phase;
        data[i + 2] = 0;
        data[i + 3] = 1;
        if (dens > peak) peak = dens;
      }
    }
  }

  // ---- Escala ----
  // Normalización polo máximo do orbital e unha compresión de potencia sinxela.
  //
  // Por que se simplificou: a versión anterior encadeaba normalización por
  // percentil + transferencia logarítmica + etapa de contraste, con dous
  // parámetros expostos na interface. O resultado era imprevisible e, segundo a
  // revisión do profesorado, peor ca a versión orixinal. Unha potencia simple
  // dá un gradiente suave e previsible, que é o que se quere para ensinar.
  //
  // `gamma` baixa = máis brillo na parte difusa; 1.0 = lineal.
  const shaping = Math.max(0.05, Math.min(1, req.gamma ?? DEFAULT_SHAPING_GAMMA));
  const inv = peak > 0 ? 1 / peak : 1;
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] * inv;
    data[i] = v > 0 ? Math.pow(v, shaping) : 0;
  }

  return { data, size, range, maxDensity: peak, shapingGamma: shaping };
}
