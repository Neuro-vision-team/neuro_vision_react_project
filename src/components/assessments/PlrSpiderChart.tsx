/**
 * PLR left-vs-right radar (spider) chart.
 * Values are normalized to 0–100 for visual shape comparison only.
 * Tooltip shows the raw values with units.
 */
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useUiStore } from '../../store/uiStore';
import type { RadarDataPoint } from '../../utils/plrChart';

interface PlrSpiderChartProps {
  data: RadarDataPoint[];
}

type TooltipPayloadEntry = { payload: RadarDataPoint };

function RawTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-slate-100">{point.metric}</p>
      <p className="text-cyan-300">
        Left: {point.leftRaw}
        {point.unit} <span className="text-slate-500">({point.left}/100)</span>
      </p>
      <p className="text-violet-300">
        Right: {point.rightRaw}
        {point.unit} <span className="text-slate-500">({point.right}/100)</span>
      </p>
    </div>
  );
}

export function PlrSpiderChart({ data }: PlrSpiderChartProps) {
  const theme = useUiStore((s) => s.theme);
  const dark  = theme === 'dark';
  const gridColor = dark ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.25)';
  const tickColor = dark ? '#94a3b8' : '#475569';

  return (
    <div>
      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis dataKey="metric" tick={{ fill: tickColor, fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: tickColor, fontSize: 10 }} angle={90} />
            <Radar name="Left Eye"  dataKey="left"  stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.25} />
            <Radar name="Right Eye" dataKey="right" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.25} />
            <Tooltip content={<RawTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + disclaimer */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Left Eye
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" /> Right Eye
        </span>
      </div>
      <p className="mt-2 text-center text-xs italic text-slate-500">
        Normalized comparison, not direct medical scoring.
      </p>
    </div>
  );
}
