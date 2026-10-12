/**
 * TESTS DA VALIDACIÓN DO ESTADO POR URL
 * =====================================
 * O estado compartible por URL é un sumidoiro de entrada: calquera pode
 * escribir calquera cousa no fragmento. Estes tests comproban que TODOS os
 * valores que chegan da URL pasan polas validacións do store, de xeito que
 * unha URL manipulada non poida deixar a aplicación nun estado imposible
 * (por exemplo n = 1e9, que bloquearía a xeración da textura).
 *
 * Estes tests non necesitan navegador: simulan `window.location.hash` e
 * comproban o estado resultante do store.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useOrbitalStore } from '../../store/useOrbitalStore.ts';
import { applyStateFromUrl } from '../useUrlState.ts';

// `applyStateFromUrl` só toca window se existe; simulámolo
const globalWithWindow = globalThis as unknown as { window?: unknown };
const realWindow = globalWithWindow.window;

function withHash(hash: string) {
  globalWithWindow.window = { location: { hash } } as unknown;
}

beforeEach(() => {
  useOrbitalStore.getState().reset();
});

test('sen hash non se aplica nada', () => {
  withHash('');
  assert.equal(applyStateFromUrl(), false);
  assert.equal(useOrbitalStore.getState().n, 3, 'debería quedar o valor por defecto');
});

test('aplica uns números cuánticos válidos', () => {
  withHash('#n=2&l=1&m=-1');
  assert.equal(applyStateFromUrl(), true);
  const s = useOrbitalStore.getState();
  assert.equal(s.n, 2);
  assert.equal(s.l, 1);
  assert.equal(s.m, -1);
});

test('rexeita un n absurdo e limita ao rango do store', () => {
  withHash('#n=1000000000');
  applyStateFromUrl();
  const s = useOrbitalStore.getState();
  assert.ok(s.n <= 8, `n quedou en ${s.n}, debería estar limitado a 8`);
  assert.ok(s.n >= 1);
});

test('rexeita valores non numéricos sen romper', () => {
  withHash('#n=abc&l=xyz&m=NaN');
  applyStateFromUrl();
  const s = useOrbitalStore.getState();
  assert.ok(Number.isFinite(s.n) && Number.isFinite(s.l) && Number.isFinite(s.m));
  assert.equal(s.n, 3, 'un valor non numérico non debe cambiar o estado');
});

test('limita l e m a valores coherentes con n', () => {
  // l non pode ser ≥ n, e |m| non pode superar l
  withHash('#n=2&l=7&m=7');
  applyStateFromUrl();
  const s = useOrbitalStore.getState();
  assert.ok(s.l < s.n, `l=${s.l} debería ser menor que n=${s.n}`);
  assert.ok(Math.abs(s.m) <= s.l, `|m|=${Math.abs(s.m)} debería ser ≤ l=${s.l}`);
});

test('rexeita un tipo de orbital descoñecido', () => {
  withHash('#tipo=fake');
  applyStateFromUrl();
  assert.equal(useOrbitalStore.getState().orbitalType, 'real', 'debería manter o valor por defecto');
});

test('rexeita unha hibridación descoñecida', () => {
  withHash('#hib=sp9');
  applyStateFromUrl();
  assert.equal(useOrbitalStore.getState().hybridType, 'sp3');
});

test('limita o índice de híbrido ao número de orbitais do tipo', () => {
  withHash('#tipo=hybrid&hib=sp&hi=99');
  applyStateFromUrl();
  const s = useOrbitalStore.getState();
  assert.equal(s.hybridType, 'sp');
  assert.ok(s.hybridIndex <= 1, `índice de sp quedou en ${s.hybridIndex}, debería ser ≤ 1`);
});

test('acepta os tipos e modos válidos', () => {
  withHash('#tipo=complex&modo=surface&cm=density');
  applyStateFromUrl();
  const s = useOrbitalStore.getState();
  assert.equal(s.orbitalType, 'complex');
  assert.equal(s.visualizationMode, 'surface');
  assert.equal(s.colorMode, 'density');
});

test('limita a calidade ao rango seguro do shader e do store', () => {
  withHash('#q=99999');
  applyStateFromUrl();
  const q = useOrbitalStore.getState().quality;
  // O bucle do shader está limitado a 256 iteracións e uSteps = quality*2
  assert.ok(q >= 24 && q <= 128, `calidade = ${q}, fóra do rango seguro`);
});

test('limita gamma ao rango permitido', () => {
  withHash('#g=99');
  applyStateFromUrl();
  const g = useOrbitalStore.getState().gamma;
  assert.ok(g >= 0.1 && g <= 1, `gamma = ${g}, fóra do rango`);
});

test('unha URL completa aplícase enteira', () => {
  withHash('#n=4&l=3&m=-2&tipo=real&modo=cloud&cm=phase&g=0.30&q=48');
  assert.equal(applyStateFromUrl(), true);
  const s = useOrbitalStore.getState();
  assert.equal(s.n, 4);
  assert.equal(s.l, 3);
  assert.equal(s.m, -2);
  assert.equal(s.orbitalType, 'real');
  assert.equal(s.visualizationMode, 'cloud');
  assert.equal(s.colorMode, 'phase');
  assert.equal(s.quality, 48);
  assert.ok(Math.abs(s.gamma - 0.3) < 1e-9);
});

test('unha URL con só n non rompe l nin m', () => {
  withHash('#n=1');
  applyStateFromUrl();
  const s = useOrbitalStore.getState();
  assert.equal(s.n, 1);
  assert.ok(s.l < s.n, `l=${s.l} debería ser < n=${s.n}`);
  assert.equal(s.m, 0);
});

// Restaurar o global ao rematar
test('limpeza', () => {
  if (realWindow === undefined) delete globalWithWindow.window;
  else globalWithWindow.window = realWindow;
  assert.ok(true);
});
