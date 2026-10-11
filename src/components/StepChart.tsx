"use client";

import { useEffect, useId, useRef, useState } from "react";
import { integerTicks, valueAt, type SeriesPoint } from "@/domain/chartSeries";

/**
 * A small line chart of running totals over time (goals so far, assists so far).
 *
 * - Step lines: a total only changes when something happens, so the line stays flat
 *   between matches and jumps on the day of a goal.
 * - Up to 3 series, coloured --series-1..3 (globals.css). That palette was checked for
 *   colour-blind separation and contrast on the app's light and dark surfaces.
 * - Hover, tap or focus + arrow keys moves a crosshair that snaps to the nearest match
 *   date; the tooltip lists every series at that date.
 * - Each line ends in a dot with its value; a legend names the series. The page also
 *   shows the same data as a list/table (this chart is never the only place it lives).
 *
 * Drawn after mount at the container's real pixel width, so text is never stretched,
 * and dates are formatted in the viewer's own timezone.
 */

export type ChartSeries = { key: string; label: string; points: SeriesPoint[] };

const HEIGHT = 200;
const MARGIN = { top: 12, right: 40, bottom: 28, left: 32 };
const COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];

export function StepChart({
  series,
  start,
  end,
  description,
}: {
  series: ChartSeries[];
  /** First and last moment on the x-axis (ms), e.g. the league's first and latest match. */
  start: number;
  end: number;
  /** One sentence for screen readers, e.g. "Leo's goals and assists over the season". */
  description: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Every moment where some line changes, plus the two ends: the crosshair snaps to these.
  const stops = [...new Set([start, ...series.flatMap((s) => s.points.map((p) => p.t)), end])].sort((a, b) => a - b);
  const maxValue = Math.max(0, ...series.flatMap((s) => s.points.map((p) => p.value)));
  const ticks = integerTicks(maxValue);
  const top = ticks.at(-1)!;

  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (t: number) => MARGIN.left + (end === start ? innerWidth / 2 : ((t - start) / (end - start)) * innerWidth);
  const y = (v: number) => MARGIN.top + innerHeight - (v / top) * innerHeight;

  // Counts are small whole numbers, so lines often sit exactly on top of each other.
  // Each series is nudged a few pixels (centred around the true value) so all of them
  // stay visible; the tooltip and end labels give the exact numbers.
  const OFFSET = 3;
  const nudge = (i: number) => (i - (series.length - 1) / 2) * OFFSET;

  const stepPath = (points: SeriesPoint[], dy: number) => {
    let d = `M${x(start)},${y(0) + dy}`;
    for (const p of points) d += ` H${x(p.t)} V${y(p.value) + dy}`;
    return `${d} H${x(end)}`;
  };

  const ends = series.map((s) => valueAt(s.points, end));
  // End labels only when they don't collide; otherwise the legend and tooltip carry them.
  const endYs = ends.map((v, i) => y(v) + nudge(i));
  const labelsFit = endYs.every((a, i) => endYs.every((b, j) => i === j || Math.abs(a - b) >= 14));

  const date = (t: number, withYear = false) =>
    new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}) });

  function onPointer(event: React.PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left + MARGIN.left;
    let nearest = 0;
    stops.forEach((t, i) => {
      if (Math.abs(x(t) - px) < Math.abs(x(stops[nearest]) - px)) nearest = i;
    });
    setActive(nearest);
  }

  function onKey(event: React.KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      setActive((i) => Math.min(stops.length - 1, Math.max(0, (i ?? (step > 0 ? -1 : stops.length)) + step)));
    } else if (event.key === "Escape") {
      setActive(null);
    }
  }

  const activeT = active !== null ? stops[active] : null;

  return (
    <figure className="m-0">
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-hidden>
          {series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 rounded-full" style={{ background: COLORS[i] }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <div ref={containerRef} className="relative" style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${description}. Latest: ${series.map((s, i) => `${s.label} ${ends[i]}`).join(", ")}. Use the left and right arrow keys to step through dates.`}
            aria-describedby={activeT !== null ? tooltipId : undefined}
            tabIndex={0}
            onKeyDown={onKey}
            onBlur={() => setActive(null)}
            className="overflow-visible rounded-lg focus-visible:outline-2 focus-visible:outline-accent"
          >
            {/* Gridlines and y ticks */}
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={MARGIN.left} x2={MARGIN.left + innerWidth} y1={y(tick)} y2={y(tick)} stroke="var(--line)" strokeWidth={1} />
                <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="tabular fill-muted text-[11px]">
                  {tick}
                </text>
              </g>
            ))}
            {/* X axis: first and last date */}
            <text x={x(start)} y={HEIGHT - 8} className="fill-muted text-[11px]">
              {date(start)}
            </text>
            {end !== start && (
              <text x={x(end)} y={HEIGHT - 8} textAnchor="end" className="fill-muted text-[11px]">
                {date(end)}
              </text>
            )}

            {/* Crosshair */}
            {activeT !== null && (
              <line x1={x(activeT)} x2={x(activeT)} y1={MARGIN.top} y2={MARGIN.top + innerHeight} stroke="var(--muted)" strokeWidth={1} />
            )}

            {/* Lines, end dots (with a ring in the surface colour) and end values */}
            {series.map((s, i) => (
              <g key={s.key}>
                <path d={stepPath(s.points, nudge(i))} fill="none" stroke={COLORS[i]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={x(end)} cy={endYs[i]} r={4} fill={COLORS[i]} stroke="var(--card)" strokeWidth={2} />
                {labelsFit && (
                  <text x={x(end) + 9} y={endYs[i]} dy="0.32em" className="tabular fill-fg text-xs font-semibold">
                    {ends[i]}
                  </text>
                )}
                {activeT !== null && (
                  <circle cx={x(activeT)} cy={y(valueAt(s.points, activeT)) + nudge(i)} r={4} fill={COLORS[i]} stroke="var(--card)" strokeWidth={2} />
                )}
              </g>
            ))}

            {/* Hit area for the pointer: the whole plot, bigger than any line */}
            <rect
              x={MARGIN.left}
              y={MARGIN.top}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onPointerMove={onPointer}
              onPointerDown={onPointer}
              onPointerLeave={() => setActive(null)}
            />
          </svg>
        )}

        {activeT !== null && (
          <div
            id={tooltipId}
            role="status"
            className="pointer-events-none absolute top-0 z-10 min-w-28 rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-md"
            style={x(activeT) > width / 2 ? { right: width - x(activeT) + 8 } : { left: x(activeT) + 8 }}
          >
            <p className="mb-1 font-semibold">{date(activeT, true)}</p>
            {series.map((s, i) => (
              <p key={s.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-muted">
                  <span className="inline-block size-2 rounded-full" style={{ background: COLORS[i] }} />
                  {s.label}
                </span>
                <span className="tabular font-semibold">{valueAt(s.points, activeT)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}
