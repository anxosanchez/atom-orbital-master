import React from 'react';
import { useOrbitalStore } from '../store/useOrbitalStore';
import { hybridColorRgb } from '../math/densityVolume';
import { useDensityTexture } from '../hooks/useDensityTexture';
import { VolumeMesh } from './VolumeMesh';

/**
 * SUPERPOSICIÓN DE HÍBRIDOS
 * =========================
 * Debuxa cada híbrido seleccionado nunha MALLA INDEPENDENTE, coa súa propia cor.
 * Así se pode escoller amosar 1, 2, 3 ou 4 (sp³) e xirar a escena para
 * comprobar a xeometría: lineal (sp), trigonal plana (sp²) ou tetraédrica (sp³).
 *
 * Por que mallas separadas e non unha soa coloreada polo «híbrido gañador»:
 * a densidade total dun conxunto completo de híbridos é ISÓTROPA
 * (Σ|hᵢ|² = |s|² + Σ|p|², independente da dirección — hai un test que o
 * verifica). Nunha soa malla, o gañador queda definido en todo o cubo, así que
 * o resultado era un cubo coloreado cos bordes visibles e non os catro lóbulos.
 *
 * Os hooks chámanse un a un (non nun bucle) porque as regras dos hooks non
 * permiten chamalos dentro de bucles: son catro chamadas explícitas.
 */
export const HybridStack: React.FC = () => {
  const hybridType = useOrbitalStore((s) => s.hybridType);
  const hybridSelection = useOrbitalStore((s) => s.hybridSelection);
  const quality = useOrbitalStore((s) => s.quality);
  const gamma = useOrbitalStore((s) => s.gamma);
  const opacity = useOrbitalStore((s) => s.opacity);
  const isovalue = useOrbitalStore((s) => s.isovalue);
  const visualizationMode = useOrbitalStore((s) => s.visualizationMode);
  const colorMode = useOrbitalStore((s) => s.colorMode);
  const setBusy = useOrbitalStore((s) => s.setBusy);

  const base = { type: 'hybrid' as const, n: 2, l: 1, m: 0, hybridType, quality, gamma };
  const t0 = useDensityTexture({ ...base, hybridIndex: 0 });
  const t1 = useDensityTexture({ ...base, hybridIndex: 1 });
  const t2 = useDensityTexture({ ...base, hybridIndex: 2 });
  const t3 = useDensityTexture({ ...base, hybridIndex: 3 });
  const textures = [t0, t1, t2, t3];

  const anyBusy = t0.busy || t1.busy || t2.busy || t3.busy;
  React.useEffect(() => {
    setBusy(anyBusy);
  }, [anyBusy, setBusy]);

  const count = hybridType === 'sp3' ? 4 : hybridType === 'sp2' ? 3 : 2;
  const selected = hybridSelection.filter((i) => i >= 0 && i < count);

  return (
    <group>
      {selected.map((idx) => (
        <VolumeMesh
          key={idx}
          texture={textures[idx].texture}
          opacity={opacity}
          isovalue={isovalue}
          visualizationMode={visualizationMode}
          colorMode={colorMode}
          overrideColor={hybridColorRgb(hybridType, idx)}
        />
      ))}
    </group>
  );
};
