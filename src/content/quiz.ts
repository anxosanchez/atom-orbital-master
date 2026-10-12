/**
 * AUTOAVALIACIÓN
 * ==============
 * Cuestións de opción múltiple con retroalimentación explicativa.
 *
 * Decisión didáctica clave: os DISTRACTORES non son aleatorios. Cada opción
 * incorrecta corresponde a unha concepción errónea documentada na literatura
 * (Taber 2002; Tsaparlis & Papaphotis 2002, 2009; Nakiboğlu 2003). Así, se o
 * alumnado escolle un distractor, a retroalimentación pode dicirlle exactamente
 * QUE idea errónea está a aplicar — que é moito máis útil que un simple
 * "incorrecto".
 *
 * Cada pregunta leva unha referencia ao control do visor que axuda a
 * comprobar a resposta na propia aplicación.
 */

export interface QuizOption {
  text: string;
  correct: boolean;
  /** Explicación que se amosa ao escollela. */
  feedback: string;
  /** Etiqueta da idea errónea, se é un distractor documentado. */
  misconception?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  /** Que facer no visor para comprobalo. */
  verify: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'psi-vs-density',
    question:
      'Nun orbital 2p, a cor rosa dun lóbulo e a azul do outro indican dúas cousas distintas. Que significa exactamente esa diferenza?',
    verify: 'Nube + orbital 2p. Activa e desactiva o "Modo densidade" para ver que se perde.',
    options: [
      {
        text: 'Que os dous lóbulos teñen signo oposto na función de onda ψ.',
        correct: true,
        feedback:
          'Correcto. A cor codifica o SIGNO de ψ, non a cantidade de electrón. Onde ψ troca de signo hai un nodo, e alí a probabilidade é cero.',
      },
      {
        text: 'Que hai o dobre de electróns nun lóbulo ca no outro.',
        correct: false,
        feedback:
          'Non. Nun orbital caben como máximo dous electróns, e só se distinguen polo seu spin (principio de exclusión de Pauli). A probabilidade dun electrón repártese por igual entre os dous lóbulos, así que a cor non pode indicar cantidade de electróns.',
        misconception: 'Reificación da nube: interpretar a cor como "cantidade de electrón".',
      },
      {
        text: 'Que un lóbulo é positivo (máis probable) e o outro negativo (menos probable).',
        correct: false,
        feedback:
          'Atención: "positivo" e "negativo" refírense ao SIGNO da función de onda, non á probabilidade. A probabilidade é |ψ|², que sempre é positiva. Os dous lóbulos teñen exactamente a mesma probabilidade.',
        misconception: 'Confundir o signo de ψ coa magnitude de |ψ|².',
      },
    ],
  },
  {
    id: 'radial-nodes',
    question: 'Cantos nodos RADIAIS ten un orbital 4s?',
    verify: 'Pon n = 4, l = 0 e conta as liñas amarelas discontinuas da gráfica.',
    options: [
      {
        text: '3',
        correct: true,
        feedback:
          'Correcto: nodos radiais = n − l − 1 = 4 − 0 − 1 = 3. Son superficies ESFÉRICAS onde a probabilidade é cero.',
      },
      {
        text: '4',
        correct: false,
        feedback:
          'Non. Para l = 0 non hai nodos angulares, así que os nodos totais coinciden cos radiais. Para un 4s o número de nodos radiais é n − l − 1 = 4 − 0 − 1 = 3, non 4.',
        misconception: 'Usar n en vez de n − l − 1.',
      },
      {
        text: '0',
        correct: false,
        feedback:
          'Non. Os orbitais s poden ter nodos RADIAIS (esferas nodais), aínda que non teñan nodos angulares. Confundir "non ten nodos angulares" con "non ten nodos" é un erro frecuente.',
        misconception: 'Pensar que os orbitais s non teñen ningún nodo.',
      },
    ],
  },
  {
    id: 'bohr-orbit',
    question:
      'Ao aumentar n de 1 a 2, o radio máis probable do orbital multiplícase aproximadamente por 4. Que conclusión é correcta?',
    verify: 'Pon n = 1 e logo n = 2, e compara "Radio máis probable" baixo a gráfica.',
    options: [
      {
        text: 'O electrón pasa a xirar nunha órbita circular de radio 4 veces maior.',
        correct: false,
        feedback:
          'Este é o modelo de Bohr, que foi abandonado. Aquí non hai órbitas nin traxectorias: o que se cuadruplica é a distancia máis probable, calculada a partir de |ψ|². O electrón non "viaxa" por unha liña.',
        misconception: 'Persistencia do modelo planetario de Bohr.',
      },
      {
        text: 'A distancia máis probable cuadruplícase, pero o electrón non segue ningunha traxectoria: o que cambia é a distribución de probabilidade.',
        correct: true,
        feedback:
          'Correcto. A coincidencia numérica co modelo de Bohr (r ∝ n²) é enganosa: en Bohr é unha órbita, aquí é o máximo dunha distribución de probabilidade. Son conceptos físicos distintos.',
      },
      {
        text: 'O orbital vólvese 4 veces máis brillante porque hai máis probabilidade.',
        correct: false,
        feedback:
          'Non. A probabilidade total é sempre 1 (o electrón está nalgures). O que cambia é como se REPARTE no espazo: nun orbital maior a densidade local é menor, non maior.',
        misconception: 'Non comprender que a probabilidade total está normalizada a 1.',
      },
    ],
  },
  {
    id: 'hybrid-real',
    question: 'Que son exactamente os orbitais híbridos sp³ do carbono?',
    verify: 'Pasa a "Híbrido → sp³" e observa as catro direccións tetraédricas.',
    options: [
      {
        text: 'Orbitais reais que existen no átomo de carbono illado, antes de formar enlaces.',
        correct: false,
        feedback:
          'Non. Nun carbono illado os electróns ocupan 2s e 2p, non híbridos. A hibridación é un MODELO que describe a xeometría observada cando o carbono forma enlaces. Atribuírlle existencia física aos híbridos é unha das concepcións erróneas máis documentadas.',
        misconception:
          'Tomar a hibridación como un fenómeno físico previo ao enlace, en vez dun modelo (Nakiboğlu 2003).',
      },
      {
        text: 'Combinacións matemáticas de orbitais 2s e 2p que explican as xeometrías observadas.',
        correct: true,
        feedback:
          'Correcto. Son combinacións lineais (un modelo), non obxectos que se poidan fotografar. Funcionan moi ben para explicar o tetraedro do carbono na celulosa, pero non son "a realidade".',
      },
      {
        text: 'Orbitais atómicos que se forman cando o carbono absorbe enerxía e promove un electrón.',
        correct: false,
        feedback:
          'A promoción de electróns úsase nalgunhas explicacións introdutorias, pero a descrición correcta non require que o electrón "salte" antes de hibridar. A hibridación é unha descrición da densidade electrónica, non unha secuencia de sucesos.',
        misconception: 'Crer que os electróns se "promocionan" antes de hibridar.',
      },
    ],
  },
  {
    id: 'orbital-size',
    question:
      'Se comparas un orbital 1s cun 7s no visor, o 7s parece moito máis difuso. Por que?',
    verify: 'Pon n = 1 e logo n = 7, e compara a forma da gráfica P(r).',
    options: [
      {
        text: 'Porque ten máis electróns repartidos en máis capas.',
        correct: false,
        feedback:
          'Non. Nun átomo de hidróxeno hai UN só electrón, calquera que sexa n. Non hai "máis electróns" nin capas cheas: o que cambia é a distribución de probabilidade dese único electrón.',
        misconception: 'Supor que os orbitais se van enchendo de electróns.',
      },
      {
        text: 'Porque a probabilidade repártese por seis capas e un volume moito maior, así que a densidade local é menor.',
        correct: true,
        feedback:
          'Correcto. Nun 7s hai 6 nodos radiais e a probabilidade esténdese por un volume moito maior. A mesma probabilidade total (1) repartida nun volume maior dá menor densidade local — por iso se ve máis tenue.',
      },
      {
        text: 'Porque os orbitais grandes son menos importantes e o visor os debuxa con menos intensidade.',
        correct: false,
        feedback:
          'Non hai ningunha penalización artificial. É un efecto físico real: a densidade local diminúe ao aumentar n. O visor non "decide" amosalo máis tenue.',
        misconception: 'Atribuír a aparencia a unha decisión do programa e non á física.',
      },
    ],
  },
];
