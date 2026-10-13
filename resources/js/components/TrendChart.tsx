type Point = { label: string; value: number };

export default function TrendChart({
    data,
    height = 150,
    min = 0,
    max = 100,
    suffix = '%',
}: {
    data: Point[];
    height?: number;
    min?: number;
    max?: number;
    suffix?: string;
}) {
    const width = 440;
    const padX = 40;
    const padTop = 14;
    const padBottom = 30;
    const innerW = width - padX - 10;
    const innerH = height - padTop - padBottom;

    const points = data.length > 0 ? data : [{ label: '—', value: 0 }];
    const span = Math.max(1, max - min);

    const coords = points.map((point, index) => {
        const x = padX + (index / Math.max(1, points.length - 1)) * innerW;
        const ratio = (clamp(point.value, min, max) - min) / span;
        const y = padTop + (1 - ratio) * innerH;

        return { x, y, ...point };
    });

    const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    const area = `${line} L${coords[coords.length - 1].x.toFixed(1)} ${padTop + innerH} L${coords[0].x.toFixed(1)} ${padTop + innerH} Z`;

    const gridRatios = [0, 0.5, 1];

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" style={{ stroke: 'none', fill: 'none' }}>
            <defs>
                <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" style={{ stopColor: 'var(--color-chart-fill)', stopOpacity: 0.55 }} />
                    <stop offset="1" style={{ stopColor: 'var(--color-chart-fill)', stopOpacity: 0 }} />
                </linearGradient>
            </defs>

            <g className="stroke-chart-grid" strokeWidth="1" strokeDasharray="3 4">
                {gridRatios.map((ratio) => (
                    <line
                        key={ratio}
                        x1={padX}
                        y1={padTop + ratio * innerH}
                        x2={width - 10}
                        y2={padTop + ratio * innerH}
                    />
                ))}
            </g>

            <g className="fill-chart-axis" fontSize="10" fontFamily="sans-serif" stroke="none">
                <text x="2" y={padTop + 4}>
                    {max}
                    {suffix}
                </text>
                <text x="2" y={padTop + innerH / 2 + 4}>
                    {Math.round((max + min) / 2)}
                    {suffix}
                </text>
                <text x="2" y={padTop + innerH + 4}>
                    {min}
                    {suffix}
                </text>
                {coords.map((c, i) => (
                    <text key={i} x={c.x} y={height - 10} textAnchor="middle">
                        {c.label}
                    </text>
                ))}
            </g>

            <path d={area} fill="url(#trend-fill)" />
            <path d={line} className="stroke-chart-line" strokeWidth="2" fill="none" />

            <g className="fill-chart-dot" style={{ stroke: 'var(--color-panel)' }} strokeWidth="1.5">
                {coords.map((c, i) => (
                    <circle key={i} cx={c.x} cy={c.y} r="3.5" />
                ))}
            </g>
        </svg>
    );
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
