/**
 * CONTIDO DIDÁCTICO
 * =================
 * Todo o texto que explica o que se está a ver. Este ficheiro é o que converte
 * o visor nun material de aprendizaxe: sen el, o alumnado ve unha mancha de cor
 * e non ten forma de saber que significa nin que debería aprender.
 *
 * Galego, adaptado a 1º do Grao en Enxeñaría Forestal (Universidade de Vigo).
 * Nivel: descritivo e cualitativo, sen cálculo diferencial.
 *
 * Referencias conceptuais: Griffiths (Introduction to Quantum Mechanics),
 * Levine (Quantum Chemistry), e a literatura sobre concepcións erróneas
 * (Taber 2002; Tsaparlis & Papaphotis 2002, 2009; Nakiboğlu 2003).
 */

import { getRadialMetrics } from '../math/orbitalMetrics.ts';

export interface OrbitalInfo {
  /** Etiqueta curta, p.ex. "3d" */
  label: string;
  /** Explicación principal (2-4 liñas). */
  what: string;
  /** Que hai que observar no visor. */
  look: string;
  /** Idea errónea frecuente que hai que desactivar. */
  misconception?: string;
}

const SUBSHELL = ['s', 'p', 'd', 'f', 'g', 'h'];

/** Nome canónico do orbital a partir de n, l, m (orbitais reais). */
export function orbitalLabel(n: number, l: number, m: number): string {
  const sub = SUBSHELL[l] ?? '?';
  if (l === 1) {
    const map: Record<number, string> = { 0: 'z', 1: 'x', '-1': 'y' };
    return `${n}p${map[m] ?? ''}`;
  }
  if (l === 2) {
    // Mapa verificado numericamente: m=+1 -> d_xz, m=-1 -> d_yz,
    // m=+2 -> d_x²−y², m=-2 -> d_xy, m=0 -> d_z²
    const map: Record<number, string> = { 0: 'z²', 1: 'xz', '-1': 'yz', 2: 'x²−y²', '-2': 'xy' };
    return `${n}d${map[m] ?? ''}`;
  }
  if (l === 0) return `${n}s`;
  return `${n}${sub}${m >= 0 ? '+' : ''}${m}`;
}

const S_INFO: Record<number, OrbitalInfo> = {
  1: {
    label: '1s',
    what: 'O orbital do electrón do hidróxeno no seu estado fundamental. É esférico: a probabilidade depende só da distancia ao núcleo, non da dirección. Non ten ningún nodo.',
    look: 'Xira a escena: a forma non cambia. O radio máis probable está a 1,0 a₀ (0,53 Å) e a probabilidade anúlase no núcleo porque P(r) leva un factor r².',
    misconception: 'A gráfica P(r) vale 0 en r = 0, pero |ψ(0)|² é máximo. O electrón non "evita" o núcleo: o que se anula é a probabilidade de atopalo a unha distancia exacta de cero, porque non hai volume alí.',
  },
  2: {
    label: '2s',
    what: 'Esférico, pero cunha capa interna e unha externa separadas por 1 nodo radial: unha superficie esférica onde a probabilidade de atopar o electrón é exactamente cero.',
    look: 'En modo isosuperficie distínguense as dúas capas. Compara con 1s: o orbital é moito máis grande, aínda que a forma xeral (esférica) é a mesma.',
    misconception: 'Que sexa máis grande non significa que o electrón "suba" a unha órbita máis alta, como nun sistema planetario. n non é un radio: é o número que fixa a enerxía e o tamaño característico.',
  },
  3: {
    label: '3s',
    what: 'Esférico con 2 nodos radiais. A densidade concéntrase en tres capas.',
    look: 'A gráfica P(r) mostra dous puntos onde se anula: os dous nodos radiais. Regra xeral: nº de nodos radiais = n − l − 1.',
  },
  4: {
    label: '4s',
    what: 'Esférico con 3 nodos radiais. É o orbital que se enche antes que o 3d nos elementos do cuarto período (K, Ca), porque a enerxía dos orbitais ordena por n + l: 4s ten 4+0 = 4 e 3d ten 3+2 = 5.',
    look: 'Comproba na gráfica canto se despraza o máximo cara a fóra ao aumentar n: o radio medra aproximadamente como n².',
  },
};

