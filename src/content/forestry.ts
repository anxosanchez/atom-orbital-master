/**
 * ANCORAXE CURRICULAR FORESTAL
 * ============================
 * Este é o contido que responde á pregunta que se fai todo o alumnado dunha
 * carreira non-química: «para que me ensinan isto?».
 *
 * A guía docente de Química (P03G370V01204, 1º do Grao en Enxeñaría Forestal,
 * UVigo) pide no Tema 2, literalmente: «Descrición mecano-cuántica do átomo.
 * Propiedades periódicas. Enlace covalente. Xeometría e hibridación.
 * Polaridade. Enlace iónico e metálico. Forzas intermoleculares».
 *
 * Destes contidos, o visualizador cobre de seu a parte de orbitais e
 * hibridación. Este ficheiro engade a conexión explícita coa Enxeñaría
 * Forestal e cos contidos da guía que o visor non mostra por si só.
 *
 * IMPORTANTE: cada afirmación química de aquí é correcta e verificable. As
 * conexións forestais son cualitativas (nivel de 1º), non cuantitativas.
 */

export interface ForestryConnection {
  id: string;
  title: string;
  /** Que hai que mirar no visualizador para comprendelo. */
  orbitalBasis: string;
  /** Aplicación forestal concreta. */
  forestry: string;
  /** Contido da guía docente que cobre. */
  syllabus: string;
}

