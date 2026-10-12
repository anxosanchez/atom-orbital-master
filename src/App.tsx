import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PanelLeftOpen, PanelLeftClose, BookOpen, Eye } from 'lucide-react';
import { OrbitalVolume } from './components/OrbitalVolume';
import { HybridStack } from './components/HybridStack';
import { CameraRig } from './components/CameraRig';
import { RadialChart } from './components/RadialChart';
import { PhaseLegend } from './components/PhaseLegend';
import { LearnDrawer } from './components/LearnDrawer';
import { Explanation } from './components/Explanation';
import { ControlPanel } from './components/ControlPanel';
import { useOrbitalStore } from './store/useOrbitalStore';
import { useUrlStateSync } from './hooks/useUrlState';

function App() {
  // Mantén a URL sincronizada co estado: permite ligar un exercicio concreto
  useUrlStateSync();

  const panelOpen = useOrbitalStore((s) => s.panelOpen);
  const orbitalType = useOrbitalStore((s) => s.orbitalType);
  const hybridSelection = useOrbitalStore((s) => s.hybridSelection);
  const setPanelOpen = useOrbitalStore((s) => s.setPanelOpen);
  const [explaining, setExplaining] = useState(true);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden font-sans text-ink-1 lg:flex-row">
      {/* Ligazón de salto para navegación por teclado */}
      <a
        href="#escena-3d"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-control focus:bg-brand-500 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Saltar á visualización
      </a>

      {/* Panel de control: fixo en pantallas grandes, desprazable en móbil */}
      <div
        className={`${
          panelOpen ? 'block' : 'hidden'
        } fixed inset-y-0 left-0 z-30 w-80 max-w-[85vw] overflow-y-auto border-r border-white/8 bg-surface-1/95 backdrop-blur-xl lg:static lg:block lg:w-80 lg:shrink-0 lg:bg-surface-1/85`}
        id="panel-controis"
      >
        <ControlPanel onClose={() => setPanelOpen(false)} />
      </div>

      {/* Barra superior para móbil */}
      <div className="flex items-center justify-between gap-2 border-b border-white/8 bg-surface-1 px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setPanelOpen(!panelOpen)}
          aria-expanded={panelOpen}
          aria-controls="panel-controis"
          className="flex items-center gap-2 rounded-control border border-white/10 bg-surface-3 px-3 py-2 text-xs font-semibold text-ink-1 transition-colors hover:bg-white/10"
        >
          {panelOpen ? <PanelLeftClose size={16} aria-hidden="true" /> : <PanelLeftOpen size={16} aria-hidden="true" />}
          {panelOpen ? 'Pechar controis' : 'Controis'}
        </button>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
          Orbitais atómicos
        </span>
        <button
          type="button"
          onClick={() => setExplaining((v) => !v)}
          aria-pressed={explaining}
          className="flex items-center gap-1.5 rounded-control border border-white/10 bg-surface-3 px-3 py-2 text-xs font-semibold text-ink-1 transition-colors hover:bg-white/10"
        >
          <BookOpen size={16} aria-hidden="true" />
          Explicación
        </button>
      </div>

      {/* Escena */}
      <main id="escena-3d" className="relative min-h-0 flex-1">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => gl.setClearColor('#07080b', 1)}
          fallback={
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/80">
              O teu navegador non pode mostrar gráficos 3D (WebGL). A gráfica de distribución radial
              e as explicacións seguen a estar dispoñibles.
            </div>
          }
        >
          <color attach="background" args={['#07080b']} />
          {orbitalType === 'hybrid' && hybridSelection.length > 1 ? (
            <HybridStack />
          ) : (
            <OrbitalVolume />
          )}
          <CameraRig />
        </Canvas>

        {/* Lenda de fase: resolve a cor como única canle e a confusión ψ/|ψ|² */}
        <PhaseLegend />

        {/* Explicación didáctica contextual */}
        {explaining && <Explanation onClose={() => setExplaining(false)} />}

        {/* Caixón de aprendizaxe: accesible desde calquera tamaño */}
        <LearnDrawer />

        {/* Gráfica de distribución radial anotada */}
        <section
          aria-label="Distribución de probabilidade radial"
          className="absolute bottom-3 right-3 w-[min(24rem,calc(100%-1.5rem))] rounded-panel border border-white/8 bg-surface-1/90 p-3 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/5 backdrop-blur-xl"
        >
          <h2 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
            Distribución radial · P(r) = r²|R(r)|²
          </h2>
          <div className="h-36 w-full sm:h-40">
            <RadialChart />
          </div>
        </section>

        {/* Indicador de que os controis existen en móbil */}
        <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-2 rounded-full border border-white/8 bg-surface-1/80 px-3 py-1.5 text-[10px] text-ink-3 backdrop-blur-md lg:flex">
          <Eye size={12} aria-hidden="true" />
          Arrastra para xirar · roda para ampliar · frechas do teclado para moverse
        </div>
      </main>
    </div>
  );
}

export default App;
