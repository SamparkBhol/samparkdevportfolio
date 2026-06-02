"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Marquee } from "@/components/ui/Marquee";
import { PowBurst } from "@/components/effects/PowBurst";
import { Tilt } from "@/components/fx/Tilt";
import { Magnetic } from "@/components/fx/Magnetic";
import { formatDownloads } from "@/lib/format";
import { cn } from "@/lib/cn";

type ShopTier = {
  label: string;
  glow: string;
  border: string;
  panel: "yellow" | "cyan" | "magenta" | "green" | "red";
  coin: string;
  stars: number;
};

// Higher weekly downloads => rarer item => louder glow + more stars on the price tag.
function tierFor(weeklyDownloads: number): ShopTier {
  if (weeklyDownloads >= 15000)
    return {
      label: "LEGENDARY",
      glow: "shadow-[0_0_0_3px_#000,0_0_28px_6px_rgba(255,209,0,0.85)]",
      border: "bg-pop-yellow",
      panel: "yellow",
      coin: "bg-pop-yellow",
      stars: 5,
    };
  if (weeklyDownloads >= 7000)
    return {
      label: "EPIC",
      glow: "shadow-[0_0_0_3px_#000,0_0_24px_5px_rgba(255,0,170,0.7)]",
      border: "bg-pop-magenta",
      panel: "magenta",
      coin: "bg-pop-magenta",
      stars: 4,
    };
  return {
    label: "RARE",
    glow: "shadow-[0_0_0_3px_#000,0_0_18px_4px_rgba(0,224,255,0.6)]",
    border: "bg-pop-cyan",
    panel: "cyan",
    coin: "bg-pop-cyan",
    stars: 3,
  };
}

// Coin "price" derived purely from the existing weeklyDownloads data field.
function coinPrice(weeklyDownloads: number): number {
  return Math.max(1, Math.round(weeklyDownloads / 1000));
}

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export function PowerUpShop() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const ticker = useMemo(
    () =>
      portfolio.packages.map(
        (p) => `${p.name} v${p.version} — ${formatDownloads(p.weeklyDownloads)}/wk`
      ),
    []
  );

  async function copyCmd(id: string, cmd: string) {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1400);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <Stage
      id="packages"
      label="POWER-UPS"
      title="ITEM SHOP"
      subtitle="npm-installable power-ups. Downloads = ammo. Tap the command to grab it."
    >
      {/* Shop marquee / neon sign */}
      <div className="-mt-2 mb-8">
        <Marquee items={ticker} className="-rotate-1" />
      </div>

      {/* The shelf: cards sit on a chunky wooden-shelf bar */}
      <div className="relative">
        <div className="grid gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.packages.map((pkg, i) => {
            const tier = tierFor(pkg.weeklyDownloads);
            const price = coinPrice(pkg.weeklyDownloads);
            const isCopied = copiedId === pkg.id;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 50, rotate: -4 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                  delay: i * 0.12,
                }}
                whileHover={{ y: -8, rotate: i % 2 ? 1.5 : -1.5, scale: 1.02 }}
                className={cn("relative", ROTATIONS[i % ROTATIONS.length])}
              >
                {/* 3D pointer-tilt + glare gives each shop item physical card depth.
                    Pointer-only enhancement — degrades gracefully on touch. */}
                <Tilt className="h-full" max={9}>
                  {/* Glowing rarity halo behind rarer items */}
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -inset-1 rounded-[2px]",
                      tier.glow
                    )}
                  />

                  {/* Coin price tag, dangling off the top-right corner */}
                  <div
                    aria-hidden
                    className="absolute -right-3 -top-4 z-20 flex -rotate-6 items-center gap-1"
                  >
                    <span className="h-4 w-px bg-ink" />
                    <span
                      className={cn(
                        "nb-border nb-shadow flex items-center gap-1 rounded-full px-2 py-1 font-pixel text-[10px] text-ink",
                        tier.coin
                      )}
                    >
                      <span className="grid h-4 w-4 place-items-center rounded-full border-2 border-ink bg-ink/10 font-black text-[9px]">
                        ¢
                      </span>
                      {price}
                    </span>
                  </div>

                  <Panel
                    color={tier.panel}
                    className="relative z-10 flex h-full flex-col p-5"
                  >
                    {/* Rarity ribbon + star rating */}
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={cn(
                          "nb-border bg-ink px-2 py-1 font-pixel text-[9px] uppercase tracking-wider text-paper"
                        )}
                      >
                        {tier.label}
                      </span>
                      <span
                        aria-label={`Rarity ${tier.stars} of 5`}
                        className="font-bang text-lg leading-none text-ink"
                      >
                        {"★".repeat(tier.stars)}
                        <span className="opacity-25">{"★".repeat(5 - tier.stars)}</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-comic text-xl leading-tight">{pkg.name}</h3>
                      <span className="nb-border bg-paper px-1.5 py-0.5 font-pixel text-[10px] text-ink">
                        v{pkg.version}
                      </span>
                    </div>

                    <p className="mt-2 flex-1 font-body text-sm">{pkg.description}</p>

                    {/* Install command — click to copy, flashes COPIED! PowBurst */}
                    <div className="relative my-3">
                      <button
                        type="button"
                        onClick={() => copyCmd(pkg.id, pkg.installCmd)}
                        aria-label={`Copy install command ${pkg.installCmd}`}
                        className="group block w-full nb-border bg-ink p-2 text-left transition-transform hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <code className="block font-mono text-xs text-pop-green">
                          <span aria-hidden className="text-pop-yellow">
                            ${" "}
                          </span>
                          {pkg.installCmd}
                        </code>
                        <span
                          aria-hidden
                          className="mt-1 block font-pixel text-[8px] uppercase text-paper/50 group-hover:text-pop-yellow"
                        >
                          ▶ click to copy
                        </span>
                      </button>
                      <AnimatePresence>
                        {isCopied && (
                          <motion.div
                            key="copied"
                            initial={{ opacity: 0, scale: 0.6, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.6, y: -8 }}
                            transition={{ type: "spring", stiffness: 500, damping: 16 }}
                            className="pointer-events-none absolute -right-2 -top-4 z-30"
                            role="status"
                            aria-live="polite"
                          >
                            <PowBurst word="COPIED!" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Downloads = ammo gauge */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 font-pixel text-[10px] text-ink">
                        <span aria-hidden className="text-base leading-none">
                          ⬇
                        </span>
                        {formatDownloads(pkg.weeklyDownloads)}
                        <span className="opacity-60">/wk</span>
                      </span>
                      {/* Primary action — magnetically pulls toward the cursor. */}
                      <Magnetic strength={0.35}>
                        <ArcadeButton href={pkg.href} color="cyan">
                          VIEW
                        </ArcadeButton>
                      </Magnetic>
                    </div>

                    {/* Tag loot */}
                    <div className="flex flex-wrap gap-2">
                      {pkg.tags.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                  </Panel>
                </Tilt>
              </motion.div>
            );
          })}
        </div>

        {/* Chunky shop shelf bar the items rest on */}
        <div
          aria-hidden
          className="nb-shadow-lg h-4 w-full nb-border bg-ink"
        />
        <div
          aria-hidden
          className="mx-auto -mt-px h-3 w-[92%] nb-border bg-crt"
        />
      </div>
    </Stage>
  );
}
