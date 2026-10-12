import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  buildDensityVolumeBytes,
  visualizationRange,
  type TextureRequest,
} from '../math/densityVolume';

/**
 * TEXTURA DE DENSIDADE, CALCULADA FÓRA DO FÍO PRINCIPAL
 * ====================================================
 * Xestiona a xeración do volume de densidade nun Web Worker, co volume
 * anterior visible mentres se calcula o novo. Isto elimina os saltos ao
 * arrastrar os controis (AUDIT.md F2).
 *
 * Decisións de deseño:
 *
 *  - **Nunca se queda en branco.** Mentres o worker calcula, mantense a
 *    textura anterior. Así o alumnado ve o orbital cambiar de forma fluída en
 *    vez de parpadear a negro.
 *  - **Descártaanse as respostas obsoletas.** Se se move un control varias
 *    veces seguidas, só se aplica a última petición (comparación de
 *    `requestId`). Sen isto, unha resposta lenta podería sobrescribir unha
 *    máis recente e amosar un orbital que xa non corresponde.
 *  - **Reserva síncrona.** Se o navegador non pode crear o worker (ou falla),
 *    cárgase a mesma función pura no fío principal. A aplicación nunca queda
 *    sen visualización.
 *  - **`dispose()` da textura anterior**: libera a memoria de GPU, que na
 *    versión orixinal se filtrabа (~4 MiB por cambio de parámetro).
 */

export interface DensityTexture {
  texture: THREE.Data3DTexture | null;
  /** Densidade máxima real do orbital (a₀⁻³), antes de normalizar. */
  maxDensity: number;
  /** Semiancho da caixa en a₀ (derívase da probabilidade, non de n*10+5). */
  range: number;
  /** True mentres hai un cálculo en curso. */
  busy: boolean;
}

function makeTexture(data: Uint8Array, size: number): THREE.Data3DTexture {
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RGBAFormat;
  // 8 bits: compatible con TODAS as GPU (ver nota en densityVolume.ts)
  tex.type = THREE.UnsignedByteType;
  tex.unpackAlignment = 1;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.wrapR = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function useDensityTexture(request: TextureRequest): DensityTexture {
  const { type, n, l, m, hybridType, hybridIndex, quality, gamma, allHybrids } = request;

  const range = visualizationRange({ type, n, l });

  const [state, setState] = useState<{
    texture: THREE.Data3DTexture | null;
    maxDensity: number;
    range: number;
    appliedId: number;
    pendingId: number;
  }>({ texture: null, maxDensity: 0, range, appliedId: 0, pendingId: 0 });

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const textureRef = useRef<THREE.Data3DTexture | null>(null);

  // Crear o worker unha soa vez
  useEffect(() => {
    let worker: Worker | null = null;
    try {
      worker = new Worker(new URL('../workers/texture.worker.ts', import.meta.url), {
        type: 'module',
      });
    } catch {
      worker = null; // sen worker: usarase a reserva síncrona
    }
    workerRef.current = worker;
    return () => {
      worker?.terminate();
      workerRef.current = null;
    };
  }, []);

  // Pedir unha nova textura cando cambia a configuración
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    // Rexistrar a petición en curso (permitido dentro dun efecto)
    setState((prev) => (prev.pendingId === requestId ? prev : { ...prev, pendingId: requestId }));
    const payload: TextureRequest = { type, n, l, m, hybridType, hybridIndex, quality, gamma, allHybrids };

    const apply = (data: Uint8Array, size: number, maxDensity: number, rangeValue: number) => {
      if (requestId !== requestIdRef.current) return; // resposta obsoleta
      const previous = textureRef.current;
      const tex = makeTexture(data, size);
      textureRef.current = tex;
      setState((prev) => ({
        ...prev,
        texture: tex,
        maxDensity,
        range: rangeValue,
        appliedId: requestId,
      }));
      // Liberar a anterior SÓ despois de ter a nova
      previous?.dispose();
    };

    const worker = workerRef.current;
    if (!worker) {
      // Reserva: mesmo cálculo no fío principal
      const res = buildDensityVolumeBytes(payload);
      apply(res.data, res.size, res.maxDensity, res.range);
      return;
    }

    const onMessage = (event: MessageEvent) => {
      const msg = event.data as {
        requestId: number;
        data?: Uint8Array;
        size?: number;
        maxDensity?: number;
        range?: number;
        error?: string;
      };
      if (msg.requestId !== requestIdRef.current) return;
      if (msg.error || !msg.data || msg.size === undefined) {
        // O worker fallou: cae á reserva síncrona en vez de deixar a pantalla baleira
        const res = buildDensityVolumeBytes(payload);
        apply(res.data, res.size, res.maxDensity, res.range);
        return;
      }
      apply(msg.data, msg.size, msg.maxDensity ?? 0, msg.range ?? range);
    };

    worker.addEventListener('message', onMessage);
    worker.postMessage({ ...payload, requestId });
    return () => worker.removeEventListener('message', onMessage);
  }, [type, n, l, m, hybridType, hybridIndex, quality, gamma, allHybrids, range]);

  // Liberar a textura ao desmontar
  useEffect(
    () => () => {
      textureRef.current?.dispose();
      textureRef.current = null;
    },
    [],
  );

  // `busy` derívase do estado (nunca de refs durante o render): hai cálculo
  // pendente sempre que a última textura aplicada non é a petición en curso.
  const busy = state.pendingId !== state.appliedId;

  return {
    texture: state.texture,
    maxDensity: state.maxDensity,
    range,
    busy,
  };
}
