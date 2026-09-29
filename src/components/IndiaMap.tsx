"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { geoMercator, geoPath, geoGraticule10 } from "d3-geo";
import type { FeatureCollection, Point } from "geojson";
import { INDIAN_STATES } from "@/data/india-states";
import { INSTITUTIONS } from "@/data/colleges";
import type { IndianState } from "@/lib/types";

const WIDTH = 760;
const HEIGHT = 620;

function buildCollection(): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: INDIAN_STATES.map((s) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: s.coords },
      properties: { id: s.id, name: s.name, region: s.region },
    })),
  };
}

const REGION_TONE: Record<IndianState["region"], string> = {
  North: "#2450c7",
  South: "#8753ec",
  East: "#00a8bd",
  West: "#12a150",
  Central: "#b57400",
  Northeast: "#d93b3b",
};

export default function IndiaMap({
  selectedState,
  onSelect,
}: {
  selectedState?: string | null;
  onSelect?: (stateId: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const collection = useMemo(buildCollection, []);

  const projection = useMemo(() => {
    const p = geoMercator().fitExtent(
      [
        [40, 30],
        [WIDTH - 40, HEIGHT - 30],
      ],
      collection,
    );
    return p;
  }, [collection]);

  const path = useMemo(() => geoPath(projection), [projection]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of INSTITUTIONS) {
      if (i.countryId !== "India") continue;
      m.set(i.state, (m.get(i.state) ?? 0) + 1);
    }
    return m;
  }, []);

  const points = useMemo(
    () =>
      INDIAN_STATES.map((s) => {
        const pt = projection(s.coords);
        return { state: s, pt };
      }).filter((x): x is { state: IndianState; pt: [number, number] } => Boolean(x.pt)),
    [projection],
  );

  const sphere = path({ type: "Sphere" } as never);
  const grat = path(geoGraticule10());

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Locator map of Indian states showing how many institutions this build tracks in each"
      >
        <path d={sphere ?? undefined} fill="var(--map-ocean-b)" />
        <path
          d={grat ?? undefined}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={0.5}
          className="text-ink"
        />

        {points.map(({ state, pt }) => {
          const count = counts.get(state.name) ?? 0;
          const isActive = selectedState === state.id;
          const isHover = hover === state.id;
          const r = 7 + Math.sqrt(count) * 5;

          return (
            <g
              key={state.id}
              transform={`translate(${pt[0]},${pt[1]})`}
              className="cursor-pointer"
              onMouseEnter={() => setHover(state.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => {
                if (onSelect) onSelect(state.id);
                else window.location.assign(`/colleges?state=${encodeURIComponent(state.name)}`);
              }}
              tabIndex={0}
              role="button"
              aria-label={`${state.name}: ${count} tracked institution${count === 1 ? "" : "s"}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (onSelect) onSelect(state.id);
                }
              }}
            >
              <circle
                r={isActive ? r + 4 : r}
                fill={count > 0 ? REGION_TONE[state.region] : "#9aa5bb"}
                fillOpacity={isHover || isActive ? 1 : 0.72}
                stroke="#ffffff"
                strokeWidth={isActive ? 3 : 1.5}
              />
              <circle r={2} fill="#ffffff" fillOpacity={0.9} />
              {count > 0 && (
                <text
                  y={-r - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  className="fill-ink dark:fill-slate-100"
                  paintOrder="stroke"
                  stroke="var(--map-label-halo)"
                  strokeWidth={3}
                >
                  {state.name} · {count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-ink-faint">
        {Object.entries(REGION_TONE).map(([region, color]) => (
          <span key={region} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
            {region}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#9aa5bb]" aria-hidden /> No tracked institution
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
        Schematic locator: markers sit at state reference coordinates and are sized by how many institutions this build
        tracks there. <strong>This is not a political boundary map</strong> — no state borders are drawn or implied.
      </p>

      {hover && (
        <div className="pointer-events-none absolute right-3 top-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-ink shadow-lg dark:bg-[#101a33]/95 dark:text-slate-100">
          {INDIAN_STATES.find((s) => s.id === hover)?.name}
          <span className="ml-2 text-ink-faint">
            {counts.get(INDIAN_STATES.find((s) => s.id === hover)?.name ?? "") ?? 0} institutions
          </span>
        </div>
      )}

      <div className="mt-3">
        <Link
          href="/colleges"
          className="text-[13px] font-semibold text-navy-600 dark:text-cyan-300"
        >
          Open the full college database →
        </Link>
      </div>
    </div>
  );
}
