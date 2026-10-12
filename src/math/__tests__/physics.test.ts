/**
 * GARDACORDOS CIENTÍFICO
 * =====================
 * Tests de verificación da física do átomo de hidróxeno.
 *
 * Estes tests existen por unha razón concreta: a física deste proxecto foi
 * verificada manualmente contra as solucións analíticas exactas, e o obxectivo
 * é que NUNCA se rompa durante refactorizacións, cambios de rendemento ou
 * melloras visuais. Se algún destes tests falla, o cambio é incorrecto —
 * aínda que a web "se vexa ben".
 *
 * Execución:  npm test      (usa o runner integrado de Node, sen dependencias)
 *
 * Referencias das formas analíticas: Griffiths, "Introduction to Quantum
 * Mechanics", Táboa 4.7; Levine, "Quantum Chemistry", Cap. 6.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  factorial,
  legendre,
  laguerre,
  sphericalHarmonic,
  radialWaveFunction,
  realWaveFunction,
  hybridWaveFunction,
} from '../physics.ts';

// ---------------------------------------------------------------------------
// Utilidades numéricas
// ---------------------------------------------------------------------------

/** Integra f en [a,b] por Simpson con n subintervalos (n par). */
function simpson(f: (x: number) => number, a: number, b: number, n = 40000): number {
  if (n % 2 !== 0) n += 1;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  return (s * h) / 3;
}

/**
 * Normalización radial:  ∫₀^∞ r² |R_nl(r)|² dr  = 1
 * Emprégase integración por tramos cun límite adaptado a n para non perder
 * a cola exponencial.
 */
function radialNormIntegral(n: number, l: number): number {
  const rmax = 60 * n * n;
  return simpson((r) => {
    const R = radialWaveFunction(n, l, r);
    return r * r * R * R;
  }, 1e-9, rmax, 60000);
}

/** Radio medio  ⟨r⟩ = ∫ r · P(r) dr  con  P(r) = r²|R|²  (en unidades de a₀). */
function meanRadius(n: number, l: number): number {
  const rmax = 60 * n * n;
  let num = 0;
  let den = 0;
  const steps = 60000;
  const dr = rmax / steps;
  for (let i = 0; i <= steps; i++) {
    const r = i * dr;
    const R = radialWaveFunction(n, l, r);
    const P = r * r * R * R;
    num += r * P * dr;
    den += P * dr;
  }
  return num / den;
}

/** Conta nodos radiais (cambios de signo de R_nl) nun intervalo amplo. */
function countRadialNodes(n: number, l: number): number {
  let changes = 0;
  let prev = 0;
  const dr = 0.005;
  for (let r = 1e-6; r < 80 * n; r += dr) {
    const v = radialWaveFunction(n, l, r);
    if (v === 0) continue;
    if (prev !== 0 && Math.sign(v) !== Math.sign(prev)) changes++;
    prev = v;
  }
  return changes;
}

/** Produto interno angular coa parte real: ∮ |Y|² dΩ = 1 (usa substitución u=cosθ). */
function angularNorm(l: number, m: number): number {
  // ∫₀^π ∫₀^2π Y*Y sinθ dθ dφ  →  ∫_{-1}^{1} ∫₀^{2π} Y*Y dφ du
  const phiSteps = 720;
  const inner = (u: number) => {
    const theta = Math.acos(Math.max(-1, Math.min(1, u)));
    let acc = 0;
    const dphi = (2 * Math.PI) / phiSteps;
    for (let j = 0; j < phiSteps; j++) {
      const phi = (j + 0.5) * dphi;
      const y = realWaveFunction(1, l, m, 1, theta, phi) / radialWaveFunction(1, l, 1);
      acc += y * y * dphi;
    }
    return acc;
  };
  // Simpson en u con moitos puntos (a función é suave en u)
  const N = 2000;
  const h = 2 / N;
  let s = inner(-1 + 1e-12) + inner(1 - 1e-12);
  for (let i = 1; i < N; i++) {
    const u = -1 + i * h;
    s += inner(u) * (i % 2 === 0 ? 2 : 4);
  }
  return (s * h) / 3;
}

