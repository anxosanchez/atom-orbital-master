import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { radialWaveFunction } from '../math/physics';
import { useOrbitalStore } from '../store/useOrbitalStore';

export const RadialChart: React.FC = () => {
    const { n, l } = useOrbitalStore();

    const data = useMemo(() => {
        const points = [];
        const maxR = n * n * 5; // Heuristic for range
        const steps = 100;

        for (let i = 0; i <= steps; i++) {
            const r = (i / steps) * maxR;
            const R_nl = radialWaveFunction(n, l, r);
            const P_r = r * r * R_nl * R_nl; // Radial probability density P(r) = r^2 |R(r)|^2

            points.push({
                r: r.toFixed(1),
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
                        label={{ value: 'Radius (a₀)', position: 'insideBottomRight', offset: -10, fill: '#ffffff40', fontSize: 10 }}
                    />
                    <YAxis hide />
                    <Tooltip
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
