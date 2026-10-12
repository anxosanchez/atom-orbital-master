/**
 * TESTS DA XEOMETRÍA DOS ORBITAIS HÍBRIDOS
 * ========================================
 * Cando se amosan os híbridos superpostos, o alumnado ve catro lóbulos de
 * cores distintas e debe poder concluír que forman un tetraedro. Iso é unha
 * afirmación FÍSICA, así que ten que estar verificada por tests, non só
 * "parecer" correcta nunha captura.
 *
 * Estes tests comproban de forma independente:
 *   1. Que cada híbrido ten o seu máximo nunha dirección distinta.
 *   2. Que os ÁNGULOS entre esas direccións son os correctos:
 *        sp  -> 180°   · sp² -> 120°   · sp³ -> 109,47°
 *   3. Que a superposición (Σ|hᵢ|²) NON é esférica, é dicir, que hai
 *      estrutura direccional que mostrar.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hybridWaveFunction, realWaveFunction } from '../physics.ts';
import { buildDensityVolume, hybridCount, HYBRID_PALETTE } from '../densityVolume.ts';

/** Dirección (unitaria) na que |h_i| é máxima, buscando nunha malla de direccións. */
function directionOfMaximum(type: 'sp' | 'sp2' | 'sp3', index: number, r = 3) {
  let best = { x: 0, y: 0, z: 1 };
  let bestVal = -1;
  const N = 48;
  for (let a = 0; a <= N; a++) {
    const theta = (a / N) * Math.PI;
    for (let b = 0; b < 2 * N; b++) {
      const phi = (b / (2 * N)) * 2 * Math.PI;
      const value = Math.abs(hybridWaveFunction(type, index, r, theta, phi));
      if (value > bestVal) {
        bestVal = value;
        best = {
          x: Math.sin(theta) * Math.cos(phi),
          y: Math.sin(theta) * Math.sin(phi),
          z: Math.cos(theta),
        };
      }
    }
  }
  return best;
}

const angleBetween = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => {
  const dot = a.x * b.x + a.y * b.y + a.z * b.z;
  const na = Math.hypot(a.x, a.y, a.z);
  const nb = Math.hypot(b.x, b.y, b.z);
  return (Math.acos(Math.max(-1, Math.min(1, dot / (na * nb)))) * 180) / Math.PI;
};

test('hybridCount coincide co número de orbitais de cada tipo', () => {
  assert.equal(hybridCount('sp'), 2);
  assert.equal(hybridCount('sp2'), 3);
  assert.equal(hybridCount('sp3'), 4);
});

test('cada híbrido ten o seu máximo nunha dirección distinta', () => {
  for (const type of ['sp', 'sp2', 'sp3'] as const) {
    const count = hybridCount(type);
    const dirs = Array.from({ length: count }, (_, i) => directionOfMaximum(type, i));
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const angle = angleBetween(dirs[i], dirs[j]);
        // Non poden apuntar ao mesmo sitio
        assert.ok(angle > 10, `${type}: os híbridos ${i} e ${j} apuntan case igual (${angle.toFixed(1)}°)`);
      }
    }
  }
});

test('a xeometría sp é LINEAL: os dous híbridos forman 180°', () => {
  const a = directionOfMaximum('sp', 0);
  const b = directionOfMaximum('sp', 1);
  const angle = angleBetween(a, b);
  assert.ok(
    Math.abs(angle - 180) < 8,
    `sp: o ángulo entre os dous híbridos é ${angle.toFixed(1)}°, debería ser ≈180°`,
  );
});

test('a xeometría sp² é TRIGONAL PLANA: 120° entre cada par', () => {
  const dirs = [0, 1, 2].map((i) => directionOfMaximum('sp2', i));
  for (const [i, j] of [[0, 1], [0, 2], [1, 2]] as const) {
    const angle = angleBetween(dirs[i], dirs[j]);
    assert.ok(
      Math.abs(angle - 120) < 8,
      `sp²: ángulo entre h${i} e h${j} = ${angle.toFixed(1)}°, debería ser ≈120°`,
    );
  }
  // E os tres deben estar practicamente no plano xy
  for (const d of dirs) {
    assert.ok(Math.abs(d.z) < 0.12, `sp²: un híbrido sae do plano xy (z = ${d.z.toFixed(3)})`);
  }
});

test('a xeometría sp³ é TETRAÉDRICA: 109,47° entre cada par', () => {
  const dirs = [0, 1, 2, 3].map((i) => directionOfMaximum('sp3', i));
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const angle = angleBetween(dirs[i], dirs[j]);
      assert.ok(
        Math.abs(angle - 109.47) < 8,
        `sp³: ángulo entre h${i} e h${j} = ${angle.toFixed(1)}°, debería ser ≈109,47°`,
      );
    }
  }
});

