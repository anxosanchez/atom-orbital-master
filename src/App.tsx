import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Sidebar } from './components/Sidebar';
import { OrbitalVolume } from './components/OrbitalVolume';
import { RadialChart } from './components/RadialChart';

function App() {
  return (
    <div className="w-full h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Sidebar />

      <div className="ml-80 h-full relative">
        <Canvas dpr={[1, 2]} linear shadow-map>
          <color attach="background" args={['#050505']} />
          <PerspectiveCamera makeDefault position={[5, 5, 10]} fov={45} />

          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <spotLight position={[0, 10, 0]} angle={0.15} penumbra={1} intensity={2} castShadow />

          <OrbitalVolume />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        </Canvas>

        {/* Bottom Analytics Overlay */}
        <div className="absolute bottom-6 right-6 w-96 h-56 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Distribución de Probabilidade Radial P(r)
          </h3>
          <div className="w-full h-40">
            <RadialChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
