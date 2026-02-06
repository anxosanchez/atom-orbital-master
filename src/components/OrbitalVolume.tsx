import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useOrbitalStore } from '../store/useOrbitalStore';
import { waveFunction } from '../math/physics';

const vertexShader = `
  varying vec3 vOrigin;
  varying vec3 vDirection;
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPosition, 1.0));
    vDirection = position - vOrigin;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  precision highp float;
  precision highp sampler3D;

  varying vec3 vOrigin;
  varying vec3 vDirection;
  varying vec3 vPosition;

  uniform sampler3D uTexture;
  uniform float uOpacity;
  uniform int uSteps;
  uniform float uThreshold;
  uniform int uMode; // 0: Cloud, 1: Isosurface
  uniform float uDensityBoost;

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

  void main() {
    vec3 rayDir = normalize(vDirection);
    vec2 bounds = hitBox(vOrigin, rayDir);
    if (bounds.x > bounds.y) discard;

    float t = max(0.0, bounds.x);
    float tEnd = bounds.y;
    
    vec4 color = vec4(0.0);
    float stepSize = (tEnd - t) / float(uSteps);

    for (int i = 0; i < 128; i++) {
        if (t >= tEnd || color.a >= 0.95) break;
        
        vec3 p = vOrigin + rayDir * t;
        vec3 uv = p + 0.5; // Map [-0.5, 0.5] to [0, 1]
        
        // Sampling 3D Texture
        float density = texture(uTexture, p + 0.5).r * uDensityBoost;
        float phase = texture(uTexture, p + 0.5).g;

        if (density > 0.0001) {
            float alpha = 0.0;
            vec3 phaseColor = mix(vec3(0.95, 0.3, 0.7), vec3(0.2, 0.6, 1.0), phase);

            if (uMode == 0) {
                // Cloud Mode
                alpha = density * uOpacity * stepSize * 2.0; // Scaled by boost
                float weight = (1.0 - color.a) * alpha;
                color.rgb += weight * phaseColor;
                color.a += weight;
            } else if (density > uThreshold) {
                // Isosurface Mode: Basic shading
                vec3 nextP = vOrigin + rayDir * (t - stepSize);
                float nextD = texture(uTexture, nextP + 0.5).r * uDensityBoost;
                float diff = density - nextD;
                
                float shading = clamp(0.3 + 0.7 * abs(diff * 20.0), 0.4, 1.0);
                color = vec4(phaseColor * shading, uOpacity);
                break; 
            }
        }
        
        t += stepSize;
    }

    if (color.a < 0.001) discard;
    gl_FragColor = color;
  }
`;

export const OrbitalVolume: React.FC = () => {
    const { n, l, m, quality, opacity, visualizationMode } = useOrbitalStore();
    const meshRef = useRef<THREE.Mesh>(null);

    // Generate 3D Texture
    const texture = useMemo(() => {
        const size = quality;
        const data = new Float32Array(size * size * size * 4); // RGBA
        const range = 14; // Bohr units

        for (let z = 0; z < size; z++) {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const i = (z * size * size + y * size + x) * 4;

                    // Map grid index to physics space
                    const px = ((x / size) - 0.5) * 2 * range;
                    const py = ((y / size) - 0.5) * 2 * range;
                    const pz = ((z / size) - 0.5) * 2 * range;

                    const r = Math.sqrt(px * px + py * py + pz * pz);
                    const theta = Math.acos(pz / (r + 0.00001));
                    const phi = Math.atan2(py, px);

                    const psi = waveFunction(n, l, m, r, theta, phi);
                    const dens = psi.real * psi.real + psi.imag * psi.imag;

                    data[i] = dens * 40.0; // Balanced boost
                    data[i + 1] = psi.real >= 0 ? 1 : 0; // Simple phase mapping for G channel
                    data[i + 2] = 0;
                    data[i + 3] = 1;
                }
            }
        }

        const tex = new THREE.Data3DTexture(data, size, size, size);
        tex.format = THREE.RGBAFormat;
        tex.type = THREE.FloatType;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.unpackAlignment = 1;
        tex.needsUpdate = true;
        return tex;
    }, [n, l, m, quality]);

    const uniforms = useMemo(() => {
        // Higher n means density is spread over much larger volume.
        // We need a massive boost for higher n to keep it visible.
        // 1s peak is ~0.3, 3d peak is ~0.00015. Ratio is ~2000.
        // Roughly n^6 or n^8 scaling helps.
        const boost = Math.pow(n, 6) * 50.0;

        return {
            uTexture: { value: texture },
            uOpacity: { value: opacity },
            uSteps: { value: quality * 2 },
            uThreshold: { value: 0.02 }, // Lowered threshold for isosurface
            uMode: { value: visualizationMode === 'cloud' ? 0 : 1 },
            uDensityBoost: { value: boost }
        };
    }, [texture, opacity, quality, visualizationMode, n]);

    useEffect(() => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial;
            mat.uniforms.uOpacity.value = opacity;
            mat.uniforms.uMode.value = visualizationMode === 'cloud' ? 0 : 1;
            mat.uniforms.uDensityBoost.value = Math.pow(n, 6) * 50.0;
        }
    }, [opacity, visualizationMode, n]);

    return (
        <mesh ref={meshRef} scale={[10, 10, 10]}>
            <boxGeometry args={[1, 1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                side={THREE.FrontSide}
            />
        </mesh>
    );
};

