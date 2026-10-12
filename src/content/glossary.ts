/**
 * GLOSARIO E RESUMO DE IDEAS ERRÓNEAS
 * ===================================
 * Dous materiais de estudo que faltaban:
 *
 *  - GLOSARIO: o vocabulario mínimo do tema, en galego. A aplicación usaba
 *    termos como «nodo», «fase» ou «isosuperficie» sen definilos, o que obriga
 *    o alumnado a traducir mentalmente do libro (en castelán) ao visor.
 *
 *  - IDEAS ERRÓNEAS: un resumo explícito, cunha columna de «por que é erróneo».
 *    A literatura sobre didáctica da química (Taber 2002; Nakiboğlu 2003)
 *    mostra que estas ideas son moi resistentes e que só se corrixen se se
 *    nomean e se confrontan de forma explícita.
 */

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Función de onda (ψ)',
    definition:
      'A función matemática que describe o estado do electrón. Pode ser positiva ou negativa, e o seu signo cambia nos nodos.',
  },
  {
    term: 'Densidade de probabilidade (|ψ|²)',
    definition:
      'O cadrado da función de onda. É sempre positiva e mide a probabilidade de atopar o electrón nun punto. A cor do visor reflicte o signo de ψ, non |ψ|².',
  },
  {
    term: 'Orbital',
    definition:
      'A rexión do espazo onde é máis probable atopar o electrón, descrita por unha función de onda. Non é unha órbita nin un recipiente.',
  },
  {
    term: 'Nodo',
    definition:
      'Superficie (esférica, plana ou cónica) onde a función de onda vale cero, así que a probabilidade de atopar o electrón alí é exactamente nula. Se a superficie é unha ESFERA, o nodo é radial; se é un PLANO ou un CONO, é angular.',
  },
  {
    term: 'Nodo radial',
    definition:
      'Superficie nodal esférica, centrada no núcleo. Nun orbital hai n − l − 1 nodos radiais.',
  },
  {
    term: 'Nodo angular',
    definition:
      'Nodo que PASA POLO NÚCLEO e que pode ser un plano ou un cono (no d_z² son dous conos). Nun orbital hai exactamente l nodos angulares. Distinguilos dos radiais: os angulares conteñen o núcleo, os radiais non.',
  },
  {
    term: 'Lóbulo',
    definition:
      'Cada unha das rexións dun orbital onde a densidade é apreciable e o signo de ψ mantense constante. Un orbital p ten dous lóbulos separados por un plano nodal; un d ten catro, agás o d_z², que ten dous lóbulos e un anel.',
  },
  {
    term: 'Fase',
    definition:
      'O signo da función de onda nunha rexión (positivo ou negativo). No visor représentase con dúas cores. Dous lóbulos de fase oposta sepáranse por un nodo.',
  },
  {
    term: 'Número cuántico principal (n)',
    definition:
      'Toma valores 1, 2, 3... Determina a enerxía (no hidróxeno) e o tamaño característico do orbital, que crece aproximadamente como n².',
  },
  {
    term: 'Número cuántico acimutal (l)',
    definition:
      'Toma valores 0, 1, 2... ata n − 1. Determina a FORMA do orbital (s, p, d, f) e o número de nodos angulares.',
  },
  {
    term: 'Número cuántico magnético (m)',
    definition:
      'Toma valores enteiros de −l a +l. Determina a ORIENTACIÓN espacial. Hai 2l + 1 orientacións distintas para cada l.',
  },
  {
    term: 'Orbital real',
    definition:
      'Combinación de orbitais complexos que dá formas dirixidas (p_x, d_xy...). Son os que se usan para explicar enlaces e xeometrías.',
  },
  {
    term: 'Orbital complexo',
    definition:
      'Solución exacta da ecuación de Schrödinger con m definido. Para m ≠ 0 a densidade é constante ao xirar arredor de z, así que teñen forma de anel e non de lóbulo.',
  },
  {
    term: 'Orbital híbrido',
    definition:
      'Combinación lineal de orbitais do mesmo átomo (por exemplo 2s e 2p) para dar catro orbitais equivalentes. É un MODELO para explicar as xeometrías observadas, non unha entidade que exista antes de formarse o enlace.',
  },
  {
    term: 'Isosuperficie',
    definition:
      'Superficie que une todos os puntos cun mesmo valor de densidade. É unha convención de representación: o orbital non «remata» nesa superficie.',
  },
  {
    term: 'Distribución radial P(r)',
    definition:
      'A probabilidade de atopar o electrón a unha distancia r, sumando todas as direccións: P(r) = r²|R(r)|². Anúlase en r = 0 aínda que ψ(0) ≠ 0, porque non hai volume no centro.',
  },
  {
    term: 'Dexeneración',
    definition:
      'Situación na que varios orbitais teñen a mesma enerxía. No hidróxeno, todos os orbitais cun mesmo n están dexenerados.',
  },
  {
    term: 'Regra de n + l (regra de Madelung)',
    definition:
      'Nos átomos con moitos electróns, a orde de enchemento vai por valor crecente de n + l. Se dous orbitais EMPATAN en n + l, enchese antes o de n menor. Exemplo de empate: 3d (3+2 = 5) e 4p (4+1 = 5), e vaise primeiro ao 3d. Explica por que o 4s (4) se enche antes ca o 3d (5).',
  },
];

