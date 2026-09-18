import React from 'react';

interface LinePoint {
  day: string;
  rate: number;
}

interface LineChartProps {
  data: LinePoint[];
  color?: string;
  height?: number;
  unit?: string;
}

export const LineTrendChart: React.FC<LineChartProps> = ({
  data,
  color = '#10b981', // emerald-500
  height = 140,
  unit = '₹',
}) => {
  if (!data || data.length === 0) return null;

  const rates = data.map((d) => d.rate);
  const minRate = Math.min(...rates) * 0.95;
  const maxRate = Math.max(...rates) * 1.05;
  const range = maxRate - minRate || 1;

  const width = 460;
  const paddingX = 30;
  const paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartW;
    const y = height - paddingY - ((d.rate - minRate) / range) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid guide lines */}
        <line
          x1={paddingX}
          y1={paddingY}
          x2={width - paddingX}
          y2={paddingY}
          stroke="#e2e8f0"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={height / 2}
          x2={width - paddingX}
          y2={height / 2}
          stroke="#e2e8f0"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="#cbd5e1"
        />

        {/* Filled Area */}
        <path d={areaD} fill={`url(#gradient-${color.replace('#', '')})`} />

        {/* Line Path */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points & Labels */}
        {points.map((p, i) => (
          <g key={i} className="group">
            <circle
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? 5 : 3.5}
              fill="#ffffff"
              stroke={color}
              strokeWidth={i === points.length - 1 ? 3 : 2}
              className="transition-all hover:r-6 cursor-pointer"
            />
            {/* Value on hover or last node */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-700"
            >
              {unit}{p.rate}
            </text>
            {/* Day label */}
            <text
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              className="text-[9px] fill-slate-400 font-medium"
            >
              {p.day}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

interface BarItem {
  label: string;
  value: number;
  suffix?: string;
  color?: string;
}

export const BarDistributionChart: React.FC<{ items: BarItem[]; maxHeight?: number }> = ({
  items,
}) => {
  const maxValue = Math.max(...items.map((i) => i.value)) || 1;

  return (
    <div className="space-y-3 w-full">
      {items.map((item, index) => {
        const percentage = Math.round((item.value / maxValue) * 100);
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>{item.label}</span>
              <span className="font-semibold text-slate-900">
                {item.value.toLocaleString('en-IN')} {item.suffix || ''}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  item.color || 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