// ---------------------------------------------------------------------------
// 1. Funcións auxiliares
// ---------------------------------------------------------------------------

test('factorial: valores exactos', () => {
  assert.equal(factorial(0), 1);
  assert.equal(factorial(1), 1);
  assert.equal(factorial(5), 120);
  assert.equal(factorial(10), 3628800);
});

test('laguerre: coincide cos polinomios exactos L_n^k(x)', () => {
  // L_n^k(x) = Σ_{i=0}^{n} (-1)^i C(n+k, n-i) x^i / i!
  const binom = (a: number, b: number) => {
    let r = 1;
    for (let i = 0; i < b; i++) r = (r * (a - i)) / (i + 1);
    return Math.round(r);
  };
  const exactLag = (n: number, k: number, x: number) => {
    let s = 0;
    for (let i = 0; i <= n; i++) {
      s += ((-1) ** i * binom(n + k, n - i) * x ** i) / factorial(i);
    }
    return s;
  };
  for (let n = 0; n <= 8; n++) {
    for (let k = 0; k <= 6; k++) {
      for (let x = 0; x <= 12; x += 0.5) {
        assert.ok(
          Math.abs(laguerre(n, k, x) - exactLag(n, k, x)) < 1e-8,
          `L_${n}^${k}(${x}) = ${laguerre(n, k, x)}, esperado ${exactLag(n, k, x)}`,
        );
      }
    }
  }
});

test('legendre: coincide coas formas pechadas exactas P_l^m(x)', () => {
  // Formas pechadas con fase de Condon–Shortley (-1)^m, que é a convención
  // que usa legendre(). Derivadas a man, independentes do código.
  const CLOSED: Record<string, (x: number) => number> = {
    '0,0': () => 1,
    '1,0': (x) => x,
    '1,1': (x) => -Math.sqrt(1 - x * x),
    '2,0': (x) => (3 * x * x - 1) / 2,
    '2,1': (x) => -3 * x * Math.sqrt(1 - x * x),
    '2,2': (x) => 3 * (1 - x * x),
    '3,0': (x) => (5 * x ** 3 - 3 * x) / 2,
    '3,1': (x) => (-3 / 2) * (5 * x * x - 1) * Math.sqrt(1 - x * x),
    '3,2': (x) => 15 * x * (1 - x * x),
    '3,3': (x) => -15 * (1 - x * x) ** 1.5,
    '4,0': (x) => (35 * x ** 4 - 30 * x * x + 3) / 8,
  };
  for (const key of Object.keys(CLOSED)) {
    const [l, m] = key.split(',').map(Number);
    const f = CLOSED[key];
    for (let x = -0.9; x <= 0.9; x += 0.1) {
      assert.ok(
        Math.abs(legendre(l, m, x) - f(x)) < 1e-12,
        `P_${l}^${m}(${x.toFixed(2)}): ${legendre(l, m, x)} vs ${f(x)}`,
      );
    }
  }
  // Propiedades estruturais: P_l^m(±1)=0 para m≠0, e grao l en x
  assert.ok(Math.abs(legendre(2, 1, 1)) < 1e-12, 'P_2^1(1) debe ser 0');
  assert.ok(Math.abs(legendre(3, 3, -1)) < 1e-12, 'P_3^3(-1) debe ser 0');
});

// ---------------------------------------------------------------------------
// 2. Normalización da función radial — o test máis importante do proxecto
// ---------------------------------------------------------------------------

test('R_nl está normalizada: ∫ r²|R|² dr = 1 para todos os estados n≤6', () => {
  for (let n = 1; n <= 6; n++) {
    for (let l = 0; l < n; l++) {
      const I = radialNormIntegral(n, l);
      assert.ok(
        Math.abs(I - 1) < 1e-4,
        `(n=${n}, l=${l}): ∫ r²|R|² dr = ${I.toFixed(8)}, debería ser 1`,
      );
    }
  }
});

