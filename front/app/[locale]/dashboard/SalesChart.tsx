'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { Table2, BarChart3 } from 'lucide-react';
import { apiFetch, formatMoney, SalesSeries } from './lib/api';
import { useLive } from './lib/live';
import { Card, btn } from './ui';

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

// Series colors, checked with the dataviz palette validator on the dark card surface (#10291b)
const SALES_COLOR = '#27a862';
const SHIPPED_COLOR = '#3f82d6';
const GRID = 'rgba(255,255,255,.08)';

const Y_AXIS = 52; // room for the y labels
const CHART_H = 132;
const TOP = 8;

/** Rounds up to 1, 2 or 5 × 10ⁿ so the top gridline lands on a clean number */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(value));
  const n = value / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

const dayLabel = (date: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('es-EC', opts);

/** $1.2K-style ticks for the sales axis */
const compactMoney = (cents: number) => {
  const dollars = cents / 100;
  return dollars >= 1000 ? `$${(dollars / 1000).toLocaleString('es-EC', { maximumFractionDigits: 1 })}K` : `$${dollars.toLocaleString('es-EC')}`;
};

/** Column with a 4px rounded top and a square base */
function columnPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

/** One measure per chart (sales in $, shipments as a count): never two scales on one axis */
function Columns({
  title,
  values,
  color,
  width,
  hover,
  onHover,
  tick,
}: {
  title: string;
  values: number[];
  color: string;
  width: number;
  hover: number | null;
  onHover: (i: number | null) => void;
  tick: (v: number) => string;
}) {
  const max = niceMax(Math.max(...values, 0));
  const plotW = Math.max(width - Y_AXIS, 1);
  const slot = plotW / values.length;
  // Thin columns, at most 24px, with at least a 2px gap between neighbours
  const barW = Math.max(1, Math.min(24, slot - 2));
  const y = (v: number) => TOP + (CHART_H - TOP) * (1 - v / max);
  const indexAt = (clientX: number, rect: DOMRect) => {
    const i = Math.floor((clientX - rect.left - Y_AXIS) / slot);
    return i >= 0 && i < values.length ? i : null;
  };
  return (
    <figure className="m-0">
      <figcaption className="mb-1.5 text-[12.5px] font-semibold text-jb-soft">{title}</figcaption>
      <svg
        width={width}
        height={CHART_H}
        role="img"
        aria-label={title}
        className="block overflow-visible touch-none"
        onPointerMove={(e) => onHover(indexAt(e.clientX, e.currentTarget.getBoundingClientRect()))}
        onPointerLeave={() => onHover(null)}
      >
        {[0, max / 2, max].map((v) => (
          <g key={v}>
            <line x1={Y_AXIS} x2={width} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={1} />
            <text x={Y_AXIS - 8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-jb-muted font-mono text-[10.5px]">
              {tick(v)}
            </text>
          </g>
        ))}
        {hover !== null && <rect x={Y_AXIS + hover * slot} y={TOP} width={slot} height={CHART_H - TOP} fill="rgba(255,255,255,.04)" />}
        {values.map((v, i) =>
          v > 0 ? (
            <path
              key={i}
              d={columnPath(Y_AXIS + i * slot + (slot - barW) / 2, y(v), barW, CHART_H - y(v))}
              fill={color}
              opacity={hover === null || hover === i ? 1 : 0.45}
            />
          ) : null,
        )}
      </svg>
    </figure>
  );
}

/** Overview card: store sales and shipments per day, with a table view */
export default function SalesChart() {
  const [range, setRange] = useState<Range>(30);
  const [data, setData] = useState<SalesSeries | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const load = useCallback(() => {
    apiFetch<SalesSeries>(`/stats/sales?days=${range}`)
      .then((d) => {
        setData(d);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [range]);
  useEffect(() => {
    load();
  }, [load]);
  useLive('orders', load);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [asTable]);

  const days = data?.days ?? [];
  const slot = days.length ? (width - Y_AXIS) / days.length : 0;
  const active = hover !== null ? days[hover] : null;
  // About six date labels, whatever the range
  const every = Math.max(1, Math.ceil(days.length / 6));

  return (
    <Card className="flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[15px] font-bold text-white">Ventas y envíos</h2>
          <p className="m-0 mt-0.5 text-[12.5px] text-jb-muted">Pedidos pagados (sin reembolsos) y pedidos enviados por día.</p>
        </div>
        <div className="flex items-center gap-2">
          <div role="tablist" aria-label="Periodo" className="flex gap-1 p-1 rounded-lg border border-white/[.1]">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md font-mono text-[12px] font-semibold transition cursor-pointer ${
                  range === r ? 'bg-white/[.1] text-white' : 'text-jb-muted hover:text-white'
                }`}
              >
                {r} días
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setAsTable((v) => !v)} className={btn.subtle} title={asTable ? 'Ver gráfico' : 'Ver tabla'}>
            {asTable ? <BarChart3 size={15} /> : <Table2 size={15} />}
            <span className="sr-only sm:not-sr-only">{asTable ? 'Gráfico' : 'Tabla'}</span>
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 m-0">
        {(
          [
            ['Ventas', data ? formatMoney(data.totals.salesCents) : '–', SALES_COLOR],
            ['Pedidos pagados', data ? String(data.totals.orders) : '–', SALES_COLOR],
            ['Envíos', data ? String(data.totals.shipped) : '–', SHIPPED_COLOR],
          ] as const
        ).map(([label, value, color]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="inline-flex items-center gap-1.5 text-[12px] text-jb-muted">
              <span aria-hidden className="w-2 h-2 rounded-[2px]" style={{ background: color }} />
              {label}
            </dt>
            <dd className="m-0 font-mono text-[22px] font-bold leading-none text-white">{value}</dd>
          </div>
        ))}
      </dl>

      {failed && !data ? (
        <p className="m-0 text-[13px] text-amber-300">No se pudieron cargar las ventas.</p>
      ) : asTable ? (
        <div className="max-h-[320px] overflow-auto rounded-lg border border-white/[.08]">
          <table className="w-full text-[13px] border-collapse">
            <thead className="sticky top-0 bg-jb-card">
              <tr className="text-left text-jb-muted">
                <th className="px-3 py-2 font-semibold">Día</th>
                <th className="px-3 py-2 font-semibold text-right">Ventas</th>
                <th className="px-3 py-2 font-semibold text-right">Pedidos</th>
                <th className="px-3 py-2 font-semibold text-right">Envíos</th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((d) => (
                <tr key={d.date} className="border-t border-white/[.06] text-jb-soft">
                  <td className="px-3 py-1.5">{dayLabel(d.date, { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                  <td className="px-3 py-1.5 font-mono text-right">{formatMoney(d.salesCents)}</td>
                  <td className="px-3 py-1.5 font-mono text-right">{d.orders}</td>
                  <td className="px-3 py-1.5 font-mono text-right">{d.shipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={box} className="relative flex flex-col gap-4 min-h-[300px]">
          {width > 0 && days.length > 0 && (
            <>
              <Columns title="Ventas ($)" values={days.map((d) => d.salesCents)} color={SALES_COLOR} width={width} hover={hover} onHover={setHover} tick={compactMoney} />
              <Columns title="Envíos" values={days.map((d) => d.shipped)} color={SHIPPED_COLOR} width={width} hover={hover} onHover={setHover} tick={(v) => (Number.isInteger(v) ? String(v) : '')} />
              <div className="relative h-4" aria-hidden>
                {days.map((d, i) =>
                  i % every === 0 || i === days.length - 1 ? (
                    <span
                      key={d.date}
                      className="absolute top-0 -translate-x-1/2 font-mono text-[10.5px] text-jb-muted whitespace-nowrap"
                      style={{ left: Y_AXIS + (i + 0.5) * slot }}
                    >
                      {dayLabel(d.date)}
                    </span>
                  ) : null,
                )}
              </div>
              {active && hover !== null && (
                <div
                  role="status"
                  className="absolute z-10 px-3 py-2 rounded-lg border border-white/[.12] bg-jb-band shadow-lg pointer-events-none text-[12.5px]"
                  style={{
                    top: 0,
                    left: Math.min(Math.max(Y_AXIS + (hover + 0.5) * slot - 80, 0), Math.max(width - 160, 0)),
                    width: 160,
                  }}
                >
                  <span className="block mb-1 font-semibold text-white">{dayLabel(active.date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  <span className="flex items-center justify-between gap-2 text-jb-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-[2px]" style={{ background: SALES_COLOR }} /> Ventas
                    </span>
                    <span className="font-mono text-white">{formatMoney(active.salesCents)}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2 text-jb-soft">
                    <span className="pl-3.5">Pedidos</span>
                    <span className="font-mono text-white">{active.orders}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2 text-jb-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-[2px]" style={{ background: SHIPPED_COLOR }} /> Envíos
                    </span>
                    <span className="font-mono text-white">{active.shipped}</span>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