export const FORESTRY_CONNECTIONS: ForestryConnection[] = [
  {
    id: 'cellulose',
    title: 'A celulosa: o carbono sp³ que sostén a madeira',
    orbitalBasis:
      'Na glicosa, os carbonos do anel (C2 a C6) están hibridados sp³: catro orbitais híbridos que apuntan aos vértices dun tetraedro con ángulos de 109,5°. O carbono carbonílico (C1) é a excepción: está hibridado sp² e é plano. Abre "Híbrido → sp³" e xira a escena para ver as catro direccións.',
    forestry:
      'A celulosa é o polímero máis abundante da madeira (40-50% da masa seca). Os enlaces C−C e C−O da glicosa son σ, formados por solapamento frontal de orbitais sp³. A xeometría tetraédrica fixa os ÁNGULOS de enlace (109,5° nos carbonos sp³) e, nos osíxenos do anel glicosídico —que tamén son sp³—, fai que os enlaces saian en direccións que permiten que a cadea se estenda en liña recta. Cómpre non confundir as dúas cousas: o sp³ explica os ángulos, e son a configuración concreta do anel e mais os enlaces β-1,4 diequatoriais os que dan a forma lineal. Esa linealidade é a que permite que as cadeas se unan por enlaces de hidróxeno formando as microfibrillas que dan á madeira a súa resistencia á tracción.',
    syllabus: 'Xeometría e hibridación · Enlace covalente',
  },
  {
    id: 'lignin',
    title: 'A lignina: anelos aromáticos sp² e por que a madeira amarelece ao sol',
    orbitalBasis:
      'Os carbonos dos ANELOS AROMÁTICOS da lignina están hibridados sp²: tres enlaces σ nun plano a 120° e un orbital p perpendicular que forma enlaces π por solapamento lateral. As cadeas laterais alifáticas que unen eses anelos son sp³. Compara "Real → 2p" coa deslocalización π dos anelos; abre "Híbrido → sp²" para ver os 120°.',
    forestry:
      'A lignina (20-30% da madeira) é un polímero construído con unidades aromáticas (fenilpropano) unidas por cadeas alifáticas. Os anelos con enlaces π absorben radiación ultravioleta, e esa absorción é a causa de que a madeira exposta ao sol amareleza e se degrade superficialmente — un problema directo en carpintaría exterior e en produtos de madeira sen protector UV.',
    syllabus: 'Descrición mecano-cuántica do átomo · Enlace covalente',
  },
  {
    id: 'hydrogen',
    title: 'Enlaces de hidróxeno: por que a madeira absorbe auga',
    orbitalBasis:
      'Nos grupos -OH, o osíxeno é máis electronegativo que o hidróxeno e atrae os electróns do enlace. Esa polaridade é a que permite o enlace de hidróxeno.',
    forestry:
      'Os grupos hidroxilo (-OH) da celulosa forman enlaces de hidróxeno coa auga. Isto explica a higroscopicidade da madeira: por que se expande e contrae coa humidade, por que hai que secala antes de usala, e por que a madeira é un mal illante se queda húmida. É a base do secado industrial e do comportamento dimensional da madeira aserrada.',
    syllabus: 'Polaridade · Forzas intermoleculares',
  },
  {
    id: 'carbon',
    title: 'O carbono do monte: 1s² 2s² 2p²',
    orbitalBasis:
      'Un orbital 2s e tres 2p explican toda a química do carbono. Compara "Real → 2s" con "2p" e observa que o 2s é esférico e os 2p teñen lóbulos dirixidos.',
    forestry:
      'O carbono que fixa unha árbore ao medrar queda retido na madeira durante décadas. A configuración 1s² 2s² 2p² ten só DOUS electróns desapareados, e con todo o carbono forma catro enlaces: a explicación é a hibridación, que combina o 2s e os 2p en catro orbitais equivalentes. Entender isto é entender por que o carbono pode construír cadeas longas e estables: a base molecular do ciclo do carbono, da retención de carbono nos bosques e da Análise de Ciclo de Vida (ACV) da madeira como material.',
    syllabus: 'Descrición mecano-cuántica do átomo · Propiedades periódicas',
  },
  {
    id: 'periodic',
    title: 'Propiedades periódicas: por que o osíxeno atrae os electróns',
    orbitalBasis:
      'Ao avanzar cara á dereita na táboa periódica, a carga nuclear efectiva aumenta e os orbitais fanse MÁIS ESTABLES (enerxía máis negativa). Por iso o osíxeno atrae os electróns do enlace máis ca o carbono ou o hidróxeno.',
    forestry:
      'A electronegatividade explica a polaridade de toda a química da madeira: dos grupos -OH da celulosa aos grupos carboxilo das hemicelulosas. Sen esta tendencia periódica non se entende nin a absorción de auga nin a afinidade da madeira polos adhesivos polares.',
    syllabus: 'Propiedades periódicas · Polaridade',
  },
  {
    id: 'uv',
    title: 'Fotodegradación: enerxía do fotón e saltos electrónicos',
    orbitalBasis:
      'Un orbital excitado é un orbital de enerxía superior. Se un fotón ten a enerxía suficiente, pode promover un electrón dun orbital ocupado a outro baleiro.',
    forestry:
      'A radiación UV do sol ten enerxía suficiente para excitar electróns en estruturas aromáticas (lignina). Isto inicia a fotodegradación da superficie da madeira, que se traduce en perda de cor, rugosidade e perda de adherencia dos revestimentos. É a razón técnica de que existan protectores UV específicos para madeira.',
    syllabus: 'Descrición mecano-cuántica do átomo',
  },
];

/** Como se relaciona o que se ve no visor coa nomenclatura da guía. */
export const SYLLABUS_MAP: Array<{ syllabus: string; covered: 'si' | 'parcial' | 'non' }> = [
  { syllabus: 'Descrición mecano-cuántica do átomo', covered: 'si' },
  { syllabus: 'Números cuánticos (n, l, m)', covered: 'si' },
  { syllabus: 'Formas e orientacións dos orbitais', covered: 'si' },
  { syllabus: 'Nodos radiais e angulares', covered: 'si' },
  { syllabus: 'Xeometría e hibridación (sp, sp², sp³)', covered: 'si' },
  { syllabus: 'Propiedades periódicas', covered: 'parcial' },
  { syllabus: 'Polaridade', covered: 'parcial' },
  { syllabus: 'Enlace covalente (σ e π)', covered: 'parcial' },
  { syllabus: 'Enlace iónico e metálico', covered: 'non' },
  { syllabus: 'Forzas intermoleculares', covered: 'parcial' },
];