test('R_10 coincide coa forma analítica exacta 2·e^{-r}', () => {
  for (let r = 0; r <= 10; r += 0.25) {
    assert.ok(
      Math.abs(radialWaveFunction(1, 0, r) - 2 * Math.exp(-r)) < 1e-12,
      `R_10(${r}) = ${radialWaveFunction(1, 0, r)}, esperado ${2 * Math.exp(-r)}`,
    );
  }
});

test('R_21 coincide coa forma analítica exacta r·e^{-r/2}/(2√6)', () => {
  const exact = (r: number) => (1 / (2 * Math.sqrt(6))) * r * Math.exp(-r / 2);
  for (let r = 0.5; r <= 15; r += 0.5) {
    assert.ok(
      Math.abs(radialWaveFunction(2, 1, r) - exact(r)) < 1e-12,
      `R_21(${r}) = ${radialWaveFunction(2, 1, r)}, esperado ${exact(r)}`,
    );
  }
});

test('R_32 coincide coa forma analítica exacta 4r²·e^{-r/3}/(81√30)', () => {
  const exact = (r: number) => (4 / (81 * Math.sqrt(30))) * r * r * Math.exp(-r / 3);
  for (let r = 0.5; r <= 20; r += 0.5) {
    assert.ok(
      Math.abs(radialWaveFunction(3, 2, r) - exact(r)) < 1e-12,
      `R_32(${r}) = ${radialWaveFunction(3, 2, r)}, esperado ${exact(r)}`,
    );
  }
});

// ---------------------------------------------------------------------------
// 3. Radio medio — verifica a FORMA, non só a normalización
// ---------------------------------------------------------------------------

