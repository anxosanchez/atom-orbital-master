import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { radialWaveFunction } from '../math/physics';
import { getRadialMetrics } from '../math/orbitalMetrics';
import { useOrbitalStore } from '../store/useOrbitalStore';
import { orbitalLabel } from '../content/explanations';

/**
 * DISTRIBUCIÓN DE PROBABILIDADE RADIAL ANOTADA
 * ============================================
 * A versión anterior era unha área baleira: sen eixe Y, sen unidades
 * explicadas e sen ningún valor característico sinalado. Para aprender, o
 * alumnado necesita ver ONDE está o máximo, canto vale e onde están os nodos.
 *
 * Qué se engadiu (ver AUDIT.md D3):
 *  - Eixe Y visible (magnitude real de P(r), en Å⁻¹).
 *  - Marca do RADIO MÁIS PROBABLE (a moda da distribución).
 *  - Marca de ⟨r⟩, o RADIO MEDIO (que NON coincide co máis probable).
 *  - Bandas verticais que sinalan os NODOS RADIAIS.
 *  - Sombreado da rexión que contén o 98% da probabilidade.
 */

const BOHR_TO_ANGSTROM = 0.529177;

export const RadialChart = () => {
  const n = useOrbitalStore((s) => s.n);
  const l = useOrbitalStore((s) => s.l);
  const orbitalType = useOrbitalStore((s) => s.orbitalType);
  const compareWith = useOrbitalStore((s) => s.compareWith);

  const { data, annotations, nodeRadii, yMax, compareLabel } = useMemo(() => {
    const metrics = getRadialMetrics(n, l);
    // Rango ata o 99,5% da probabilidade, para que a cola se vexa completa
    const maxR = metrics.rContain * 1.35;
    const steps = 220;

    const points: Array<{ r: number; prob: number }> = [];
    let yMaxLocal = 0;
    for (let i = 0; i <= steps; i++) {
      const rBohr = (i / steps) * maxR;
      const R = radialWaveFunction(n, l, rBohr);
      // P(r) = r²|R|², e converte a Å⁻¹ multiplicando pola razón de escalas
      const P = (rBohr * rBohr * R * R) / BOHR_TO_ANGSTROM;
      const rAng = rBohr * BOHR_TO_ANGSTROM;
      points.push({ r: rAng, prob: P });
      if (P > yMaxLocal) yMaxLocal = P;
    }

    // Nodos radiais: cambios de signo de R_nl
    const nodeRadiiLocal: number[] = [];
    const drBohr = 0.02;
    let prev = radialWaveFunction(n, l, 1e-6);
    for (let rBohr = 1e-6 + drBohr; rBohr < maxR; rBohr += drBohr) {
      const v = radialWaveFunction(n, l, rBohr);
      if (v === 0) continue;
      if (Math.sign(v) !== Math.sign(prev)) nodeRadiiLocal.push(rBohr * BOHR_TO_ANGSTROM);
      prev = v;
    }

    // ---- Serie de comparación ----
    // Debuxar os dous orbitais na MESMA escala é o que fai útil a comparación:
    // a escala está garantida porque o enmarcado de cada orbital deriva da súa
    // propia probabilidade, non do número cuántico.
    const comparePoints: Array<{ r: number; prob: number }> = [];
    let compareLabel = '';
    if (compareWith) {
      const { n: cn, l: cl } = compareWith;
      compareLabel = orbitalLabel(cn, cl, 0);
      for (let i = 0; i <= steps; i++) {
        const rBohr = (i / steps) * maxR;
        const R = radialWaveFunction(cn, cl, rBohr);
        const P = (rBohr * rBohr * R * R) / BOHR_TO_ANGSTROM;
        comparePoints.push({ r: rBohr * BOHR_TO_ANGSTROM, prob: P });
        if (P > yMaxLocal) yMaxLocal = P;
      }
    }

    // Fusionar as dúas series nunha soa por r, que é o que espera recharts
    const merged = points.map((p, i) => ({
      r: p.r,
      prob: p.prob,
      compare: comparePoints[i]?.prob ?? null,
    }));

    return {
      data: merged,
      annotations: {
        mostProbable: metrics.rMostProbable * BOHR_TO_ANGSTROM,
        meanRadius: metrics.meanRadius * BOHR_TO_ANGSTROM,
        contain98: metrics.rContain * BOHR_TO_ANGSTROM,
        nodes: metrics.nodes,
      },
      nodeRadii: nodeRadiiLocal,
      yMax: yMaxLocal,
      compareLabel,
    };
  }, [n, l, compareWith]);

  const isHybrid = orbitalType === 'hybrid';

  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 6, right: 10, left: -14, bottom: 2 }}>
            <defs>
              <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand-400)" stopOpacity={0.65} />
                <stop offset="95%" stopColor="var(--color-brand-400)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis
              dataKey="r"
              type="number"
              domain={[0, 'dataMax']}
              stroke="var(--color-ink-4)"
              fontSize={10}
              tick={{ fill: 'var(--color-ink-3)' }}
              tickFormatter={(v: number) => v.toFixed(1)}
              label={{
                value: 'r (Å)',
                position: 'insideBottomRight',
                offset: -2,
                fill: 'var(--color-ink-3)',
                fontSize: 10,
              }}
            />
            <YAxis
              stroke="var(--color-ink-4)"
              fontSize={10}
              tick={{ fill: 'var(--color-ink-3)' }}
              width={38}
              domain={[0, yMax * 1.12]}
              tickFormatter={(v: number) => v.toFixed(2)}
              label={{
                value: 'P(r) (Å⁻¹)',
                angle: -90,
                position: 'insideLeft',
                offset: 12,
                fill: 'var(--color-ink-3)',
                fontSize: 9,
              }}
            />
            <Tooltip
              labelFormatter={(v) => `r = ${Number(v).toFixed(2)} Å`}
              formatter={(v) => [Number(v).toFixed(3), 'P(r)']}
              contentStyle={{
                backgroundColor: 'var(--color-surface-1)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                fontSize: '11px',
                color: 'var(--color-ink-1)',
              }}
              labelStyle={{ color: 'var(--color-ink-2)' }}
              itemStyle={{ color: 'var(--color-brand-400)' }}
            />

            {/* Rexión que contén o 98% da probabilidade */}
            <ReferenceArea
              x1={0}
              x2={annotations.contain98}
              fill="var(--color-brand-400)"
              fillOpacity={0.05}
              strokeOpacity={0}
            />

            {/* Nodos radiais */}
            {nodeRadii.map((r, i) => (
              <ReferenceLine
                key={`node-${i}`}
                x={r}
                stroke="var(--color-warn-400)"
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
            ))}

            <Area
              type="monotone"
              dataKey="prob"
              stroke="var(--color-brand-400)"
              strokeWidth={1.8}
              fillOpacity={1}
              fill="url(#probGradient)"
              animationDuration={280}
              isAnimationActive={false}
            />

            {/* Serie de comparación: mesma escala, trazo discontinuo */}
            {compareWith && (
              <Line
                type="monotone"
                dataKey="compare"
                stroke="var(--color-hybrid-400)"
                strokeWidth={1.8}
                strokeDasharray="5 3"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Lenda das dúas series, cando hai comparación */}
      {(compareWith || compareLabel) && (
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-2">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded bg-brand-400" />
            {orbitalLabel(n, l, 0)} (actual)
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-0.5 w-4 rounded"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg,#f093fb 0 4px,transparent 4px 7px)' }}
            />
            {compareLabel} (comparación)
          </span>
          <span className="text-ink-4">mesma escala vertical e horizontal</span>
        </p>
      )}

      {/* Anotacións numéricas: os valores que hai que saber ler */}
      <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] leading-tight sm:grid-cols-4">
        <div>
          <dt className="text-ink-3">Radio máis probable</dt>
          <dd className="tnum font-mono font-semibold text-brand-300">
            {isHybrid ? '—' : `${annotations.mostProbable.toFixed(2)} Å`}
          </dd>
        </div>
        <div>
          <dt className="text-ink-3">Radio medio ⟨r⟩</dt>
          <dd className="tnum font-mono font-semibold text-brand-300">
            {isHybrid ? '—' : `${annotations.meanRadius.toFixed(2)} Å`}
          </dd>
        </div>
        <div>
          <dt className="text-ink-3">98% da probabilidade</dt>
          <dd className="font-mono font-semibold text-ink-1">
            {isHybrid ? '—' : `≤ ${annotations.contain98.toFixed(2)} Å`}
          </dd>
        </div>
        <div>
          <dt className="text-ink-3">Nodos radiais</dt>
          <dd className="font-mono font-semibold">
            <span className="text-warn-300">{annotations.nodes}</span>
            <span className="ml-1 text-ink-4">= n − l − 1</span>
          </dd>
        </div>
      </dl>
    </div>
  );
};
