"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import type { Feature } from "geojson";
import type { Topology, GeometryObject } from "topojson-specification";
import { feature } from "topojson-client";
import topology from "world-atlas/countries-110m.json";
import { COUNTRIES } from "@/data/countries";
import { INSTITUTIONS } from "@/data/colleges";

const WIDTH = 960;
const HEIGHT = 480;

/** Slugs in our dataset keyed by the country names Natural Earth uses. */
const NAME_TO_SLUG: Record<string, string> = {
  "United States of America": "united-states",
  "United Kingdom": "united-kingdom",
  Canada: "canada",
  Australia: "australia",
  Germany: "germany",
  France: "france",
  "Netherlands": "netherlands",
  Ireland: "ireland",
  Switzerland: "switzerland",
  Singapore: "singapore",
  Japan: "japan",
  "South Korea": "south-korea",
  "United Arab Emirates": "united-arab-emirates",
  "New Zealand": "new-zealand",
};

export interface WorldMapProps {
  activeSlug?: string;
  onSelect?: (slug: string) => void;
  /** Show the tracked-institution markers over India. */
  showIndiaMarkers?: boolean;
}

export default function WorldMap({ activeSlug, onSelect, showIndiaMarkers = false }: WorldMapProps) {
  const [hover, setHover] = useState<string | null>(null);

  const { land, grat } = useMemo(() => {
    const topo = topology as unknown as Topology;
    const fc = feature(topo, topo.objects.countries as GeometryObject);
    const collection = ((fc as { features?: Feature[] }).features ?? []) as Feature[];
    return { land: { features: collection }, grat: geoGraticule10() };
  }, []);

  const projection = useMemo(() => {
    const p = geoNaturalEarth1().fitExtent(
      [
        [8, 8],
        [WIDTH - 8, HEIGHT - 8],
      ],
      { type: "Sphere" } as never,
    );
    return p;
  }, []);

  const path = useMemo(() => geoPath(projection), [projection]);

  const byName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of COUNTRIES) m.set(c.name.toLowerCase(), c.slug);
    return m;
  }, []);

  const indiaMark = projection([78.9, 20.6]);
  const indiaCount = INSTITUTIONS.filter((i) => i.countryId === "in").length;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="World map showing the study destinations tracked in this build"
      >
        <defs>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--map-ocean-a)" />
            <stop offset="100%" stopColor="var(--map-ocean-b)" />
          </linearGradient>
        </defs>

        {/* Ocean / sphere */}
        <path d={path({ type: "Sphere" } as never) ?? undefined} fill="url(#oceanGrad)" />

        {/* Graticule */}
        <path
          d={path(grat) ?? undefined}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={0.5}
          className="text-ink"
        />

        {/* Land */}
        {land.features.map((f, idx) => {
          const name = String((f.properties as { name?: string })?.name ?? "");
          const slug = NAME_TO_SLUG[name] ?? byName.get(name.toLowerCase());
          const tracked = Boolean(slug);
          const isActive = Boolean(activeSlug && slug === activeSlug);
          const isHover = Boolean(hover && slug === hover);
          const d = path(f);
          if (!d) return null;

          return (
            <path
              key={`${name}-${idx}`}
              d={d}
              className={[
                "transition-colors",
                tracked ? "cursor-pointer" : "",
                tracked ? "" : "opacity-70",
              ].join(" ")}
              fill={
                isActive
                  ? "#3ad9ec"
                  : isHover && tracked
                    ? "#8b5cf6"
                    : tracked
                      ? "#2450c7"
                      : "var(--map-land)"
              }
              stroke="var(--map-stroke)"
              strokeWidth={tracked ? 0.8 : 0.4}
              onMouseEnter={() => slug && setHover(slug)}
              onMouseLeave={() => setHover(null)}
              onClick={() => {
                if (slug) {
                  if (onSelect) onSelect(slug);
                  else window.location.assign(`/abroad/${slug}`);
                }
              }}
            >
              <title>
                {tracked ? `${name} — tracked destination` : name}
              </title>
            </path>
          );
        })}

        {/* Labels for tracked destinations */}
        {COUNTRIES.map((c) => {
          const coord = c.coords;
          const pt = projection(coord);
          if (!pt) return null;
          const isActive = activeSlug === c.slug;
          return (
            <g key={c.id} transform={`translate(${pt[0]},${pt[1]})`}>
              <circle
                r={isActive ? 7 : 5}
                fill={isActive ? "#3ad9ec" : "#2450c7"}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <text
                y={-10}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                className="fill-ink dark:fill-slate-100"
                paintOrder="stroke"
                stroke="var(--map-label-halo)"
                strokeWidth={3}
              >
                {c.name}
              </text>
            </g>
          );
        })}

        {showIndiaMarkers && indiaMark && (
          <g transform={`translate(${indiaMark[0]},${indiaMark[1]})`}>
            <circle r={9} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
            <text
              y={-16}
              textAnchor="middle"
              fontSize={13}
              fontWeight={700}
              className="fill-ink dark:fill-slate-100"
              paintOrder="stroke"
              stroke="var(--map-label-halo)"
              strokeWidth={4}
            >
              India · {indiaCount} tracked institutions
            </text>
          </g>
        )}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2450c7]" aria-hidden /> Tracked destination
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3ad9ec]" aria-hidden /> Selected
        </span>
        <span>Geometry: Natural Earth 110m via world-atlas. Positions are approximate at this scale.</span>
      </div>

      {hover && (
        <div className="pointer-events-none absolute right-3 top-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-ink shadow-lg dark:bg-[#101a33]/95 dark:text-slate-100">
          {COUNTRIES.find((c) => c.slug === hover)?.name ?? hover}
          <span className="ml-2 text-ink-faint">click to open</span>
        </div>
      )}
    </div>
  );
}
