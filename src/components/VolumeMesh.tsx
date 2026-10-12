import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { DensityTexture } from '../hooks/useDensityTexture';
import { worldScaleForRange } from '../math/densityVolume';

/**
 * MALLA DE VOLUME (raymarch)
 * ==========================
 * Extraída de `OrbitalVolume` para poder renderizar VARIAS mallas á vez, que é
 * o que require a superposición de híbridos.
 *
 * Por que mallas separadas e non unha soa coloreada polo «híbrido gañador»: a
 * densidade total dun conxunto completo de híbridos é isótropa
 * (Σ|hᵢ|² = |s|²+Σ|p|², independente da dirección), así que o gañador queda
 * definido en todo o cubo e o resultado é un cubo coloreado cos bordos
 * visibles, non os catro lóbulos. Con mallas independentes cada lóbulo é un
 * volume real e a xeometría vese sen ambigüidade.
 */

const vertexShader = /* glsl */ `
  varying vec3 vOrigin;
  varying vec3 vDirection;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
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
  uniform float uThreshold;
  uniform int   uMode;          // 0 = nube, 1 = isosuperficie
  uniform int   uColorMode;     // 0 = fase, 1 = densidade
  uniform int   uOverrideColor; // 1 = usar uBaseColor (híbridos superpostos)
  uniform vec3  uBaseColor;

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

  vec3 colourFor(float phase) {
    if (uOverrideColor == 1) return uBaseColor;
    if (uColorMode == 1) return vec3(0.45, 0.80, 1.00);
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
          vec3 lightDir = normalize(vec3(-0.35, 0.55, 0.75));
          vec3 viewDir = -rayDir;
          float diffuse = clamp(dot(n, lightDir), 0.0, 1.0);
          float fill = clamp(dot(n, viewDir), 0.0, 1.0);
          float rim = pow(1.0 - fill, 2.5);
          float shade = 0.46 + 0.42 * diffuse + 0.28 * fill + 0.16 * rim;
          vec3 base = colourFor(texture(uTexture, p + 0.5).g);
          vec3 halfV = normalize(lightDir + viewDir);
          float spec = pow(clamp(dot(n, halfV), 0.0, 1.0), 24.0);
          gl_FragColor = vec4(base * shade + vec3(spec) * 0.25, 1.0);
          return;
        }
        t += surfStep;
      }
      discard;
    }

    vec4 acc = vec4(0.0);
    for (int i = 0; i < 256; i++) {
      if (t >= tEnd || acc.a >= 0.995) break;
      vec3 p = vOrigin + rayDir * t;
      vec4 tex = texture(uTexture, p + 0.5);
      float d = clamp(tex.r, 0.0, 1.0);
      if (d > 0.01) {
        // O expoñente >1 fai que o núcleo destaque sobre a cola difusa sen
        // inundar a pantalla. O factor está axustado para que un orbital
        // típico acumule un alfa visible sen saturar.
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

export interface VolumeMeshProps {
  texture: THREE.Data3DTexture | null;
  opacity: number;
  isovalue: number;
  visualizationMode: 'cloud' | 'surface';
  colorMode: 'phase' | 'density';
  /** Cor fixa; úsase na superposición de híbridos. */
  overrideColor?: string;
}

export const VolumeMesh: React.FC<VolumeMeshProps> = ({
  texture,
  opacity,
  isovalue,
  visualizationMode,
  colorMode,
  overrideColor,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const sizeScalar = worldScaleForRange();

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uOpacity: { value: opacity },
      uSteps: { value: 256 },
      uThreshold: { value: isovalue },
      uMode: { value: visualizationMode === 'cloud' ? 0 : 1 },
      uColorMode: { value: colorMode === 'density' ? 1 : 0 },
      uOverrideColor: { value: overrideColor ? 1 : 0 },
      uBaseColor: { value: new THREE.Color(overrideColor ?? '#ffffff') },
    }),
    // Os valores actualízanse no efecto de abaixo; o obxecto non se recrea.
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
    mat.uniforms.uOverrideColor.value = overrideColor ? 1 : 0;
    mat.uniforms.uBaseColor.value = new THREE.Color(overrideColor ?? '#ffffff');
    mat.needsUpdate = true;
  }, [texture, opacity, isovalue, visualizationMode, colorMode, overrideColor]);

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[sizeScalar, sizeScalar, sizeScalar]}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};

/** Reexportado por comodidade dos consumidores. */
export type { DensityTexture };