const P_INFO: Record<number, OrbitalInfo> = {
  0: {
    label: 'p_z',
    what: 'Dous lóbulos ao longo do eixe z, separados por un plano nodal: o plano xy, onde ψ = 0. Non hai nodos radiais.',
    look: 'Xira ata ver o plano xy de perfil: alí a densidade desaparece por completo. Os dous lóbulos teñen signos OPOSTOS de ψ (cores distintas).',
    misconception: 'Os lóbulos non son dúas "nubes de electróns". Hai un só electrón, e a cor indica o signo da función de onda, non a cantidade de electrón.',
  },
  1: {
    label: 'p_x',
    what: 'O mesmo que p_z pero orientado ao longo do eixe x. O plano nodal é o plano yz.',
    look: 'Compara con p_z xirando a escena: son idénticos agás a orientación. Isto é o que significa o número cuántico magnético m: a orientación espacial.',
  },
  '-1': {
    label: 'p_y',
    what: 'O mesmo, orientado ao longo do eixe y. Plano nodal: o plano xz.',
    look: 'Os tres orbitais p (x, y, z) son equivalentes enerxéticamente no hidróxeno: forman un conxunto dexenerado.',
  },
};

const D_INFO: Record<number, OrbitalInfo> = {
  0: {
    label: 'd_z²',
    what: 'Dous lóbulos grandes sobre o eixe z e un "anel" (toro) no plano xy. Os seus dous nodos angulares son SUPERFICIES CÓNICAS, non planos: é o único orbital d que non ten planos nodais.',
    look: 'É o único orbital d cunha forma que non é de catro lóbulos. Busca o anel central.',
  },
  1: {
    label: 'd_xz',
    what: 'Catro lóbulos entre os eixes x e z. Os seus dous planos nodais son os planos xy e yz.',
    look: 'Xira para ver que os lóbulos están nos cuadrantes do plano xz, NON sobre os eixes.',
    misconception: 'O nome "xz" non significa que o orbital estea sobre os eixes x e z, senón entre eles. O nome indica os planos que CONTÉN os lóbulos.',
  },
  '-1': {
    label: 'd_yz',
    what: 'Catro lóbulos entre os eixes y e z, con planos nodais xy e xz.',
    look: 'Compara con d_xz: mesma forma, xirando 90° arredor de z.',
  },
  2: {
    label: 'd_x²−y²',
    what: 'Catro lóbulos SOBRE os eixes x e y. Os planos nodais son os planos diagonais (x = ±y), non os planos coordenados.',
    look: 'Este orbital apunta directamente aos eixes. É importante en química de coordinación: d_x²−y² e d_z² son os que apuntan aos ligandos nun complexo octaédrico.',
  },
  '-2': {
    label: 'd_xy',
    what: 'Catro lóbulos ENTRE os eixes x e y, cos planos xz e yz como nodais.',
    look: 'Compara con d_x²−y²: mesma forma, xirando 45° arredor de z.',
    misconception: 'd_x²−y² e d_xy teñen a mesma forma pero distinta orientación. Confundilos é o erro máis común ao describir complexos de metais de transición.',
  },
};

const S_INFO_HIGH: OrbitalInfo = {
  label: 'ns',
  what: 'Todas as funcións s (l=0) son esféricas, independentemente de n. O que cambia con n é o número de capas e o tamaño.',
  look: 'Conta os nodos radiais na gráfica: deben ser n − 1. O radio máis probable crece aproximadamente como n².',
};

