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
                // Cloud Mode: Volumetric additive blending
                alpha = density * uOpacity * stepSize * 2.0;
                float weight = (1.0 - color.a) * alpha;
                color.rgb += weight * phaseColor;
                color.a += weight;
            } else if (density > uThreshold) {
                // Isosurface Mode: Solid shell with shading
                vec3 nextP = vOrigin + rayDir * (t - stepSize);
                float nextD = texture(uTexture, nextP + 0.5).r * uDensityBoost;
                float diff = density - nextD;
                
                // Stronger shading for "solid" look
                float shading = clamp(0.2 + 0.8 * abs(diff * 50.0), 0.3, 1.0);
                color = vec4(phaseColor * shading, 1.0); // Full opacity for the shell
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

        // Dynamic range based on n: r_max ≈ n^2 + 10 or n*12 + 5.
        // For n=3, 41. For n=5, 65.
        const range = n * 12 + 5;

        for (let z = 0; z < size; z++) {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const i = (z * size * size + y * size + x) * 4;

                    // Map grid index to physics space [-0.5, 0.5] -> [-range, range]
                    const px = ((x / (size - 1)) - 0.5) * 2 * range;
                    const py = ((y / (size - 1)) - 0.5) * 2 * range;
                    const pz = ((z / (size - 1)) - 0.5) * 2 * range;

                    const r = Math.sqrt(px * px + py * py + pz * pz);
                    const theta = Math.acos(Math.max(-1, Math.min(1, pz / (r + 0.00001))));
                    const phi = Math.atan2(py, px);

                    const psi = waveFunction(n, l, m, r, theta, phi);
                    const dens = psi.real * psi.real + psi.imag * psi.imag;

                    data[i] = dens;
                    data[i + 1] = psi.real >= 0 ? 1.0 : 0.0; // Phase
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
        // High range boost: when range is larger, density is sampled in more sparse voxels.
        // We'll normalize density by n^6 but also account for the volume.
        const boost = Math.pow(n, 6) * 1000.0;

        return {
            uTexture: { value: texture },
            uOpacity: { value: opacity },
            uSteps: { value: quality * 2 },
            uThreshold: { value: 0.015 / Math.pow(n, 2) }, // Dynamic threshold for isosurface
            uMode: { value: visualizationMode === 'cloud' ? 0 : 1 },
            uDensityBoost: { value: boost }
        };
    }, [texture, opacity, quality, visualizationMode, n]);

    useEffect(() => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial;
            mat.uniforms.uOpacity.value = opacity;
            mat.uniforms.uMode.value = visualizationMode === 'cloud' ? 0 : 1;
            mat.uniforms.uDensityBoost.value = Math.pow(n, 6) * 1000.0;
            mat.uniforms.uThreshold.value = 0.015 / Math.pow(n, 2);
        }
    }, [opacity, visualizationMode, n]);

    return (
        <mesh ref={meshRef} scale={[12, 12, 12]}>
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

