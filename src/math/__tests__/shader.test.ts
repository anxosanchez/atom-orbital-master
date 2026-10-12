/**
 * TESTS DOS SHADERS
 * =================
 * Estes tests nacen de DOUS erros reais e silenciosos, do mesmo tipo:
 *
 *  1. Nunha refactorización quedou unha liña que usaba `uGain` despois de
 *     eliminar ese uniform. GLSL non dá erro por usar un uniform non
 *     declarado: devolve 0. Resultado: `alpha = 0` e a nube invisible.
 *
 *  2. Ao mover o shader a un compoñente novo, quedou un `hybridColor()` que
 *     usaba `uHybridCount` no shader antigo. Nese caso **si** falla a
 *     compilación e **non se debuxa absolutamente nada** — só os eixes — cun
 *     erro en consola que ninguén le.
 *
 * A lección: os shaders son código que NON compila o `tsc` nin analiza o
 * linter, así que hai que verificalos aparte. Estes tests percorren TODOS os
 * ficheiros de compoñentes que declaran un shader, de xeito que engadir un
 * compoñente novo queda cuberto automaticamente.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const componentsDir = join(dirname(fileURLToPath(import.meta.url)), '../../components');

interface ShaderFile {
  name: string;
  source: string;
}

/** Todos os compoñentes que declaran un shader. */
function shaderFiles(): ShaderFile[] {
  return readdirSync(componentsDir)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => ({ name: f, source: readFileSync(join(componentsDir, f), 'utf8') }))
    .filter(
      (f) => f.source.includes('const fragmentShader') || f.source.includes('const vertexShader'),
    );
}

/** Extrae cada shader (vertex e fragment) dun ficheiro. */
function shadersOf(source: string): Array<{ kind: string; body: string }> {
  const out: Array<{ kind: string; body: string }> = [];
  for (const kind of ['vertexShader', 'fragmentShader']) {
    const at = source.indexOf(`const ${kind}`);
    if (at < 0) continue;
    const after = source.slice(at + 1);
    const endRel = after.indexOf('\n`;');
    out.push({ kind, body: after.slice(0, endRel < 0 ? undefined : endRel) });
  }
  return out;
}

test('atópanse os shaders do proxecto (o test non pasa por baleiro)', () => {
  const files = shaderFiles();
  assert.ok(
    files.length >= 2,
    `esperábanse polo menos dous ficheiros con shaders, atopáronse ${files.length}: ${files.map((f) => f.name).join(', ')}`,
  );
});

test('en TODOS os shaders, todo uniform usado está declarado', () => {
  for (const file of shaderFiles()) {
    for (const shader of shadersOf(file.source)) {
      const declared = new Set(
        [...shader.body.matchAll(/uniform\s+\w+\s+(\w+)\s*;/g)].map((m) => m[1]),
      );
      const used = new Set([...shader.body.matchAll(/\b(u[A-Z]\w*)\b/g)].map((m) => m[1]));
      const undeclared = [...used].filter((u) => !declared.has(u));
      assert.deepEqual(
        undeclared,
        [],
        `${file.name} (${shader.kind}): uniforms usados pero NON declarados: ${undeclared.join(', ')} — ` +
          `GLSL compilará con erro (nada se debuxa) ou devolverá 0 en silencio`,
      );
    }
  }
});

test('en TODOS os shaders, todo uniform declarado se alimenta desde TypeScript', () => {
  for (const file of shaderFiles()) {
    for (const shader of shadersOf(file.source)) {
      const declared = [...shader.body.matchAll(/uniform\s+\w+\s+(\w+)\s*;/g)].map((m) => m[1]);
      for (const u of declared) {
        const wired =
          file.source.includes(`${u}:`) ||
          file.source.includes(`${u}.value`) ||
          file.source.includes(`uniforms.${u}`);
        assert.ok(
          wired,
          `${file.name}: o uniform ${u} declárase no shader pero non se alimenta desde TypeScript`,
        );
      }
    }
  }
});

test('a acumulación da nube pode producir alfa distinto de cero', () => {
  for (const file of shaderFiles()) {
    const body = shadersOf(file.source).find((s) => s.kind === 'fragmentShader')?.body;
    if (!body || !body.includes('float alpha = clamp(')) continue;
    const m = body.match(/float alpha = clamp\(([^;]+)\);/);
    assert.ok(m, `${file.name}: non se atopa a fórmula de acumulación`);
    const expr = m[1];
    assert.ok(/uOpacity/.test(expr), `${file.name}: a fórmula debería depender da opacidade`);
    assert.ok(/\bd\b/.test(expr), `${file.name}: a fórmula debería depender da densidade`);
    // Coidado: o argumento pode conter pow(d, 1.25), cuxa coma NON separa
    // argumentos do clamp. Retírase antes de separar por comas.
    const inner = expr.replace(/pow\([^)]*\)/g, 'POW');
    const arg = inner.split(',')[0];
    const factors = [...arg.matchAll(/\*\s*([\d.]+)/g)].map((x) => Number(x[1]));
    assert.ok(factors.length > 0, `${file.name}: sen factor multiplicativo en: ${arg}`);
    const product = factors.reduce((a, b) => a * b, 1);
    assert.ok(product > 0.001, `${file.name}: o produto dos factores é ${product}: nube invisible`);
  }
});

test('non quedan restos de parámetros eliminados nos shaders', () => {
  // uGain e uHybridCount elimináronse ao simplificar; se reaparecen, son restos
  // que rompen a compilación do shader.
  for (const file of shaderFiles()) {
    for (const gone of ['uGain', 'uHybridCount']) {
      assert.ok(
        !new RegExp(`\\b${gone}\\b`).test(file.source),
        `${file.name}: aínda referencia ${gone}, un uniform que xa non existe`,
      );
    }
  }
});