/**
 * SECUENCIA GUIADA
 * ================
 * Unha práctica de ~40 minutos con PREDICIÓN EXPLÍCITA antes de cada
 * observación. Este é o mecanismo que mellor combate as concepcións erróneas
 * documentadas (Taber 2002; Nakiboğlu 2003): o alumnado debe comprometerse
 * cunha hipótese antes de ver o resultado.
 */
export interface GuidedStep {
  n: number;
  title: string;
  /** Que facer no visor. */
  action: string;
  /** Que hai que PREDICIR antes de facelo. */
  predict: string;
  /** Que se observa e por que. */
  observe: string;
  /** Control da interface que hai que usar. */
  control: 'n' | 'l' | 'm' | 'tipo' | 'modo' | 'hibrido';
  /**
   * Que fai exactamente o botón «Preparar o visor», para que non prometa máis
   * do que fai. Nun paso de comparación, o preset só sitúa o punto de partida.
   */
  prepareNote: string;
}

export const GUIDED_SEQUENCE: GuidedStep[] = [
  {
    n: 1,
    title: 'O tamaño do orbital',
    action: 'Pon n = 1 e anota o "Radio máis probable" que aparece baixo a gráfica. Despois sube a n = 2.',
    predict: 'Cres que o radio máis probable se vai multiplicar por 2, por 4, ou por outra cantidade?',
    observe:
      'O radio medra aproximadamente como n²: ao pasar de n=1 a n=2 cuadruplícase (dun 1,0 Å a uns 5,2 Å). Isto é unha diferenza crucial co modelo de Bohr, onde o radio tamén medra como n² pero por unha razón distinta: aquí non hai órbitas, hai probabilidade.',
    control: 'n',
    prepareNote: 'Pon 3s (n = 3, l = 0) como punto de partida. Move ti o control n para comparar.',
  },
  {
    n: 2,
    title: 'Os nodos radiais',
    action: 'Con l = 0, percorre n = 1, 2, 3, 4 e conta as liñas amarelas discontinuas da gráfica.',
    predict: 'Para n = 4 con l = 0, esperas 4 nodos, 3 nodos, ou ningún?',
    observe:
      'O número de nodos radiais é n − l − 1: 0, 1, 2 e 3. Un nodo é unha superficie onde a probabilidade de atopar o electrón é exactamente cero. Compárao co valor que mostra o panel "Radiais".',
    control: 'n',
    prepareNote: 'Pon 3s. Move ti o control n de 1 a 4 e conta as liñas amarelas da gráfica.',
  },
  {
    n: 3,
    title: 'A forma: o número cuántico l',
    action: 'Con n = 3 fixo, move l de 0 a 1 e despois a 2. Observa tamén como cambia o reconto de "Angulares".',
    predict: 'Ao aumentar l de 0 a 2, esperas que o orbital siga sendo esférico ou que aparezan lóbulos?',
    observe:
      'l = 0 é esférico; l = 1 ten dous lóbulos; l = 2 ten catro lóbulos (ou dous máis un anel). Os nodos angulares son exactamente l, e son PLANOS (non esferas). A regra completa: nodos totais = n − 1.',
    control: 'l',
    prepareNote: 'Pon 3s. Move ti o control l de 0 a 2 para cambiar a forma.',
  },
  {
    n: 4,
    title: 'A orientación: o número cuántico m',
    action: 'Con n = 2, l = 1, percorre m = −1, 0, +1.',
    predict: 'Cambia a FORMA do orbital ao cambiar m, ou só a súa orientación?',
    observe:
      'Só a orientación: son os tres orbitais p (p_y, p_z, p_x), enerxeticamente equivalentes. Hai 2l+1 valores de m, é dicir, 2l+1 orientacións posibles. Este é o motivo de que un subnivel p teña 3 orbitais e un d teña 5.',
    control: 'm',
    prepareNote: 'Pon 2p_z (n = 2, l = 1, m = 0). Move ti o control m para cambiar a orientación.',
  },
  {
    n: 5,
    title: 'O signo de ψ e a cor',
    action: 'En modo "Nube", observa un orbital 2p. Despois activa "Modo densidade" no panel.',
    predict: 'No orbital 2p, os dous lóbulos teñen o mesmo signo ou signos opostos?',
    observe:
      'Signos opostos, e iso é o que indica a cor (mira a lenda, cos símbolos + e −). No "Modo densidade" esa información pérdese, porque a cor pasa a indicar só cantidade. Confundir ψ (con signo) con |ψ|² (sempre positivo) é o erro máis frecuente neste tema.',
    control: 'modo',
    prepareNote: 'Pon 2p_z en modo nube. Activa ou desactiva o «Modo densidade» no panel.',
  },
  {
    n: 6,
    title: 'Isosuperficie fronte a nube',
    action: 'Cambia a "Superficie" e move o control "Nivel da isosuperficie".',
    predict: 'Se baixas o nivel, a superficie fai máis grande ou máis pequena?',
    observe:
      'Ao baixar o nivel, a superficie engloba máis volume. Isto demostra algo importante: as imaxes dos libros de texto son unha CONVENCIÓN, non "a forma" do orbital. O orbital non remata nunha parede: a probabilidade diminúe de forma continua.',
    control: 'modo',
    prepareNote: 'Pon 2p_z en modo nube. Pasa a «Superficie» e move ti o nivel da isosuperficie.',
  },
  {
    n: 7,
    title: 'Hibridación: do orbital ao enlace',
    action: 'Pasa a "Híbrido" e proba sp³, movendo o índice de orbital de 1 a 4.',
    predict: 'Os catro híbridos sp³ apuntan todos na mesma dirección ou en direccións distintas?',
    observe:
      'En catro direccións distintas que forman un tetraedro con ángulos de 109,5°. Este é o modelo que explica a xeometría do carbono na celulosa. Lembra que os híbridos son un MODELO matemático (combinacións de s e p), non obxectos que existan fisicamente antes de formarse o enlace.',
    control: 'hibrido',
    prepareNote: 'Pasa a «Híbrido → sp³» e amosa un só híbrido. Move ti o índice de orbital.',
  },
  {
    n: 8,
    title: 'A enerxía dos orbitais: por que o 4s se enche antes ca o 3d',
    action:
      'No átomo de hidróxeno a enerxía depende SÓ de n: compara 3s, 3p e 3d e verás que a forma cambia pero a gráfica non che dá a enerxía. Logo pensa no calcio (Z = 20).',
    predict:
      'No calcio, o último electrón vai ao 4s ou ao 3d? O 4s ten n maior, así que esperas que sexa máis enerxético ou menos?',
    observe:
      'O visor amosa FORMAS, non enerxías: non hai ningún diagrama de niveis aquí, así que este paso hai que razoalo, non observalo. O que si podes comprobar é que 3s, 3p e 3d teñen formas moi distintas entre si. Pois ben: no hidróxeno, e a pesar desa diferenza de forma, os tres teñen a MESMA enerxía (están dexenerados). Nos átomos con máis dun electrón a repulsión entre electróns rompe esa dexeneración e a orde pasa a depender de n + l: o 4s (4+0 = 4) queda por debaixo do 3d (3+2 = 5), e por iso o calcio é [Ar]4s². Cando dous orbitais empatan en n + l, enchese antes o de n menor: entre 3d (5) e 4p (5), primeiro o 3d. Toda a orde de enchemento da táboa periódica sae destas dúas regras, e son un efecto de moitos electróns, NON do hidróxeno que debuxa este visor.',
    control: 'l',
    prepareNote: 'Pon 3s (n = 3, l = 0). Move ti o control l para ver as formas de 3s, 3p e 3d.',
  },
];
