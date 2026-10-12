/**
 * TESTS DO CONTIDO DIDÁCTICO
 * ==========================
 * O texto tamén pode estar mal. Estes tests comproban a COHERENCIA INTERNA do
 * contido: que cada pregunta teña unha soa resposta correcta, que os
 * distractores estean xustificados, e que non haxa erros factuais evidentes
 * nos reconto de nodos que se afirman nas explicacións.
 *
 * Un erro nun texto didáctico é tan grave como un erro na física: o alumnado
 * non ten forma de detectalo.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ } from '../quiz.ts';
import { FORESTRY_CONNECTIONS, GUIDED_SEQUENCE, SYLLABUS_MAP } from '../forestry.ts';
import { getOrbitalInfo, orbitalLabel, KEY_TAKEAWAYS } from '../explanations.ts';
import { GLOSSARY, MISCONCEPTIONS, REFERENCES } from '../glossary.ts';

// ---------------------------------------------------------------------------
// Cuestións de autoavaliación
// ---------------------------------------------------------------------------

test('cada pregunta ten exactamente unha resposta correcta', () => {
  for (const q of QUIZ) {
    const correct = q.options.filter((o) => o.correct).length;
    assert.equal(correct, 1, `a pregunta "${q.id}" ten ${correct} respostas correctas`);
  }
});

test('cada pregunta ten polo menos un distractor con idea errónea documentada', () => {
  for (const q of QUIZ) {
    const withMisconception = q.options.filter((o) => !o.correct && o.misconception);
    assert.ok(
      withMisconception.length >= 1,
      `a pregunta "${q.id}" non ten distractores ligados a unha idea errónea`,
    );
  }
});

test('todas as opcións teñen retroalimentación explicativa', () => {
  for (const q of QUIZ) {
    for (const o of q.options) {
      assert.ok(o.feedback && o.feedback.length > 40, `opción sen retroalimentación en "${q.id}"`);
    }
  }
});

test('todas as preguntas indican como comprobalo no visor', () => {
  for (const q of QUIZ) {
    assert.ok(q.verify && q.verify.length > 15, `a pregunta "${q.id}" non indica como comprobalo`);
  }
});

test('non hai preguntas nin opcións duplicadas', () => {
  const ids = QUIZ.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, 'hai identificadores de pregunta repetidos');
  for (const q of QUIZ) {
    const texts = q.options.map((o) => o.text);
    assert.equal(new Set(texts).size, texts.length, `opcións repetidas en "${q.id}"`);
  }
});

// ---------------------------------------------------------------------------
// Contido curricular forestal
// ---------------------------------------------------------------------------

test('todas as conexións forestais están completas', () => {
  assert.ok(FORESTRY_CONNECTIONS.length >= 5, 'debería haber polo menos 5 conexións forestais');
  for (const c of FORESTRY_CONNECTIONS) {
    assert.ok(c.title && c.orbitalBasis && c.forestry && c.syllabus, `conexión incompleta: ${c.id}`);
    assert.ok(c.forestry.length > 120, `a parte forestal de "${c.id}" é demasiado curta`);
    assert.ok(c.orbitalBasis.length > 40, `a base orbital de "${c.id}" é demasiado curta`);
  }
});

test('todas as conexións forestais apuntan a contidos da guía docente', () => {
  // O campo `syllabus` é unha lista separada por " · ": hai que comprobar
  // CADA elemento por separado, non a cadea enteira.
  const mapText = SYLLABUS_MAP.map((s) => s.syllabus.toLowerCase());
  for (const c of FORESTRY_CONNECTIONS) {
    const items = c.syllabus.split('·').map((s) => s.trim()).filter(Boolean);
    assert.ok(items.length >= 1, `"${c.id}" non declara ningún contido da guía`);
    for (const item of items) {
      const found = mapText.some((m) => m.includes(item.toLowerCase()) || item.toLowerCase().includes(m));
      assert.ok(found, `"${c.id}" apunta a "${item}", que non está no mapa da guía`);
    }
  }
});

test('o mapa da guía usa só estados válidos', () => {
  for (const s of SYLLABUS_MAP) {
    assert.ok(['si', 'parcial', 'non'].includes(s.covered), `estado inválido: ${s.covered}`);
  }
});

// ---------------------------------------------------------------------------
// Secuencia guiada
// ---------------------------------------------------------------------------

test('a secuencia guiada está numerada e completa', () => {
  assert.ok(GUIDED_SEQUENCE.length >= 6, 'a secuencia debería ter polo menos 6 pasos');
  GUIDED_SEQUENCE.forEach((step, i) => {
    assert.equal(step.n, i + 1, `paso ${step.n} fóra de orde`);
    assert.ok(step.title && step.action && step.predict && step.observe, `paso ${step.n} incompleto`);
    assert.ok(step.predict.length > 20, `o paso ${step.n} non pide unha predición`);
    assert.ok(['n', 'l', 'm', 'tipo', 'modo', 'hibrido'].includes(step.control), `control inválido no paso ${step.n}`);
  });
});

test('cada paso da secuencia pide unha predición explícita', () => {
  // Unha predición ten que ser unha PREGUNTA pechada, formulada antes de
  // observar: esíxese signo de interrogación e unha disxuntiva (… ou …).
  for (const step of GUIDED_SEQUENCE) {
    assert.ok(
      step.predict.includes('?'),
      `o paso ${step.n} non formula unha pregunta (falta "?")`,
    );
    assert.ok(
      /\bou\b/i.test(step.predict),
      `o paso ${step.n} non ofrece alternativas entre as que elixir`,
    );
    assert.ok(
      !/^\s*(observa|mira|comproba)/i.test(step.predict),
      `o paso ${step.n} dá a resposta en vez de pedir unha predición`,
    );
  }
});

// ---------------------------------------------------------------------------
// Coherencia dos reconto de nodos afirmados no texto
// ---------------------------------------------------------------------------

test('o reconto de nodos que afirma o texto coincide coa fórmula n−l−1', () => {
  // O texto do 3s di "2 nodos radiais"; o 2s di "1 nodo radial"; o 4s "3".
  const expected: Array<[number, string]> = [
    [2, '1 nodo radial'],
    [3, '2 nodos radiais'],
    [4, '3 nodos radiais'],
  ];
  for (const [n, phrase] of expected) {
    const info = getOrbitalInfo(n, 0, 0);
    assert.ok(
      info.what.includes(phrase),
      `o texto do ${n}s debería dicir "${phrase}"; di: ${info.what.slice(0, 120)}`,
    );
    assert.equal(n - 0 - 1, n - 1, 'a fórmula debe coincidir');
  }
});

test('as etiquetas dos orbitais d coinciden coa convención verificada', () => {
  // Verificado numericamente no informe: m=+2 -> x²−y², m=−2 -> xy,
  // m=+1 -> xz, m=−1 -> yz, m=0 -> z²
  assert.equal(orbitalLabel(3, 2, 0), '3dz²');
  assert.equal(orbitalLabel(3, 2, 1), '3dxz');
  assert.equal(orbitalLabel(3, 2, -1), '3dyz');
  assert.equal(orbitalLabel(3, 2, 2), '3dx²−y²');
  assert.equal(orbitalLabel(3, 2, -2), '3dxy');
});

test('as etiquetas dos orbitais p coinciden coa convención verificada', () => {
  assert.equal(orbitalLabel(2, 1, 0), '2pz');
  assert.equal(orbitalLabel(2, 1, 1), '2px');
  assert.equal(orbitalLabel(2, 1, -1), '2py');
});

test('as ideas clave están presentes e non baleiras', () => {
  assert.ok(KEY_TAKEAWAYS.length >= 4, 'debería haber polo menos 4 ideas clave');
  for (const t of KEY_TAKEAWAYS) {
    assert.ok(t.length > 30, `idea clave demasiado curta: "${t}"`);
  }
});

test('as ideas clave mencionan a distinción entre orbital e órbita', () => {
  const joined = KEY_TAKEAWAYS.join(' ').toLowerCase();
  assert.ok(joined.includes('órbita'), 'as ideas clave deben desactivar o modelo de Bohr');
  assert.ok(joined.includes('signo'), 'as ideas clave deben explicar o signo de ψ');
});

// ---------------------------------------------------------------------------
// Correccións de feito: cada test corresponde a un erro real que se corrixiu
// ---------------------------------------------------------------------------

test('o texto do d_z² non afirma que teña planos nodais', () => {
  // Erro factual corrixido: os dous nodos do d_z² son SUPERFICIES CÓNICAS.
  // Comprobación robusta: elimínanse primeiro as negacións ("non planos",
  // "nin planos") e búscase só a AFIRMACIÓN.
  const afirmaPlanos = (text: string) => {
    const senNegacions = text
      .replace(/\bnon\s+(?:son\s+)?planos?\b/gi, 'NEGADO')
      .replace(/\bnin\s+planos?\b/gi, 'NEGADO')
      .replace(/\bnon\s+ten\s+planos?\b/gi, 'NEGADO');
    return /planos nodais/i.test(senNegacions);
  };

  const dz2 = getOrbitalInfo(3, 2, 0);
  assert.ok(
    !afirmaPlanos(`${dz2.what} ${dz2.look}`),
    `o d_z² non ten planos nodais; o texto di: ${dz2.what}`,
  );
  assert.ok(/cónic/i.test(dz2.what), 'o texto debería indicar que os nodos son cónicos');

  // Control positivo: un orbital que SI ten planos nodais debe pasar a
  // detección, para que o test non poida dar "correcto" sempre.
  const dxz = getOrbitalInfo(3, 2, 1);
  assert.ok(
    afirmaPlanos(dxz.what),
    `o control fallou: o d_xz si ten planos nodais e o detector non os ve: ${dxz.what}`,
  );
});

test('a explicación do 4s inclúe a regra de n + l', () => {
  // Faltaba a razón de por que o 4s se enche antes ca o 3d.
  const info = getOrbitalInfo(4, 0, 0);
  assert.ok(/n \+ l/.test(info.what), `falta a regra de n+l: ${info.what}`);
});

test('as conexións forestais non afirman que toda a glicosa sexa sp³', () => {
  // O carbono carbonílico (C1) da glicosa é sp², non sp³.
  const cell = FORESTRY_CONNECTIONS.find((c) => c.id === 'cellulose');
  assert.ok(cell, 'falta a conexión da celulosa');
  const text = `${cell.orbitalBasis} ${cell.forestry}`;
  assert.ok(
    !/cada carbono da glicosa está hibridado sp³/i.test(text),
    'non se pode afirmar que TODOS os carbonos da glicosa son sp³',
  );
  assert.ok(/C1|carbonílico/i.test(text), 'debería mencionar a excepción do carbono carbonílico');
});

test('a afirmación sp² da lignina limita aos anelos aromáticos', () => {
  const lig = FORESTRY_CONNECTIONS.find((c) => c.id === 'lignin');
  assert.ok(lig, 'falta a conexión da lignina');
  assert.ok(
    /anelos aromáticos/i.test(lig.orbitalBasis),
    'a afirmación sp² debe restrinxirse aos anelos aromáticos',
  );
  assert.ok(
    /alifátic/i.test(`${lig.orbitalBasis} ${lig.forestry}`),
    'debería mencionar que as cadeas laterais son alifáticas (sp³)',
  );
});

test('a propiedade periódica descríbese como enerxía MÁIS NEGATIVA, non menor', () => {
  // "a enerxía diminúe" é ambiguo e leva a erro: os orbitais fanse máis estables.
  const per = FORESTRY_CONNECTIONS.find((c) => c.id === 'periodic');
  assert.ok(per);
  assert.ok(
    /máis negativa|MÁIS ESTABLES/i.test(per.orbitalBasis),
    `a redacción debe ser inequívoca: ${per.orbitalBasis}`,
  );
});

test('a explicación do carbono menciona que precisa hibridación para catro enlaces', () => {
  const c = FORESTRY_CONNECTIONS.find((x) => x.id === 'carbon');
  assert.ok(c);
  assert.ok(
    /hibridación/i.test(c.forestry),
    '1s²2s²2p² ten só dous electróns desapareados: hai que explicar a hibridación',
  );
});

test('a secuencia guiada cobre a orde enerxética dos orbitais', () => {
  const step = GUIDED_SEQUENCE.find((s) => /enerxía dos orbitais/i.test(s.title));
  assert.ok(step, 'falta un paso sobre a orde enerxética (n + l)');
  assert.ok(/n \+ l/.test(step.observe), 'o paso debería explicar a regra de n + l');
});

test('o glosario define os termos que usa a aplicación', () => {
  const terms = GLOSSARY.map((g) => g.term.toLowerCase()).join(' | ');
  for (const needed of ['nodo', 'fase', 'orbital', 'isosuperficie', 'número cuántico']) {
    assert.ok(terms.includes(needed), `o glosario non define "${needed}"`);
  }
  for (const g of GLOSSARY) {
    assert.ok(g.definition.length > 40, `definición demasiado curta: ${g.term}`);
  }
});

test('as ideas erróneas teñen corrección explícita e non están baleiras', () => {
  assert.ok(MISCONCEPTIONS.length >= 8, 'debería haber polo menos 8 ideas erróneas resumidas');
  for (const m of MISCONCEPTIONS) {
    assert.ok(m.wrong.length > 20, `idea errónea demasiado curta: ${m.wrong}`);
    assert.ok(m.right.length > 40, `corrección demasiado curta para: ${m.wrong}`);
    assert.notEqual(m.wrong.toLowerCase(), m.right.toLowerCase());
  }
});

// ---------------------------------------------------------------------------
// Correccións da rolda 2 (achados do crítico académico)
// ---------------------------------------------------------------------------

test('C1: a definición de nodo cobre esferas, planos E conos', () => {
  const nodo = GLOSSARY.find((g) => g.term === 'Nodo');
  assert.ok(nodo, 'falta o termo Nodo');
  for (const palabra of ['esf', 'plan', 'cónic']) {
    assert.ok(
      new RegExp(palabra, 'i').test(nodo.definition),
      `a definición de nodo debería nomear os nodos ${palabra}: ${nodo.definition}`,
    );
  }
  // Os angulares conteñen o núcleo; os radiais non. Hai que dicilo.
  const angular = GLOSSARY.find((g) => g.term === 'Nodo angular');
  assert.ok(angular && /núcleo/i.test(angular.definition), 'os nodos angulares pasan polo núcleo');
});

test('C7: o glosario define «lóbulo», que se usa en todo o texto', () => {
  assert.ok(
    GLOSSARY.some((g) => /lóbulo/i.test(g.term)),
    'o termo «lóbulo» úsase decenas de veces e non está no glosario',
  );
});

test('C8: a regra de n + l inclúe o desempate por n', () => {
  const regra = GLOSSARY.find((g) => /n \+ l/i.test(g.term));
  assert.ok(regra, 'falta a regra de n + l');
  assert.ok(
    /empat|mesmo valor|n menor/i.test(regra.definition),
    `a regra está incompleta sen o desempate: ${regra.definition}`,
  );
});

test('C5: a listaxe inclúe a idea errónea de que a isosuperficie é o bordo', () => {
  assert.ok(
    MISCONCEPTIONS.some((m) => /isosuperficie/i.test(m.wrong)),
    'falta a idea errónea sobre a isosuperficie como bordo do átomo',
  );
});

test('C6: cada idea errónea cita unha fonte, e todas as fontes existen', () => {
  for (const m of MISCONCEPTIONS) {
    assert.ok(m.source, `a idea errónea sen fonte: ${m.wrong}`);
    assert.ok(
      REFERENCES[m.source],
      `a clave de fonte «${m.source}» non existe en REFERENCES`,
    );
  }
  // Cada referencia ten autores, ano e revista
  for (const [key, ref] of Object.entries(REFERENCES)) {
    assert.ok(/\(\d{4}\)/.test(ref), `a referencia ${key} non ten ano`);
    assert.ok(ref.length > 80, `a referencia ${key} está demasiado incompleta`);
  }
});

test('C2: cada paso da secuencia explica que fai o botón de preparar', () => {
  for (const step of GUIDED_SEQUENCE) {
    assert.ok(
      step.prepareNote && step.prepareNote.length > 20,
      `o paso ${step.n} non explica que fai o botón de preparar`,
    );
    // Non pode prometer que fai a comparación por si só
    assert.ok(
      /move ti|activa|pasa ti|move o/i.test(step.prepareNote),
      `a nota do paso ${step.n} debería indicar que acción queda para o alumnado`,
    );
  }
});

test('C3: o paso da enerxía declara que o visor non amosa enerxías', () => {
  const step = GUIDED_SEQUENCE.find((s) => /enerxía dos orbitais/i.test(s.title));
  assert.ok(step);
  assert.ok(
    /non hai ningún diagrama de niveis|amosa FORMAS, non enerxías/i.test(step.observe),
    'hai que advertir que o visor non representa enerxías, para non romper o método de predicir-e-comprobar',
  );
});

test('C4: a celulosa non atribúe a linealidade só á xeometría tetraédrica', () => {
  const cell = FORESTRY_CONNECTIONS.find((c) => c.id === 'cellulose');
  assert.ok(cell);
  assert.ok(
    !/xeometría tetraédrica é a razón de que as cadeas.*sexan lineais/i.test(cell.forestry),
    'a xeometría tetraédrica fixa ángulos, non a linealidade da cadea',
  );
  assert.ok(
    /ángulos/i.test(cell.forestry),
    'debería quedar claro que o sp³ explica os ángulos',
  );
});