test('⟨r⟩ coincide co resultado teórico (3n² − l(l+1))/2', () => {
  for (let n = 1; n <= 5; n++) {
    for (let l = 0; l < n; l++) {
      const theory = (3 * n * n - l * (l + 1)) / 2;
      const got = meanRadius(n, l);
      assert.ok(
        Math.abs(got - theory) < 1e-6 * theory,
        `(n=${n}, l=${l}): ⟨r⟩ = ${got.toFixed(6)}, teoría = ${theory}`,
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 4. Nodos radiais — n − l − 1
// ---------------------------------------------------------------------------

test('o número de nodos radiais é n − l − 1', () => {
  for (let n = 1; n <= 6; n++) {
    for (let l = 0; l < n; l++) {
      const expected = n - l - 1;
      const got = countRadialNodes(n, l);
      assert.equal(got, expected, `(n=${n}, l=${l}): ${got} nodos, esperados ${expected}`);
    }
  }
});

// ---------------------------------------------------------------------------
// 5. Harmónicos esféricos: normalización angular
// ---------------------------------------------------------------------------

test('a parte angular está normalizada: ∮|Y|² dΩ = 1', () => {
  for (const [l, m] of [[0, 0], [1, 0], [1, 1], [1, -1], [2, 0], [2, 1], [2, 2], [2, -2]]) {
    const I = angularNorm(l, m);
    assert.ok(
      Math.abs(I - 1) < 5e-3,
      `Y_${l}^${m}: ∮|Y|² dΩ = ${I.toFixed(6)}, debería ser 1`,
    );
  }
});

test('sphericalHarmonic devolve a mesma magnitude que a parte real', () => {
  // Para m≠0, o harmónico complexo debe ter |Y|² independente de φ
  const l = 1;
  const m = 1;
  const theta = Math.PI / 2;
  const magnitudes: number[] = [];
  for (let phi = 0; phi < 2 * Math.PI; phi += 0.4) {
    const Y = sphericalHarmonic(l, m, theta, phi);
    magnitudes.push(Math.hypot(Y.real, Y.imag));
  }
  const min = Math.min(...magnitudes);
  const max = Math.max(...magnitudes);
  assert.ok(
    max - min < 1e-12,
    `|Y_1^1| debería ser constante en φ: min=${min}, max=${max}`,
  );
});

// ---------------------------------------------------------------------------
// 6. Orbitais híbridos: ortonormalidade (sp, sp², sp³)
// ---------------------------------------------------------------------------

test('os orbitais híbridos son ortonormais: ⟨h_i|h_j⟩ = δ_ij', () => {
  // Os híbridos son combinacións lineais de 2s, 2px, 2py, 2pz con coeficientes
  // coñecidos. En vez de integrar en 3D (caro e impreciso), constrúese a matriz
  // de solapamento dos catro orbitais atómicos — que se reduce a un produto
  // dunha integral radial por unha angular — e aplícanse os coeficientes.
  // Isto é exacto e rápido.

  // --- Parte radial: integrar R por tramos Nunha soa vez ---
  const rad = (l: number, r: number) => radialWaveFunction(2, l, r);
  const radialPairs = (la: number, lb: number) => {
    const dr = 0.002;
    const rmax = 60;
    let acc = 0;
    for (let r = dr / 2; r < rmax; r += dr) acc += rad(la, r) * rad(lb, r) * r * r * dr;
    return acc;
  };

  // --- Parte angular: ∮ Y_a Y_b dΩ, con Y reais de l=0 e l=1 ---
  // m>0 -> cos(mφ)  ·  m<0 -> sin(|m|φ)   (igual que realWaveFunction)
  const Nth = 3000;
  const Nph = 3000;
  const angularPair = (la: number, ma: number, lb: number, mb: number) => {
    const norm = (l: number, m: number) => {
      const a = Math.abs(m);
      return Math.sqrt(((2 * l + 1) * factorial(l - a)) / (4 * Math.PI * factorial(l + a)));
    };
    const trig = (m: number, phi: number) => {
      if (m === 0) return 1;
      return Math.sqrt(2) * (m > 0 ? Math.cos(m * phi) : Math.sin(Math.abs(m) * phi));
    };
    let acc = 0;
    for (let a = 0; a < Nth; a++) {
      const theta = ((a + 0.5) * Math.PI) / Nth;
      const u = Math.cos(theta);
      const pa = legendre(la, ma, u);
      const pb = legendre(lb, mb, u);
      const wTheta = Math.sin(theta) * (Math.PI / Nth) * ((2 * Math.PI) / Nph);
      for (let b = 0; b < Nph; b++) {
        const phi = ((b + 0.5) * 2 * Math.PI) / Nph;
        const ya = trig(ma, phi) * pa * norm(la, ma);
        const yb = trig(mb, phi) * pb * norm(lb, mb);
        acc += ya * yb * wTheta;
      }
    }
    return acc;
  };

  // Orden: [2s, 2px, 2py, 2pz]  ->  (l,m) = (0,0), (1,1), (1,-1), (1,0)
  const basis: Array<[number, number]> = [[0, 0], [1, 1], [1, -1], [1, 0]];
  const S: number[][] = basis.map(([la, ma]) =>
    basis.map(([lb, mb]) => radialPairs(la, lb) * angularPair(la, ma, lb, mb)),
  );

  // Os orbitais atómicos de partida deben ser ortonormais — comprobación propia
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const expected = i === j ? 1 : 0;
      assert.ok(
        Math.abs(S[i][j] - expected) < 1e-5,
        `orbital atómico ${i}/${j}: solapamento ${S[i][j].toFixed(4)}, esperado ${expected}`,
      );
    }
  }

  // Coeficientes dos híbridos (idénticos a hybridWaveFunction)
  const r3 = 1 / Math.sqrt(3);
  const COEFF: Record<string, number[][]> = {
    sp: [
      [1 / Math.SQRT2, 0, 0, 1 / Math.SQRT2],
      [1 / Math.SQRT2, 0, 0, -1 / Math.SQRT2],
    ],
    sp2: [
      [r3, Math.sqrt(2 / 3), 0, 0],
      [r3, -1 / Math.sqrt(6), 1 / Math.SQRT2, 0],
      [r3, -1 / Math.sqrt(6), -1 / Math.SQRT2, 0],
    ],
    sp3: [
      [0.5, 0.5, 0.5, 0.5],
      [0.5, 0.5, -0.5, -0.5],
      [0.5, -0.5, 0.5, -0.5],
      [0.5, -0.5, -0.5, 0.5],
    ],
  };

  for (const type of ['sp', 'sp2', 'sp3'] as const) {
    const C = COEFF[type];
    for (let i = 0; i < C.length; i++) {
      for (let j = 0; j < C.length; j++) {
        let got = 0;
        for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) got += C[i][a] * C[j][b] * S[a][b];
        const expected = i === j ? 1 : 0;
        assert.ok(
          Math.abs(got - expected) < 1e-6,
          `${type}: ⟨h${i}|h${j}⟩ = ${got.toFixed(6)}, esperado ${expected}`,
        );
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 7. Coherencia da fase (a cor que ve o alumnado)
// ---------------------------------------------------------------------------

test('os orbitais reais m=0 non mudan de signo no plano xy', () => {
  // Un orbital s non ten nodos angulares: o signo debe ser constante
  for (let l = 0; l <= 0; l++) {
    const values: number[] = [];
    for (let phi = 0; phi < 2 * Math.PI; phi += 0.3) {
      values.push(realWaveFunction(1, l, 0, 2, Math.PI / 2, phi));
    }
    assert.ok(
      values.every((v) => v > 0) || values.every((v) => v < 0),
      'un orbital 1s debe ter signo constante',
    );
  }
});

test('un orbital 2p_z ten nodo no plano xy (forma correcta)', () => {
  // No plano xy (θ=π/2) o 2p_z debe anularse
  const onPlane = realWaveFunction(2, 1, 0, 5, Math.PI / 2, 0);
  assert.ok(Math.abs(onPlane) < 1e-12, `2p_z no plano xy = ${onPlane}, debería ser 0`);
  const onAxis = realWaveFunction(2, 1, 0, 5, 0, 0);
  assert.ok(Math.abs(onAxis) > 1e-6, `2p_z sobre o eixe z = ${onAxis}, debería ser ≠ 0`);
});

test('hybridWaveFunction coincide coas combinacións lineais declaradas', () => {
  // Amarra a función real do proxecto ás matrices de coeficientes usadas no
  // test de ortonormalidade. Se alguén cambia os coeficientes, isto falla.
  const pt = (r: number, theta: number, phi: number) => ({
    s: realWaveFunction(2, 0, 0, r, theta, phi),
    px: realWaveFunction(2, 1, 1, r, theta, phi),
    py: realWaveFunction(2, 1, -1, r, theta, phi),
    pz: realWaveFunction(2, 1, 0, r, theta, phi),
  });
  const r3 = 1 / Math.sqrt(3);
  const expected = (type: 'sp' | 'sp2' | 'sp3', i: number, o: ReturnType<typeof pt>) => {
    if (type === 'sp') return (1 / Math.SQRT2) * (o.s + (i === 0 ? 1 : -1) * o.pz);
    if (type === 'sp2') {
      if (i === 0) return r3 * o.s + Math.sqrt(2 / 3) * o.px;
      if (i === 1) return r3 * o.s - (1 / Math.sqrt(6)) * o.px + (1 / Math.SQRT2) * o.py;
      return r3 * o.s - (1 / Math.sqrt(6)) * o.px - (1 / Math.SQRT2) * o.py;
    }
    const sign = [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ][i];
    return 0.5 * (o.s + sign[0] * o.px + sign[1] * o.py + sign[2] * o.pz);
  };
  for (const type of ['sp', 'sp2', 'sp3'] as const) {
    const count = type === 'sp' ? 2 : type === 'sp2' ? 3 : 4;
    for (let i = 0; i < count; i++) {
      for (const [r, theta, phi] of [[1.5, 0.7, 1.1], [4, 2.2, 0.3], [8, 1.0, 5.0]] as const) {
        const got = hybridWaveFunction(type, i, r, theta, phi);
        const exp = expected(type, i, pt(r, theta, phi));
        assert.ok(
          Math.abs(got - exp) < 1e-12,
          `${type}[${i}] en (${r},${theta},${phi}): ${got} vs ${exp}`,
        );
      }
    }
  }
});
