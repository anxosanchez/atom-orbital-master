import { create } from 'zustand';

interface OrbitalState {
    n: number;
    l: number;
    m: number;
    quality: number; // For rendering
    opacity: number;
    mode: 'cloud' | 'surface';
    colorMode: 'phase' | 'density';
    setN: (n: number) => void;
    setL: (l: number) => void;
    setM: (m: number) => void;
    setMode: (mode: 'cloud' | 'surface') => void;
    setColorMode: (mode: 'phase' | 'density') => void;
    setOpacity: (opacity: number) => void;
    setQuality: (quality: number) => void;
}

export const useOrbitalStore = create<OrbitalState>((set) => ({
    n: 3,
    l: 2,
    m: 0,
    quality: 64,
    opacity: 0.5,
    mode: 'cloud',
    colorMode: 'phase',
    setN: (n) => set((state) => {
        const newN = Math.max(1, n);
        const newL = Math.min(state.l, newN - 1);
        const newM = Math.max(-newL, Math.min(newL, state.m));
        return { n: newN, l: newL, m: newM };
    }),
    setL: (l) => set((state) => {
        const newL = Math.max(0, Math.min(l, state.n - 1));
        const newM = Math.max(-newL, Math.min(newL, state.m));
        return { l: newL, m: newM };
    }),
    setM: (m) => set((state) => {
        const newM = Math.max(-state.l, Math.min(state.l, m));
        return { m: newM };
    }),
    setMode: (mode) => set({ mode }),
    setColorMode: (colorMode) => set({ colorMode }),
    setOpacity: (opacity) => set({ opacity }),
    setQuality: (quality) => set({ quality }),
}));
