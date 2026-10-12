import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useOrbitalStore } from '../store/useOrbitalStore';
import { worldScaleForRange } from '../math/densityVolume';
import { useDensityTexture } from '../hooks/useDensityTexture';

/**
 * VOLUME DE DENSIDADE ELECTRÓNICA
 * ===============================
 *
 * Renderiza |ψ|² cun raymarch sobre unha textura 3D.
 *
 * CORRECCIÓNS IMPORTANTES respecto da versión anterior (ver AUDIT.md §4.3),
 * ambas confirmadas con capturas reais de Chrome:
 *
 *  1. ENMARCADO. Antes o semiancho da caixa era `n*10+5`, fórmula que deixaba
 *     o 1s como un punto azul nunha pantalla negra (só 6.6 voxels ata o 95%
 *     da probabilidade) e cortaba o 7s (r₉₅ = 105 a₀ nunha caixa de 75 a₀).
 *     Agora derívase da distribución de probabilidade real (r₉₈ × 1.22).
 *
 *  2. SATURACIÓN. Antes `uDensityBoost = n⁶·500` facía que o alfa acumulado
 *     chegase ao tope no PRIMEIRO paso de integración, de xeito que todos os
 *     orbitais se vían como unha mancha plana sen estrutura interna. Agora a
 *     densidade normalízase polo máximo do propio orbital e o brillo obtense
 *     por composición front-to-back, o que preserva gradiente e volume.
 *
 *  3. MODO COMPLEXO. Antes coloreábase por Re(ψ), o que debuxaba catro lóbulos
 *     falsos nun orbital complexo que fisicamente é un toro (|ψ| constante en
 *     φ). Agora os orbitais complexos móstranse cunha cor única.
 */

const vertexShader = /* glsl */ `
  varying vec3 vOrigin;
  varying vec3 vDirection;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Orixe do raio en coordenadas de obxecto (posición da cámara)
    vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPosition, 1.0));
    vDirection = position - vOrigin;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  precision highp sampler3D;

  varying vec3 vOrigin;
  varying vec3 vDirection;

  uniform sampler3D uTexture;   // r = densidade normalizada, g = fase (0/1/0.5)
  uniform float uOpacity;
  uniform int   uSteps;
  uniform float uThreshold;     // limiar de isosuperficie (densidade normalizada)
  uniform int   uMode;          // 0 = nube, 1 = isosuperficie
    uniform int   uColorMode;     // 0 = fase, 1 = densidade

  vec2 hitBox(vec3 orig, vec3 dir) {
    const vec3 boxMin = vec3(-0.5);
    const vec3 boxMax = vec3(0.5);
    vec3 invDir = 1.0 / dir;
    vec3 tmin = (boxMin - orig) * invDir;
    vec3 tmax = (boxMax - orig) * invDir;
    vec3 realMin = min(tmin, tmax);
    vec3 realMax = max(tmin, tmax);
    float t0 = max(max(realMin.x, realMin.y), realMin.z);
    float t1 = min(min(realMax.x, realMax.y), realMax.z);
    return vec2(t0, t1);
  }

  // A cor significa o SIGNO de ψ, non a cantidade de electrón.
  vec3 phaseColor(float phase) {
    return mix(vec3(0.95, 0.30, 0.68), vec3(0.24, 0.62, 1.00), phase);
  }

  // A cor significa o signo de ψ, ou unha soa cor en modo densidade.
  vec3 colourFor(float phase) {
    if (uColorMode == 1) return vec3(0.45, 0.80, 1.00); // densidade: unha soa cor
    return phaseColor(phase);
  }

  void main() {
    vec3 rayDir = normalize(vDirection);
    vec2 bounds = hitBox(vOrigin, rayDir);
    if (bounds.x > bounds.y) discard;

    float t = max(0.0, bounds.x);
    float tEnd = bounds.y;
    float stepSize = (tEnd - t) / float(uSteps);

    if (uMode == 1) {
      // ---- ISOSUPERFICIE ----
      // Unha superficie é unha capa fina: cun paso groso o raio pode saltar por
      // riba dela sen detectala. Emprégase un paso fino e fixo (non o da nube).
      float surfStep = (tEnd - t) / 400.0;
      for (int i = 0; i < 400; i++) {
        if (t >= tEnd) break;
        vec3 p = vOrigin + rayDir * t;
        float d = texture(uTexture, p + 0.5).r;
        if (d > uThreshold) {
          float e = max(surfStep * 1.5, 0.0015);
          float dx = texture(uTexture, p + vec3(e, 0.0, 0.0) + 0.5).r - texture(uTexture, p - vec3(e, 0.0, 0.0) + 0.5).r;
          float dy = texture(uTexture, p + vec3(0.0, e, 0.0) + 0.5).r - texture(uTexture, p - vec3(0.0, e, 0.0) + 0.5).r;
          float dz = texture(uTexture, p + vec3(0.0, 0.0, e) + 0.5).r - texture(uTexture, p - vec3(0.0, 0.0, e) + 0.5).r;
          vec3 n = normalize(vec3(dx, dy, dz) + vec3(1e-6));
          // Iluminación de tres luces ancorada á cámara: unha luz principal
          // cenital-esquerda, un recheo desde a cámara (evita que as caras
          // frontais queden negras) e un remate de silueta.
          vec3 lightDir = normalize(vec3(-0.35, 0.55, 0.75));
          vec3 viewDir = -rayDir;
          float diffuse = clamp(dot(n, lightDir), 0.0, 1.0);
          float fill = clamp(dot(n, viewDir), 0.0, 1.0);
          float rim = pow(1.0 - fill, 2.5);
          float shade = 0.46 + 0.42 * diffuse + 0.28 * fill + 0.16 * rim;
          vec3 base = phaseColor(texture(uTexture, p + 0.5).g);
          vec3 halfV = normalize(lightDir + viewDir);
          float spec = pow(clamp(dot(n, halfV), 0.0, 1.0), 24.0);
          vec3 col = base * shade + vec3(spec) * 0.25;
          gl_FragColor = vec4(col, 1.0);
          return;
        }
        t += surfStep;
      }
      discard;
    }

    // ---- NUBE: composición front-to-back (alfa fonte-sobre) ----
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 256; i++) {
      if (t >= tEnd || acc.a >= 0.995) break;
      vec3 p = vOrigin + rayDir * t;
      vec4 tex = texture(uTexture, p + 0.5);
      // A densidade xa ven normalizada e comprimida desde a textura; aquí só
      // se compón front-to-back.
      float d = clamp(tex.r, 0.0, 1.0);
      if (d > 0.01) {
        // O expoñente >1 fai que o núcleo destaque sobre a cola difusa sen
        // inundar a pantalla. O factor está axustado para que un orbital
        // típico acumule un alfa visible (arredor de 0,6) sen saturar.
        float alpha = clamp(pow(d, 1.25) * uOpacity * 0.15, 0.0, 0.7);
        acc.rgb += (1.0 - acc.a) * alpha * colourFor(tex.g);
        acc.a += (1.0 - acc.a) * alpha;
      }
      t += stepSize;
    }
    if (acc.a < 0.004) discard;
    gl_FragColor = acc;
  }
`;

