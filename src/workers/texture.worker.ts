/**
 * WORKER DE XERACIÓN DA TEXTURA 3D
 * ================================
 * A construción do volume de densidade percorre quality³ voxels (262 144 na
 * resolución por defecto) e chamaba a atención de que bloqueaba o fío
 * principal: medido en ~9-40 ms por cambio de parámetro, o que produce saltos
 * ao arrastrar un control deslizante e corta a inercia de `OrbitControls`.
 *
 * Aquí só hai que delegar: toda a física está en `densityVolume.ts`, que é
 * unha función pura e está cuberta por tests propios. O worker devolve o
 * `Float32Array` por TRANSFERENCIA (sen copia) para evitar mover MiB de máis.
 */

import { buildDensityVolumeBytes, type TextureRequest } from '../math/densityVolume';

export interface WorkerRequest extends TextureRequest {
  /** Identificador para descartar respostas obsoletas. */
  requestId: number;
}

export interface WorkerResponse {
  requestId: number;
  data: Uint8Array;
  size: number;
  range: number;
  maxDensity: number;
}

// `self` nun módulo de worker: tipado explícito para que `postMessage` use a
// sobrecarga de Worker (con lista de transferencia) e non a de Window.
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  try {
    const result = buildDensityVolumeBytes(req);
    const response: WorkerResponse = {
      requestId: req.requestId,
      data: result.data,
      size: result.size,
      range: result.range,
      maxDensity: result.maxDensity,
    };
    // Transferencia do buffer: cero copias
    ctx.postMessage(response, [result.data.buffer]);
  } catch (error) {
    // Nunca deixar a interface esperando en silencio
    ctx.postMessage({
      requestId: req.requestId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
