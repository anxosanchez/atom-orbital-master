import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { radialWaveFunction } from '../math/physics';
import { useOrbitalStore } from '../store/useOrbitalStore';

export const RadialChart: React.FC = () => {
    const n = useOrbitalStore(s => s.n);
    const l = useOrbitalStore(s => s.l);

    const data = useMemo(() => {
        const points = [];
        const maxR = n * n * 5; // Heuristic for range in Bohr units
        const steps = 100;
        const BOHR_TO_ANGSTROM = 0.529177;

        for (let i = 0; i <= steps; i++) {
            const rBohr = (i / steps) * maxR;
            const R_nl = radialWaveFunction(n, l, rBohr);
            const P_r = rBohr * rBohr * R_nl * R_nl;

            points.push({
                r: rBohr * BOHR_TO_ANGSTROM, // Numerical in Angstroms
                prob: P_r,
            });
        }
        return points;
    }, [n, l]);

    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#4facfe" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="r"
                        stroke="#ffffff40"
                        fontSize={10}
                        tick={{ fill: '#ffffff60' }}
                        tickFormatter={(val) => val.toFixed(1)}
                        label={{ value: 'Radio (Å)', position: 'insideBottomRight', offset: 0, fill: '#ffffff40', fontSize: 10 }}
                    />
                    <YAxis hide />
                    <Tooltip
                        labelFormatter={(val) => `Radio: ${val.toFixed(2)} Å`}
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#4facfe' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="prob"
                        stroke="#4facfe"
                        fillOpacity={1}
                        fill="url(#probGradient)"
                        animationDuration={500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