export const OrbitalVolume: React.FC = () => {
  const n = useOrbitalStore((s) => s.n);
  const l = useOrbitalStore((s) => s.l);
  const m = useOrbitalStore((s) => s.m);
  const quality = useOrbitalStore((s) => s.quality);
  const opacity = useOrbitalStore((s) => s.opacity);
  const visualizationMode = useOrbitalStore((s) => s.visualizationMode);
  const orbitalType = useOrbitalStore((s) => s.orbitalType);
  const hybridType = useOrbitalStore((s) => s.hybridType);
  const hybridIndex = useOrbitalStore((s) => s.hybridIndex);
  const gamma = useOrbitalStore((s) => s.gamma);
  const isovalue = useOrbitalStore((s) => s.isovalue);
  const showAxes = useOrbitalStore((s) => s.showAxes);
  const colorMode = useOrbitalStore((s) => s.colorMode);

  const meshRef = useRef<THREE.Mesh>(null);

  // A textura constrúese nun Web Worker (fóra do fío principal). O hook
  // devolve tamén o rango derivado da probabilidade e se está a calcular.
  const { texture, maxDensity, range, busy } = useDensityTexture({
    type: orbitalType,
    n,
    l,
    m,
    hybridType,
    hybridIndex,
    quality,
    gamma,
  });

  // A escala en mundo é INVERSAMENTE proporcional ao range: así todos os
  // orbitais enchen a pantalla por igual e pódense comparar entre si.
  const sizeScalar = worldScaleForRange();

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uOpacity: { value: opacity },
      uSteps: { value: 256 },
      uThreshold: { value: isovalue },
      uMode: { value: visualizationMode === 'cloud' ? 0 : 1 },
            uColorMode: { value: 0 },
    }),
    // O obxecto de uniforms constrúese unha soa vez; os valores actualízanse
    // no efecto seguinte para non recrear o material en cada cambio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !texture) return;
    const mat = mesh.material as THREE.ShaderMaterial;
    mat.uniforms.uTexture.value = texture;
    mat.uniforms.uOpacity.value = opacity;
    mat.uniforms.uSteps.value = 256;
    mat.uniforms.uThreshold.value = isovalue;
    mat.uniforms.uMode.value = visualizationMode === 'cloud' ? 0 : 1;
    mat.uniforms.uColorMode.value = colorMode === 'density' ? 1 : 0;
    mat.needsUpdate = true;
  }, [texture, opacity, quality, isovalue, visualizationMode, gamma, orbitalType, hybridType, colorMode]);

  return (
    <group>
      {/* Ata que chega a primeira textura non hai nada que amosar */}
      {texture && (
      <mesh ref={meshRef} scale={[sizeScalar, sizeScalar, sizeScalar]}>
        <boxGeometry args={[1, 1, 1]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          // FrontSide é o correcto para unha isosuperficie: o raio atopa a cara
          // que mira á cámara, que é a que ten un gradiente iluminable. Con
          // BackSide a superficie vese escura e apagada.
          side={THREE.FrontSide}
        />
      </mesh>
      )}

      {showAxes && (
        <>
          <axesHelper args={[sizeScalar * 0.62]} />
          <group scale={sizeScalar / 2}>
            <Html position={[1.12, 0, 0]} center zIndexRange={[20, 0]}>
              <div className="pointer-events-none select-none text-sm font-bold text-red-300 drop-shadow">x</div>
            </Html>
            <Html position={[0, 1.12, 0]} center zIndexRange={[20, 0]}>
              <div className="pointer-events-none select-none text-sm font-bold text-emerald-300 drop-shadow">y</div>
            </Html>
            <Html position={[0, 0, 1.12]} center zIndexRange={[20, 0]}>
              <div className="pointer-events-none select-none text-sm font-bold text-blue-300 drop-shadow">z</div>
            </Html>
          </group>
        </>
      )}

      {/* A densidade máxima úsase na interface para amosar a escala real */}
      {/* Indicador discreto de cálculo en curso (accesible) */}
      {busy && (
        <Html position={[0, -sizeScalar * 0.58, 0]} center zIndexRange={[20, 0]}>
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none select-none whitespace-nowrap rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white/80"
          >
            Calculando o volume…
          </div>
        </Html>
      )}

      <group userData={{ maxDensity, range }} />
    </group>
  );
};
