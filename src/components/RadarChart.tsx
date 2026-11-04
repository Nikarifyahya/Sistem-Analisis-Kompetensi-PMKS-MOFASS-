import React from 'react';
import { MofassCategoryId, CategoryScoreResult } from '../types';

interface RadarChartProps {
  scores: Record<MofassCategoryId, CategoryScoreResult>;
  simulatedScores?: Record<MofassCategoryId, number>;
}

export const RadarChart: React.FC<RadarChartProps> = ({ scores, simulatedScores }) => {
  const categories: { id: MofassCategoryId; label: string; code: string }[] = [
    { id: 'M', label: 'Marketing', code: 'M - Pemasaran' },
    { id: 'O', label: 'Operation', code: 'O - Operasi' },
    { id: 'F', label: 'Finance', code: 'F - Kewangan' },
    { id: 'A', label: 'Admin/HR', code: 'A - Pentadbiran' },
    { id: 'S_SALES', label: 'Sales', code: 'S - Jualan' },
    { id: 'S_SYSTEM', label: 'System', code: 'S - Sistem IT' },
  ];

  // Industry average benchmark for PMKS in Malaysia
  const BENCHMARKS: Record<MofassCategoryId, number> = {
    M: 52,
    O: 64,
    F: 58,
    A: 55,
    S_SALES: 60,
    S_SYSTEM: 48,
  };

  const size = 380;
  const center = size / 2;
  const radius = center - 55;
  const angleStep = (Math.PI * 2) / categories.length;

  // Levels rings: 20%, 40%, 60%, 80%, 100%
  const levels = [20, 40, 60, 80, 100];

  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon path for user scores
  const userPoints = categories.map((cat, i) => {
    const val = scores[cat.id]?.percentage || 0;
    return getCoordinates(val, i);
  });
  const userPolygon = userPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Build polygon path for benchmark
  const benchmarkPoints = categories.map((cat, i) => {
    const val = BENCHMARKS[cat.id];
    return getCoordinates(val, i);
  });
  const benchmarkPolygon = benchmarkPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Build polygon path for simulated scores if provided
  const simulatedPoints = simulatedScores
    ? categories.map((cat, i) => {
        const val = simulatedScores[cat.id] ?? scores[cat.id]?.percentage ?? 0;
        return getCoordinates(val, i);
      })
    : null;
  const simulatedPolygon = simulatedPoints ? simulatedPoints.map((p) => `${p.x},${p.y}`).join(' ') : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[380px] h-auto drop-shadow-sm select-none"
        >
          {/* Background Concentric Rings */}
          {levels.map((lvl) => {
            const r = (lvl / 100) * radius;
            return (
              <g key={lvl}>
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={lvl === 100 ? 'none' : '3,3'}
                />
                <text
                  x={center + 4}
                  y={center - r + 10}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {lvl}%
                </text>
              </g>
            );
          })}

          {/* Radial Spokes */}
          {categories.map((cat, i) => {
            const end = getCoordinates(100, i);
            return (
              <line
                key={cat.id}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Industry Benchmark Area */}
          <polygon
            points={benchmarkPolygon}
            fill="#94a3b8"
            fillOpacity="0.15"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          {/* Simulated Score Area (if active) */}
          {simulatedPolygon && (
            <polygon
              points={simulatedPolygon}
              fill="#10b981"
              fillOpacity="0.2"
              stroke="#059669"
              strokeWidth="2"
              strokeDasharray="2,2"
            />
          )}

          {/* User Score Area */}
          <polygon
            points={userPolygon}
            fill="#6366f1"
            fillOpacity="0.35"
            stroke="#4f46e5"
            strokeWidth="2.5"
          />

          {/* User Score Dots */}
          {userPoints.map((p, i) => (
            <g key={`dot-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* Labels for each axis */}
          {categories.map((cat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelR = radius + 28;
            const x = center + labelR * Math.cos(angle);
            const y = center + labelR * Math.sin(angle);
            const scoreVal = scores[cat.id]?.percentage || 0;

            let anchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) anchor = 'start';
            else if (Math.cos(angle) < -0.3) anchor = 'end';

            return (
              <g key={`label-${cat.id}`}>
                <text
                  x={x}
                  y={y - 5}
                  textAnchor={anchor}
                  fill="#1e293b"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {cat.code}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor={anchor}
                  fill="#4f46e5"
                  fontSize="11"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {scoreVal}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-600 border border-white shadow-xs"></span>
          <span className="font-semibold text-slate-800">Skor Syarikat Anda</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed border-slate-500"></span>
          <span>Penanda Aras Industri PMKS</span>
        </div>
        {simulatedScores && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
            <span className="text-emerald-700 font-semibold">Simulasi Sasaran</span>
          </div>
        )}
      </div>
    </div>
  );
};
