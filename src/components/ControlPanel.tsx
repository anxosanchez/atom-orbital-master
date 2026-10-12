import { useState } from 'react';
import { Activity, ChevronDown, RotateCcw, X } from 'lucide-react';
import { useOrbitalStore } from '../store/useOrbitalStore';
import { orbitalLabel } from '../content/explanations';
import { HYBRID_PALETTE } from '../math/densityVolume';

/**
 * PANEL DE CONTROL ACCESIBLE
 * ==========================
 * Substitución do antigo Sidebar.tsx. Correccións principais (AUDIT.md §4.5):
 *
 *  - TODOS os controis teñen nome accesible real (<label htmlFor> + id). Antes
 *    non había nin un só label, aria-* ou role en todo o proxecto, así que un
 *    lector de pantalla anunciaba "control deslizante" e nada máis.
 *  - Os grupos de botóns usan role="radiogroup"/aria-checked, en vez de
 *    indicar a selección só coa cor.
 *  - Contrastes subidos: os textos de 10-12 px estaban en 3.70:1, 2.52:1 e
 *    mesmo 1.68:1, cando WCAG AA esixe 4.5:1.
 *  - Elimínase o uso de dangerouslySetInnerHTML (devolvíase HTML como cadea).
 *  - Os valores móstranse con aria-valuetext cando a unidade non coincide co
 *    número (p.ex. 0.55 non é "55").
 */

/** Orbitais que ten sentido comparar, escollidos por valor didáctico. */
const COMPARE_PRESETS: Array<{ n: number; l: number }> = [
  { n: 1, l: 0 },
  { n: 2, l: 0 },
  { n: 2, l: 1 },
  { n: 3, l: 0 },
  { n: 3, l: 1 },
  { n: 3, l: 2 },
  { n: 4, l: 0 },
  { n: 4, l: 2 },
  { n: 5, l: 0 },
];

const TYPES = [
  { id: 'real', label: 'Real' },
  { id: 'complex', label: 'Complexo' },
  { id: 'hybrid', label: 'Híbrido' },
] as const;

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint?: string;
  onChange: (v: number) => void;
}

const Slider = ({ id, label, value, min, max, step, display, hint, onChange }: SliderProps) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <label htmlFor={id} className="text-[11px] font-medium text-ink-2">
        {label}
      </label>
      <span className="tnum font-mono text-[11px] font-semibold text-brand-300" aria-hidden="true">
        {display}
      </span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-valuetext={display}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-6 w-full cursor-pointer appearance-none rounded-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/25 [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/25 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-400"
    />
    {hint && <p className="text-[10px] leading-snug text-ink-3">{hint}</p>}
  </div>
);

function ToggleGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  name,
}: {
  legend: string;
  options: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-3">
        {legend}
      </legend>
      <div role="radiogroup" aria-label={legend} className="grid grid-cols-3 gap-1.5">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              id={`${name}-${o.id}`}
              onClick={() => onChange(o.id)}
              className={`rounded-lg border px-1 py-2 text-[10px] font-bold uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                active
                  ? 'border-blue-400/60 bg-blue-500/25 text-blue-100'
                  : 'border-white/20 bg-white/8 text-white/75 hover:bg-white/15'
              }`}
            >
              {active && <span aria-hidden="true">● </span>}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export const ControlPanel = ({ onClose }: { onClose?: () => void }) => {
  const s = useOrbitalStore();
  const [advanced, setAdvanced] = useState(false);

  const isHybrid = s.orbitalType === 'hybrid';
  const hybridCount = s.hybridType === 'sp3' ? 4 : s.hybridType === 'sp2' ? 3 : 2;
  const orbitalName = isHybrid
    ? `${s.hybridType}${s.hybridIndex + 1}`
    : orbitalLabel(s.n, s.l, s.m);

  return (
    <div className="flex h-full flex-col gap-3.5 px-4 py-3.5">
      <header className="flex shrink-0 items-center gap-3">
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-panel bg-gradient-to-br from-brand-400 to-hybrid-500 shadow-lg shadow-brand-500/25 ring-1 ring-inset ring-white/20"
          aria-hidden="true"
        >
          <Activity size={20} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[16px] font-semibold leading-snug tracking-tight text-ink-1">
            Orbitais atómicos
          </h1>
          <p className="text-[9px] font-medium uppercase tracking-[0.14em] leading-relaxed text-ink-3">
            Química · 1º Enxeñaría Forestal
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Pechar os controis"
            className="ml-auto rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 lg:hidden"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </header>

      <div className="relative flex h-[4.5rem] w-full shrink-0 flex-col justify-center overflow-hidden rounded-card border border-brand-500/30 bg-surface-2 pl-4 pr-3 text-left">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-brand-400 to-hybrid-500"
        />
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Estás a ver
        </p>
        <p className="tnum mt-1 break-words font-mono text-[24px] font-semibold leading-[1.25] text-brand-300">
          {orbitalName}
        </p>
      </div>

      <ToggleGroup
        name="tipo"
        legend="Tipo de orbital"
        options={TYPES}
        value={s.orbitalType}
        onChange={s.setOrbitalType}
      />

      {isHybrid ? (
        <div className="space-y-4">
          <ToggleGroup
            name="hib"
            legend="Hibridación"
            options={[
              { id: 'sp', label: 'sp' },
              { id: 'sp2', label: 'sp²' },
              { id: 'sp3', label: 'sp³' },
            ] as const}
            value={s.hybridType}
            onChange={s.setHybridType}
          />
          <fieldset className="space-y-2 rounded-card border border-hybrid-400/25 bg-hybrid-900/30 p-2.5">
            <legend className="px-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-hybrid-300">
              Híbridos que se amosan
            </legend>
            <p className="text-[10px] leading-snug text-white/80">
              Marca un ou varios. Con dous ou máis vense superpostos, cada un coa súa cor, para
              comprobar a xeometría
              {s.hybridType === 'sp3' ? ' tetraédrica (109,5°)' : s.hybridType === 'sp2' ? ' trigonal plana (120°)' : ' lineal (180°)'}.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: hybridCount }, (_, i) => {
                const active = s.hybridSelection.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    onClick={() => s.toggleHybrid(i)}
                    className={`flex items-center gap-1.5 rounded-control border px-2 py-1 text-[10px] font-bold transition-all ${
                      active
                        ? 'border-hybrid-300/70 bg-hybrid-500/25 text-ink-1'
                        : 'border-white/10 bg-surface-3 text-ink-3 hover:text-ink-2'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: HYBRID_PALETTE[s.hybridType][i] }}
                    />
                    {active ? 'Incluído' : 'Oculto'} {i + 1}
                  </button>
                );
              })}
            </div>
            {hybridCount > 1 && (
              <button
                type="button"
                onClick={s.selectAllHybrids}
                className="w-full rounded-control border border-hybrid-400/30 bg-hybrid-900/40 py-1.5 text-[10px] font-semibold text-hybrid-300 transition-colors hover:bg-hybrid-900/70"
              >
                Amosar os {hybridCount} á vez
              </button>
            )}
          </fieldset>
        </div>
      ) : (
        <fieldset className="space-y-4">
          <legend className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-3">
            Números cuánticos
          </legend>
          <Slider
            id="q-n"
            label="Principal (n)"
            value={s.n}
            min={1}
            max={7}
            step={1}
            display={String(s.n)}
            hint="Fixa o tamaño e a enerxía. O radio medra aproximadamente como n²."
            onChange={s.setN}
          />
          <Slider
            id="q-l"
            label="Acimutal (l)"
            value={s.l}
            min={0}
            max={s.n - 1}
            step={1}
            display={`${s.l} (${['s', 'p', 'd', 'f', 'g', 'h'][s.l] ?? '?'})`}
            hint="Fixa a FORMA. Nodos angulares = l."
            onChange={s.setL}
          />
          <Slider
            id="q-m"
            label="Magnético (m)"
            value={s.m}
            min={-s.l}
            max={s.l}
            step={1}
            display={s.m > 0 ? `+${s.m}` : String(s.m)}
            hint="Fixa a ORIENTACIÓN no espazo. Hai 2l+1 valores posibles."
            onChange={s.setM}
          />
        </fieldset>
      )}

      <ToggleGroup
        name="modo"
        legend="Visualización"
        options={[
          { id: 'cloud', label: 'Nube' },
          { id: 'surface', label: 'Superficie' },
        ] as const}
        value={s.visualizationMode}
        onChange={s.setVisualizationMode}
      />

      <Slider
        id="opacity"
        label="Opacidade do volume"
        value={s.opacity}
        min={0.05}
        max={1}
        step={0.01}
        display={`${Math.round(s.opacity * 100)} %`}
        onChange={s.setOpacity}
      />

      {s.visualizationMode === 'surface' && (
        <Slider
          id="isovalue"
          label="Nivel da isosuperficie"
          value={s.isovalue}
          min={0.02}
          max={0.6}
          step={0.01}
          display={`${Math.round(s.isovalue * 100)} % da densidade máxima`}
          hint="Un valor baixo engloba máis volume; un valor alto queda preto do núcleo."
          onChange={s.setIsovalue}
        />
      )}

      <fieldset className="space-y-3 border-t border-white/8 pt-4">
        <legend className="px-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-3">
          Capas didácticas
        </legend>
        <label className="group flex cursor-pointer items-center gap-2.5 rounded-control px-1 py-1 text-[11px] text-ink-2 transition-colors hover:text-ink-1">
          <input
            type="checkbox"
            checked={s.showAxes}
            onChange={(e) => s.setShowAxes(e.target.checked)}
            className="h-4 w-4 accent-brand-400"
          />
          Amosar os eixes x, y, z
        </label>
        <label className="group flex cursor-pointer items-center gap-2.5 rounded-control px-1 py-1 text-[11px] text-ink-2 transition-colors hover:text-ink-1">
          <input
            type="checkbox"
            checked={s.colorMode === 'density'}
            onChange={(e) => s.setColorMode(e.target.checked ? 'density' : 'phase')}
            className="h-4 w-4 accent-brand-400"
          />
          <span>
            Modo densidade (ignorar o signo)
            <span className="block text-[10px] text-white/70">
              Útil para comparar tamaños sen a cor de fase
            </span>
          </span>
        </label>
      </fieldset>

      {/* Axustes avanzados, pregados por defecto para non intimidar */}
      <div className="border-t border-white/8 pt-3">
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          aria-expanded={advanced}
          aria-controls="axustes-avanzados"
          className="flex w-full items-center justify-between rounded-control px-1 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-3 transition-colors hover:text-ink-1"
        >
          Axustes avanzados
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`transition-transform ${advanced ? 'rotate-180' : ''}`}
          />
        </button>

        {advanced && (
          <div id="axustes-avanzados" className="mt-3 space-y-4">
            <Slider
              id="quality"
              label="Resolución do volume"
              value={s.quality}
              min={40}
              max={80}
              step={4}
              display={`${s.quality}³`}
              hint="Máis resolución = máis detalle, pero máis lento en equipos modestos."
              onChange={s.setQuality}
            />
            <button
              type="button"
              onClick={s.reset}
              className="flex w-full items-center justify-center gap-2 rounded-control border border-white/10 bg-surface-3 py-2 text-[11px] font-semibold text-ink-2 transition-colors hover:text-ink-1"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Restaurar os valores iniciais
            </button>
          </div>
        )}
      </div>

      {/* Comparación: só ten sentido en orbitais non híbridos */}
      {!isHybrid && (
        <fieldset className="space-y-2 border-t border-white/8 pt-4">
          <legend className="px-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-3">
            Comparar
          </legend>
          <label className="flex cursor-pointer items-start gap-2.5 text-[11px] text-white/90">
            <input
              type="checkbox"
              checked={!!s.compareWith}
              onChange={(e) => s.setCompareWith(e.target.checked ? { n: 1, l: 0, m: 0 } : null)}
              className="mt-0.5 h-4 w-4 accent-blue-400"
            />
            <span>
              Amosar un segundo orbital na gráfica
              <span className="block text-[10px] text-white/70">
                Superpón a curva P(r) do outro orbital, na mesma escala, para comparar tamaños e
                formas. A vista 3D segue amosando só o orbital actual.
              </span>
            </span>
          </label>

          {s.compareWith && (
            <div className="space-y-1.5">
              <label htmlFor="comparar-con" className="text-[11px] font-medium text-white/85">
                Orbital de comparación
              </label>
              <select
                id="comparar-con"
                value={`${s.compareWith.n}-${s.compareWith.l}`}
                onChange={(e) => {
                  const [cn, cl] = e.target.value.split('-').map(Number);
                  s.setCompareWith({ n: cn, l: cl, m: 0 });
                }}
                className="w-full rounded-control border border-white/12 bg-surface-0 px-2 py-1.5 text-[11px] text-ink-1"
              >
                {COMPARE_PRESETS.map((p) => (
                  <option key={`${p.n}-${p.l}`} value={`${p.n}-${p.l}`}>
                    {orbitalLabel(p.n, p.l, 0)}
                  </option>
                ))}
              </select>
              <p className="text-[10px] leading-snug text-white/70">
                Comparacións útiles: 1s fronte a 2s (tamaño), 2p fronte a 3p (nodos), e
                3d<sub>z²</sub> fronte a 3d<sub>xy</sub> (orientación).
              </p>
            </div>
          )}
        </fieldset>
      )}

      <footer className="mt-1 shrink-0 space-y-0.5 border-t border-white/8 pt-3 text-[9px] leading-snug text-ink-4">
        <p className="font-semibold uppercase tracking-[0.16em] text-ink-3">CC BY-NC</p>
        <p>© Anxo Sánchez (2026)</p>
        <p className="leading-snug">
          Física verificada con tests automáticos.
        </p>
      </footer>
    </div>
  );
};
