import React from 'react';
import { useOrbitalStore } from '../store/useOrbitalStore';
import { Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const n = useOrbitalStore(s => s.n);
    const l = useOrbitalStore(s => s.l);
    const m = useOrbitalStore(s => s.m);
    const orbitalType = useOrbitalStore(s => s.orbitalType);
    const hybridType = useOrbitalStore(s => s.hybridType);
    const hybridIndex = useOrbitalStore(s => s.hybridIndex);
    const visualizationMode = useOrbitalStore(s => s.visualizationMode);
    const opacity = useOrbitalStore(s => s.opacity);

    const setN = useOrbitalStore(s => s.setN);
    const setL = useOrbitalStore(s => s.setL);
    const setM = useOrbitalStore(s => s.setM);
    const setOrbitalType = useOrbitalStore(s => s.setOrbitalType);
    const setHybridType = useOrbitalStore(s => s.setHybridType);
    const setHybridIndex = useOrbitalStore(s => s.setHybridIndex);
    const setVisualizationMode = useOrbitalStore(s => s.setVisualizationMode);
    const setOpacity = useOrbitalStore(s => s.setOpacity);

    const getFullOrbitalName = () => {
        if (orbitalType === 'hybrid') {
            return `${hybridType}<sub>${hybridIndex + 1}</sub>`;
        }

        const subshells = ['s', 'p', 'd', 'f', 'g'];
        const subshell = subshells[l] || '?';

        // Detailed m-subscript mappings for p and d
        let subscript = '';
        if (orbitalType === 'real') {
            if (l === 1) { // p orbitals
                if (m === 0) subscript = 'z';
                else if (m === 1) subscript = 'x';
                else if (m === -1) subscript = 'y';
            } else if (l === 2) { // d orbitals
                if (m === 0) subscript = 'z²';
                else if (m === 1) subscript = 'xz';
                else if (m === -1) subscript = 'yz';
                else if (m === 2) subscript = 'x²-y²';
                else if (m === -2) subscript = 'xy';
            }
        }

        if (!subscript && m !== 0) {
            subscript = m > 0 ? `+${m}` : `${m}`;
        }

        return `Orbital ${n}${subshell}${subscript ? `<sub>${subscript}</sub>` : ''}`;
    };

    return (
        <div className="fixed left-0 top-0 h-screen w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-8 z-10 select-none overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight text-white">QUANTUM</h1>
                    <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-medium">Arquitecto de Orbitais</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Tipo de Orbital</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {(['complex', 'real', 'hybrid'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setOrbitalType(type)}
                                className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${orbitalType === type ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'}`}
                            >
                                {type === 'complex' ? 'Complexo' : type === 'real' ? 'Real' : 'Híbrido'}
                            </button>
                        ))}
                    </div>
                </div>

                {orbitalType !== 'hybrid' ? (
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Números Cuánticos</h2>
                            <span
                                className="text-xl font-mono text-blue-400 font-bold"
                                dangerouslySetInnerHTML={{ __html: getFullOrbitalName() }}
                            />
                        </div>

                        <div className="space-y-4 px-1">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-white/40">Principal (n)</span>
                                    <span className="text-blue-400">{n}</span>
                                </div>
                                <input
                                    type="range" min="1" max="7" step="1" value={n}
                                    onChange={(e) => setN(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-white/40">Acimutal (l)</span>
                                    <span className="text-blue-400">{l}</span>
                                </div>
                                <input
                                    type="range" min="0" max={n - 1} step="1" value={l}
                                    onChange={(e) => setL(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-white/40">Magnético (m)</span>
                                    <span className="text-blue-400">{m}</span>
                                </div>
                                <input
                                    type="range" min={-l} max={l} step="1" value={m}
                                    onChange={(e) => setM(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Hibridación</h2>
                                <span
                                    className="text-xl font-mono text-purple-400 font-bold"
                                    dangerouslySetInnerHTML={{ __html: getFullOrbitalName() }}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['sp', 'sp2', 'sp3'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setHybridType(type)}
                                        className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${hybridType === type ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 px-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-white/40">Índice de Orbital</span>
                                <span className="text-purple-400">{hybridIndex + 1}</span>
                            </div>
                            <input
                                type="range" min="0" max={hybridType === 'sp3' ? 3 : hybridType === 'sp2' ? 2 : 1} step="1" value={hybridIndex}
                                onChange={(e) => setHybridIndex(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-white/5">
                    <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Visualización</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {(['cloud', 'surface'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setVisualizationMode(mode)}
                                className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${visualizationMode === mode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'}`}
                            >
                                {mode === 'cloud' ? 'Nube de Densidade' : 'Isosuperficie'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2 px-1">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-white/40">Opacidade do Volume</span>
                            <span className="text-blue-400 font-mono">{(opacity * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range" min="0.05" max="1" step="0.01" value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-white/20">
                    <div className="flex items-center gap-1 border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-widest uppercase">
                        CC BY-NC
                    </div>
                </div>
                <p className="text-[10px] text-white/30 font-medium tracking-wide">
                    (c) Anxo Sánchez (2026)
                </p>
            </div>
        </div>
    );
};