test('a superposición cubre TODO o espazo: cada híbrido domina nunha soa dirección', () => {
  // ACHADO IMPORTANTE (verificado aquí): a densidade total Σ|hᵢ|² é ISÓTROPA
  // nos tres casos. A razón é teórica: un conxunto ortonormal COMPLETO cumpre
  // Σ|hᵢ|² = Σ_b |base_b|², e a suma dos cadrados dos orbitais dun subnivel
  // completo é independente da dirección. Comprobación directa:
  //   Σ|2p|² = 4.4572·10⁻³ para TODAS as direccións.
  // Consecuencia de deseño: o tetraedro NON pode verse na envolvente, só na
  // COR (que híbrido domina en cada punto). Este test verifica que esa
  // asignación de cor ten exactamente a xeometría correcta.
  for (const [type, expected] of [['sp', 2], ['sp2', 3], ['sp3', 4]] as const) {
    const count = hybridCount(type);
    const winners = new Set<number>();
    const N = 60;
    for (let a = 0; a <= N; a++) {
      const theta = (a / N) * Math.PI;
      for (let b = 0; b < 2 * N; b++) {
        const phi = (b / (2 * N)) * 2 * Math.PI;
        let best = -1;
        let bestVal = -1;
        for (let i = 0; i < count; i++) {
          const v = Math.abs(hybridWaveFunction(type, i, 3, theta, phi));
          if (v > bestVal) {
            bestVal = v;
            best = i;
          }
        }
        winners.add(best);
      }
    }
    assert.equal(
      winners.size,
      expected,
      `${type}: só ${winners.size} híbridos dominan nalgunha dirección, esperados ${expected}`,
    );
  }
});

test('o conxunto completo de orbitais p é isótropo (comprobación teórica)', () => {
  // Este é o feito que explica por que a superposición total non amosa
  // xeometría: Σ_m |Y_1m|² = 3/(4π) é constante.
  const px = (th: number, ph: number) => realWaveFunction(2, 1, 1, 3, th, ph);
  const py = (th: number, ph: number) => realWaveFunction(2, 1, -1, 3, th, ph);
  const pz = (th: number, ph: number) => realWaveFunction(2, 1, 0, 3, th, ph);
  const values: number[] = [];
  for (let a = 0; a < 20; a++) {
    for (let b = 0; b < 20; b++) {
      const th = ((a + 0.5) / 20) * Math.PI;
      const ph = ((b + 0.5) / 20) * 2 * Math.PI;
      values.push(px(th, ph) ** 2 + py(th, ph) ** 2 + pz(th, ph) ** 2);
    }
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  assert.ok(
    max - min < 1e-12,
    `Σ|2p|² debería ser constante; varía entre ${min.toExponential(4)} e ${max.toExponential(4)}`,
  );
});

test('a superposición codifica o índice do híbrido dominante no canal de fase', () => {
  const res = buildDensityVolume({
    type: 'hybrid',
    n: 2,
    l: 1,
    m: 0,
    hybridType: 'sp3',
    hybridIndex: 0,
    quality: 24,
    allHybrids: true,
  });
  const seen = new Set<number>();
  for (let i = 1; i < res.data.length; i += 4) seen.add(Number(res.data[i].toFixed(4)));
  // Espérase (0+0.5)/4, (1+0.5)/4, (2+0.5)/4, (3+0.5)/4 = 0.125, 0.375, 0.625, 0.875
  for (const expected of [0.125, 0.375, 0.625, 0.875]) {
    assert.ok(seen.has(expected), `non aparece o índice de híbrido ${expected}`);
  }
  assert.equal(seen.size, 4, `deberían aparecer exactamente 4 índices, aparecen ${seen.size}`);
});

test('a superposición non cambia o número de híbridos por tipo', () => {
  for (const [type, expected] of [['sp', 2], ['sp2', 3], ['sp3', 4]] as const) {
    const res = buildDensityVolume({
      type: 'hybrid', n: 2, l: 1, m: 0, hybridType: type, hybridIndex: 0, quality: 20, allHybrids: true,
    });
    const seen = new Set<string>();
    for (let i = 1; i < res.data.length; i += 4) seen.add(res.data[i].toFixed(4));
    assert.equal(seen.size, expected, `${type}: ${seen.size} índices distintos, esperados ${expected}`);
  }
});

test('a paleta dos híbridos ten unha cor por orbital de cada tipo', () => {
  // Ao pasar a mallas independentes, a cor é un uniform por malla e a paleta é
  // a única fonte de verdade: xa non hai unha copia no shader que poida
  // divergir. O que hai que garantir é que hai exactamente unha cor por
  // híbrido, e que se len como cores CSS válidas.
  for (const [type, count] of [['sp', 2], ['sp2', 3], ['sp3', 4]] as const) {
    const palette = HYBRID_PALETTE[type];
    assert.equal(palette.length, count, `${type}: ${palette.length} cores, esperadas ${count}`);
    for (const c of palette) {
      assert.match(c, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/, `cor inválida en ${type}: ${c}`);
    }
    // Sen cores repetidas dentro do mesmo tipo (deben distinguirse)
    assert.equal(new Set(palette).size, count, `${type}: hai cores repetidas`);
  }
});
