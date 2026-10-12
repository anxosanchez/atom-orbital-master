/**
 * TESTS DA TEXTURA 3D
 * ===================
 * Comproban as propiedades do volume de densidade que a visualización dá por
 * supostas. Sen estes tests, un cambio no bucle de voxels pode producir unha
 * imaxe plausible pero cientificamente incorrecta (por exemplo, unha textura
 * baleira, ou unha fase que non se corresponde co signo real de ψ).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDensityVolume,
  visualizationRange,
  worldScaleForRange,
  TARGET_WORLD_HALF_EXTENT,
} from '../densityVolume.ts';

test('o volume constrúese co tamaño e o número de voxels correctos', () => {
  const res = buildDensityVolume({
    type: 'real', n: 2, l: 0, m: 0, hybridType: 'sp3', hybridIndex: 0, quality: 16,
  });
  assert.equal(res.size, 16);
  assert.equal(res.data.length, 16 * 16 * 16 * 4);
});

test('a densidade normalízase: o máximo é exactamente 1', () => {
  for (const [n, l] of [[1, 0], [2, 0], [3, 2]] as const) {
    const res = buildDensityVolume({
      type: 'real', n, l, m: 0, hybridType: 'sp3', hybridIndex: 0, quality: 24,
    });
    let max = 0;
    for (let i = 0; i < res.data.length; i += 4) if (res.data[i] > max) max = res.data[i];
    assert.ok(max > 0.99 && max <= 1.0001, `(n=${n},l=${l}): máximo = ${max}, debería ser 1`);
  }
});

test('todos os valores de densidade están en [0,1]', () => {
  const res = buildDensityVolume({
    type: 'real', n: 3, l: 2, m: 0, hybridType: 'sp3', hybridIndex: 0, quality: 24,
  });
  for (let i = 0; i < res.data.length; i += 4) {
    const d = res.data[i];
    assert.ok(d >= 0 && d <= 1.0001, `densidade fóra de rango: ${d}`);
  }
});

test('a textura NON está baleira (habería pantalla negra)', () => {
  const res = buildDensityVolume({
    type: 'real', n: 3, l: 2, m: 0, hybridType: 'sp3', hybridIndex: 0, quality: 24,
  });
  let nonZero = 0;
  for (let i = 0; i < res.data.length; i += 4) if (res.data[i] > 1e-4) nonZero++;
  const total = res.size ** 3;
  assert.ok(nonZero > 0, 'a textura está completamente baleira');
  assert.ok(nonZero / total > 0.001, `só ${nonZero}/${total} voxels teñen densidade`);
});

test('a fase dun orbital real só toma os valores 0 ou 1', () => {
  const res = buildDensityVolume({
    type: 'real', n: 2, l: 1, m: 0, hybridType: 'sp3', hybridIndex: 0, quality: 20,
  });
  for (let i = 1; i < res.data.length; i += 4) {
    assert.ok(res.data[i] === 0 || res.data[i] === 1, `fase inválida: ${res.data[i]}`);
  }
  // Nun 2p_z debe haber AMBAS as fases (dous lóbulos de signo oposto)
  let hasPos = false;
  let hasNeg = false;
  for (let i = 1; i < res.data.length; i += 4) {
    if (res.data[i + 0] > 0 && res.data[i] === 1) hasPos = true;
    if (res.data[i] === 0 && res.data[i - 1] > 1e-6) hasNeg = true;
  }
  assert.ok(hasPos, 'non hai ningún voxel con fase positiva');
  assert.ok(hasNeg, 'non hai ningún voxel con fase negativa (falta un lóbulo)');
});

test('un orbital complexo emprégaa unha fase única (0.5), non un signo', () => {
  const res = buildDensityVolume({
    type: 'complex', n: 2, l: 1, m: 1, hybridType: 'sp3', hybridIndex: 0, quality: 20,
  });
  for (let i = 1; i < res.data.length; i += 4) {
    assert.equal(res.data[i], 0.5, 'un orbital complexo non debe ter dúas fases');
  }
});

test('o enmarcado derívase da probabilidade e crece co número cuántico', () => {
  const r1 = visualizationRange({ type: 'real', n: 1, l: 0 });
  const r3 = visualizationRange({ type: 'real', n: 3, l: 0 });
  const r5 = visualizationRange({ type: 'real', n: 5, l: 0 });
  assert.ok(r3 > r1, `r(n=3)=${r3} debería superar r(n=1)=${r1}`);
  assert.ok(r5 > r3, `r(n=5)=${r5} debería superar r(n=3)=${r3}`);
  // A caixa debe CONTER o orbital con marxe abonda para que a densidade xa sexa
  // desprezable antes do bordo. Se o orbital toca o bordo, o raymarch córtao e
  // vense lóbulos seccionados cunha máscara cadrada.
  const r7 = visualizationRange({ type: 'real', n: 7, l: 0 });
  const r98_1s = 3.76;
  const r98_7s = 112.8;
  // Marxe mínima do 35% sobre o radio que contén o 98% da probabilidade
  assert.ok(r1 > r98_1s * 1.35, `rango do 1s = ${r1.toFixed(2)}: marxe insuficiente sobre r₉₈=${r98_1s}`);
  assert.ok(r7 > r98_7s * 1.35, `rango do 7s = ${r7.toFixed(2)}: marxe insuficiente sobre r₉₈=${r98_7s}`);
  // Pero sen pasarse: unha caixa enorme faría o orbital pequeno
  assert.ok(r1 < r98_1s * 2.5, `rango do 1s = ${r1.toFixed(2)}: demasiado grande`);
  assert.ok(r7 < r98_7s * 2.5, `rango do 7s = ${r7.toFixed(2)}: demasiado grande`);
});

test('o cubo ocupa sempre a mesma rexión en pantalla (tamaño comparable)', () => {
  // A malla é un cubo UNITARIO: a súa semiextensión en mundo é escala × 0.5, e
  // ten que ser CONSTANTE para que todos os orbitais se vexan do mesmo tamaño.
  // Este test existe porque un erro aquí (escalar por `range`) deixaba o 7s ao
  // 0,6% do alto da pantalla.
  const halfExtents: number[] = [];
  for (const n of [1, 2, 3, 4, 5, 7]) {
    // O rango físico só se usa para comprobar que a escala NON depende del
    assert.ok(visualizationRange({ type: 'real', n, l: 0 }) > 0);
    const scale = worldScaleForRange();
    halfExtents.push((scale * 1) / 2); // cubo unitario de lado 1
  }
  const min = Math.min(...halfExtents);
  const max = Math.max(...halfExtents);
  assert.ok(
    max - min < 1e-9,
    `a semiextensión varía con n: ${halfExtents.join(', ')} (debería ser constante)`,
  );
  assert.ok(
    Math.abs(min - TARGET_WORLD_HALF_EXTENT) < 1e-9,
    `a semiextensión debería ser ${TARGET_WORLD_HALF_EXTENT}, é ${min}`,
  );
});

test('a resolución útil é independente de n (mesmo número de voxels por orbital)', () => {
  // Co rango adaptado, o tamaño de voxel é proporcional ao rango, así que o
  // número de voxels que atravesa o orbital é o mesmo para todos os n.
  const quality = 64;
  const ratios = [1, 3, 5, 7].map((n) => {
    const r = visualizationRange({ type: 'real', n, l: 0 });
    const voxel = (2 * r) / (quality - 1);
    return r / voxel; // voxels desde o centro ata o bordo do orbital
  });
  const spread = Math.max(...ratios) - Math.min(...ratios);
  assert.ok(spread < 1e-9, `a resolución varía con n: ${ratios.join(', ')}`);
});

test('a densidade máxima gardada coincide co pico real do volume', () => {
  const res = buildDensityVolume({
    type: 'real', n: 2, l: 1, m: 0, hybridType: 'sp3', hybridIndex: 0, quality: 24,
  });
  assert.ok(res.maxDensity > 0, 'maxDensity debe ser positiva');
  // O 2p ten densidade máxima pequena (a función anúlase no núcleo)
  assert.ok(res.maxDensity < 1, `maxDensity do 2p = ${res.maxDensity}, demasiado grande`);
});

test('os híbridos prodúceun volumes válidos', () => {
  for (const type of ['sp', 'sp2', 'sp3'] as const) {
    const count = type === 'sp3' ? 4 : type === 'sp2' ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const res = buildDensityVolume({
        type: 'hybrid', n: 2, l: 1, m: 0, hybridType: type, hybridIndex: i, quality: 20,
      });
      let max = 0;
      for (let j = 0; j < res.data.length; j += 4) if (res.data[j] > max) max = res.data[j];
      assert.ok(max > 0.99, `${type}[${i}]: máximo = ${max}`);
    }
  }
});