export interface MisconceptionEntry {
  wrong: string;
  right: string;
  /** Referencia (clave de REFERENCES) que documenta esta idea errónea. */
  source: string;
}

/**
 * Referencias citables.
 *
 * POR QUE ESTÁN AQUÍ E NON SÓ NO CÓDIGO: a aplicación afirma que certas ideas
 * erróneas «están documentadas na investigación». Un material docente
 * universitario non pode facer esa afirmación sen dicir ONDE. Estas son as
 * referencias reais consultadas para elaborar o contido (metadatos verificados
 * vía Crossref; ver research/ no repositorio).
 */
export const REFERENCES: Record<string, string> = {
  taber2002:
    'Taber, K. S. (2002). Conceptualizing quanta: illuminating the ground state of student understanding of atomic orbitals. Chemistry Education Research and Practice, 3(2), 145-158.',
  tsaparlis2002:
    'Tsaparlis, G. & Papaphotis, G. (2002). Quantum-chemical concepts: are they suitable for secondary students? Chemistry Education Research and Practice, 3(2), 129-144.',
  tsaparlis2009:
    'Tsaparlis, G. & Papaphotis, G. (2009). High-school students’ conceptual difficulties and attempts at conceptual change: the case of basic quantum chemical concepts. International Journal of Science Education, 31(7), 895-930.',
  nakiboglu2003:
    'Nakiboğlu, C. (2003). Instructional misconceptions of Turkish prospective chemistry teachers about atomic orbitals and hybridization. Chemistry Education Research and Practice, 4(2), 171-188.',
};

/** Clave abreviada para amosar na interface. */
export function shortReference(key: string): string {
  const map: Record<string, string> = {
    taber2002: 'Taber (2002)',
    tsaparlis2002: 'Tsaparlis & Papaphotis (2002)',
    tsaparlis2009: 'Tsaparlis & Papaphotis (2009)',
    nakiboglu2003: 'Nakiboğlu (2003)',
  };
  return map[key] ?? key;
}

/**
 * Resumo das ideas erróneas documentadas na literatura e tratadas nesta
 * aplicación. A columna dereita é a corrección que hai que interiorizar.
 */
export const MISCONCEPTIONS: MisconceptionEntry[] = [
  {
    wrong: 'Un orbital é a órbita que segue o electrón arredor do núcleo.',
    right:
      'Non hai traxectoria. O orbital describe unha distribución de probabilidade. A coincidencia de que o radio medre como n² en Bohr e aquí é numérica, non conceptual.',
    source: 'tsaparlis2002',
  },
  {
    wrong: 'A nube electrónica é un obxecto físico que se pode fotografar.',
    right:
      'É unha representación dunha función matemática. As imaxes de nubes son modelos, non fotografías.',
    source: 'taber2002',
  },
  {
    wrong: 'A cor indica a cantidade de electrón (máis cor, máis electrón).',
    right:
      'A cor indica o SIGNO de ψ. Nun orbital hai como máximo dous electróns, e a súa probabilidade repártese por igual entre os lóbulos.',
    source: 'taber2002',
  },
  {
    wrong: 'ψ e |ψ|² son o mesmo, só que un leva cadrado.',
    right:
      'ψ pode ser negativa e cambia de signo nos nodos; |ψ|² é sempre positiva e é a que dá a probabilidade. A cor representa ψ; a intensidade, |ψ|².',
    source: 'taber2002',
  },
  {
    wrong: 'Un plano nodal é unha parede que o electrón non pode atravesar.',
    right:
      'É unha superficie onde a probabilidade de atopar o electrón é cero. Non hai barreira física: simplemente alí a función de onda anúlase.',
    source: 'tsaparlis2009',
  },
  {
    wrong: 'Os orbitais s non teñen nodos.',
    right:
      'Non teñen nodos ANGULARES, pero si RADIAIS: un 3s ten 2 e un 4s ten 3.',
    source: 'tsaparlis2009',
  },
  {
    wrong: 'O orbital d_z² ten catro lóbulos, coma os demais d.',
    right:
      'Ten dous lóbulos sobre o eixe z e un anel no plano xy, e os seus dous nodos son CÓNICOS, non planos.',
    source: 'tsaparlis2009',
  },
  {
    wrong: 'd_xy e d_x²−y² son o mesmo orbital con outro nome.',
    right:
      'Teñen a mesma forma, pero xiran 45° un respecto do outro: d_x²−y² apunta aos eixes e d_xy ás diagonais.',
    source: 'nakiboglu2003',
  },
  {
    wrong: 'Os orbitais híbridos existen no carbono illado antes de enlazarse.',
    right:
      'Son un modelo de combinación lineal de 2s e 2p que describe a xeometría observada. Nun carbono illado os electróns ocupan 2s e 2p.',
    source: 'nakiboglu2003',
  },
  {
    wrong: 'A isosuperficie que debuxa o visor é o bordo do átomo.',
    right:
      'É unha superficie de densidade constante, escollida por convención. O orbital non remata aí: a probabilidade segue diminuíndo cara a fóra. Baixa o nivel da isosuperficie e verás como «crece» sen que o orbital cambie.',
    source: 'taber2002',
  },
  {
    wrong: 'O radio máis probable e o radio medio son o mesmo.',
    right:
      'Non o son. Nun 1s o máis probable está a 0,53 Å e o medio a 0,79 Å. A gráfica amosa os dous valores para que se vexa a diferenza.',
    source: 'tsaparlis2009',
  },
];
