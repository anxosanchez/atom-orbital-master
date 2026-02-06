import React from 'react';
import { useOrbitalStore } from '../store/useOrbitalStore';
import { Settings, Activity, Camera } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const { n, l, m, visualizationMode, opacity, setN, setL, setM, setVisualizationMode, setOpacity } = useOrbitalStore();

    const getFullOrbitalName = (n: number, l: number, m: number) => {
        const subshells = ['s', 'p', 'd', 'f', 'g'];
        const subshell = subshells[l] || '?';

        // Detailed m-subscript mappings for p and d
        let subscript = '';
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
        } else if (m !== 0) {
            subscript = m > 0 ? `+${m}` : `${m}`;
        }

        return `Orbital ${n}${subshell}${subscript ? `<sub>${subscript}</sub>` : ''}`;
    };

    return (
        <div className="fixed left-0 top-0 h-screen w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-8 z-10 select-none">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight">QUANTUM</h1>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Orbital Architect</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Quantum Numbers</h2>
                        <span
                            className="text-xl font-mono text-blue-400 font-bold"
                            dangerouslySetInnerHTML={{ __html: getFullOrbitalName(n, l, m) }}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-white/40">Principal (n)</span>
                                <span className="text-white">{n}</span>
                            </div>
                            <input
                                type="range" min="1" max="5" step="1" value={n}
                                onChange={(e) => setN(parseInt(e.target.value))}
                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-white/40">Azimuthal (l)</span>
                                <span className="text-white">{l}</span>
                            </div>
                            <input
                                type="range" min="0" max={n - 1} step="1" value={l}
                                onChange={(e) => setL(parseInt(e.target.value))}
                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-white/40">Magnetic (m)</span>
                                <span className="text-white">{m}</span>
                            </div>
                            <input
                                type="range" min={-l} max={l} step="1" value={m}
                                onChange={(e) => setM(parseInt(e.target.value))}
                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Visualization</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setVisualizationMode('cloud')}
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${visualizationMode === 'cloud' ? 'bg-white/20 text-white border border-white/20' : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'}`}
                        >
                            Density Cloud
                        </button>
                        <button
                            onClick={() => setVisualizationMode('surface')}
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${visualizationMode === 'surface' ? 'bg-white/20 text-white border border-white/20' : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'}`}
                        >
                            Isosurface
                        </button>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-white/40">Cloud Opacity</span>
                        </div>
                        <input
                            type="range" min="0.05" max="1" step="0.01" value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex gap-2">
                <button className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Camera size={18} className="text-white/60" />
                    <span className="text-xs font-medium">Reset View</span>
                </button>
                <button className="w-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors">
                    <Settings size={18} className="text-white/60" />
                </button>
            </div>
        </div>
    );
};
