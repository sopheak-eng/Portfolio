"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { contactItems, type ContactItem } from "@/config/contact";
import { contactIcons } from "./contactIcons";

type Point = readonly [number, number];

/** Trunk as a cubic Bézier in 0..1 box coordinates, from the base (bottom) to the top. */
const TRUNK: readonly [Point, Point, Point, Point] = [
  [0.12, 1],
  [0.09, 0.68],
  [0.19, 0.34],
  [0.15, 0.03],
];
/** Seconds for the trunk to grow; each branch starts when the trunk reaches it. */
const TRUNK_GROW = 0.9;
const BRANCH_GROW = 0.5;
/** Tile radius in px (size-12). */
const TILE_RADIUS = 24;
const LINE = "rgba(255, 255, 255, 0.22)";
const LEAF = "#ff1458";

/** Branches bottom → top: where they leave the trunk (0 = base, 1 = top) and where they end (0..1 box). */
const BRANCHES: ReadonlyArray<{ at: number; tip: Point; item?: ContactItem }> = [
  { at: 0.2, tip: [0.5, 0.84], item: contactItems.find((c) => c.icon === "github") },
  { at: 0.38, tip: [0.7, 0.62], item: contactItems.find((c) => c.icon === "linkedin") },
  { at: 0.56, tip: [0.42, 0.42], item: contactItems.find((c) => c.icon === "gmail") },
  { at: 0.74, tip: [0.66, 0.22], item: contactItems.find((c) => c.icon === "telegram") },
  // Top branch: pink leaves.
  { at: 0.9, tip: [0.52, 0.07] },
];

/** Pink leaf dots around the top tip: [dx, dy, radius, opacity] in px. */
const LEAVES: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 0, 4, 0.9],
  [11, -6, 3, 0.7],
  [-9, -8, 3, 0.6],
  [7, 9, 2.5, 0.5],
  [18, 3, 2, 0.45],
  [-13, 5, 2.5, 0.6],
];

function bezier([p0, p1, p2, p3]: typeof TRUNK, t: number): Point {
  const u = 1 - t;
  const mix = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
  return [mix(0), mix(1)];
}

/** Round brand tile. Purely decorative: not a link, no hover, hidden from screen readers. */
function IconTile({ item }: { item: ContactItem }) {
  const Icon = contactIcons[item.icon];
  return (
    <span className="grid size-12 shrink-0 cursor-default place-items-center rounded-full border border-white/15 bg-surface" aria-hidden="true">
      <Icon size={22} style={{ color: item.color }} />
    </span>
  );
}

/**
 * Desktop: a tree beside the form whose branches end in the contact icons.
 * It grows in once when scrolled into view. Nothing on it is interactive.
 */
export function ContactTree() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion() ?? false;
  const grown = reduced || inView;

  // Branches are drawn in px from the measured box, so curves and stroke widths never distort.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const px = ([x, y]: Point): Point => [x * (size?.width ?? 0), y * (size?.height ?? 0)];
  const grow = (delay: number, duration: number) => (reduced ? { duration: 0 } : { delay, duration, ease: "easeOut" as const });

  return (
    <div ref={ref} className="relative h-full min-h-[440px]">
      {size && (
        <svg className="absolute inset-0 overflow-visible" width={size.width} height={size.height} aria-hidden="true">
          <motion.path
            d={`M ${px(TRUNK[0])} C ${px(TRUNK[1])} ${px(TRUNK[2])} ${px(TRUNK[3])}`}
            fill="none"
            stroke={LINE}
            strokeWidth={2}
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: grown ? 1 : 0 }}
            transition={grow(0, TRUNK_GROW)}
          />
          {BRANCHES.map(({ at, tip, item }) => {
            const [ox, oy] = px(bezier(TRUNK, at));
            const [tx, ty] = px(tip);
            // Leaves the trunk heading up and out, then levels off into the tip.
            const d = `M ${ox} ${oy} Q ${ox + (tx - ox) * 0.25} ${ty} ${tx} ${ty}`;
            return (
              <motion.path
                key={item?.label ?? "leaves"}
                d={d}
                fill="none"
                stroke={LINE}
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: grown ? 1 : 0 }}
                transition={grow(TRUNK_GROW * at, BRANCH_GROW)}
              />
            );
          })}
          {LEAVES.map(([dx, dy, r, opacity], index) => {
            const [lx, ly] = px(BRANCHES[BRANCHES.length - 1].tip);
            return (
              <motion.circle
                key={index}
                cx={lx + dx}
                cy={ly + dy}
                r={r}
                fill={LEAF}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: grown ? opacity : 0 }}
                transition={grow(TRUNK_GROW * 0.9 + BRANCH_GROW + index * 0.05, 0.3)}
              />
            );
          })}
        </svg>
      )}

      {BRANCHES.map(({ at, tip: [x, y], item }) =>
        item ? (
          <motion.div
            key={item.label}
            className="absolute cursor-default"
            style={{ left: `calc(${x * 100}% - ${TILE_RADIUS}px)`, top: `calc(${y * 100}% - ${TILE_RADIUS}px)` }}
            initial={reduced ? false : { opacity: 0, scale: 0.6 }}
            animate={grown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={grow(TRUNK_GROW * at + BRANCH_GROW * 0.8, 0.3)}
          >
            <IconTile item={item} />
          </motion.div>
        ) : null,
      )}
    </div>
  );
}

/** Mobile: the four icons in one centred row. Decorative, like the tree. */
export function ContactIconRow() {
  return (
    <div className="flex justify-center gap-3">
      {contactItems.map((item) => (
        <IconTile key={item.label} item={item} />
      ))}
    </div>
  );
}