export function getOrbitalInfo(n: number, l: number, m: number): OrbitalInfo {
  if (l === 0) return S_INFO[n] ?? S_INFO_HIGH;
  if (l === 1) return P_INFO[m] ?? P_INFO[0];
  if (l === 2) return D_INFO[m] ?? D_INFO[0];
  return {
    label: orbitalLabel(n, l, m),
    what: `Orbital con n = ${n}, l = ${l}, m = ${m}. Ten ${n - l - 1} nodo(s) radial(is) e ${l} nodo(s) angular(is).`,
    look: 'A forma complícase rapidamente ao aumentar l. En Química Xeral só se adoitan estudar con detalle os orbitais s, p e d.',
  };
}

/** Texto cando se cambia a visualización entre nube e isosuperficie. */
export const MODE_EXPLANATION: Record<'cloud' | 'surface', string> = {
  cloud:
    'A NUBE mostra a densidade como unha bruma: onde hai máis cor, hai máis probabilidade de atopar o electrón. É a imaxe máis fiel á idea de |ψ|², pero os bordos son difusos.',
  surface:
    'A ISOSUPERFICIE debuxa só a superficie onde a densidade ten un valor fixo. É a imaxe que aparece nos libros de texto, pero cómpre ter claro que é unha convención: non é "a forma" do orbital nin unha parede. O orbital non remata aí.',
};

/** Explicación de cada tipo de orbital (complexo, real, híbrido). */
export const TYPE_EXPLANATION: Record<'complex' | 'real' | 'hybrid', string> = {
  complex:
    'ORBITAIS COMPLEXOS: son as solucións exactas da ecuación de Schrödinger para o átomo de hidróxeno, con número cuántico m ben definido. Cando m ≠ 0, |ψ| é constante ao xirar arredor do eixe z (forma de anel), polo que non teñen lóbulos de signo e se mostran dunha cor única. Con m = 0 a función é idéntica á real correspondente.',
  real:
    'ORBITAIS REAIS: combinacións dos complexos que dan formas dirixidas (do tipo p_x, d_xy...). Son os que se usan en química para explicar enlaces e xeometrías, e son os únicos que poden mostrarse con dous signos, xa que teñen nodos angulares reais.',
  hybrid:
    'ORBITAIS HÍBRIDOS: non son solucións do átomo de hidróxeno, senón combinacións lineais de orbitais 2s e 2p do mesmo átomo. Son un MODELO que explica as xeometrías observadas (lineal, trigonal plana, tetraédrica) e que funciona moi ben na química do carbono — a base da química da celulosa e da lignina.',
};

/** Conclusións clave que o alumnado debe levar. */
export const KEY_TAKEAWAYS = [
  'Un orbital NON é unha órbita nin un recipiente: é unha función matemática cuxo cadrado dá a probabilidade de atopar o electrón.',
  'A cor indica o SIGNO de ψ (fase). Onde ψ cambia de signo hai un nodo, e a probabilidade alí é exactamente cero.',
  'Nodos radiais = n − l − 1. Nodos angulares = l. Total = n − 1.',
  'O tamaño do orbital crece aproximadamente como n². Ao aumentar l dentro do mesmo n, a forma complícase e a densidade afástase do núcleo (a forza centrífuga efectiva).',
  'Os orbitais non son obxectos reais que se poidan fotografar: son o mellor modelo que temos para explicar a enerxía e o enlace.',
];

/** Anotacións numéricas (en Å) para a gráfica, calculadas da física real. */
export function getChartAnnotations(n: number, l: number) {
  const m = getRadialMetrics(n, l);
  const BOHR_TO_ANGSTROM = 0.529177;
  return {
    mostProbable: m.rMostProbable * BOHR_TO_ANGSTROM,
    meanRadius: m.meanRadius * BOHR_TO_ANGSTROM,
    contain98: m.rContain * BOHR_TO_ANGSTROM,
    nodes: m.nodes,
  };
}
