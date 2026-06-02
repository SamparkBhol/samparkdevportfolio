"use client";
import { motion } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Badge } from "@/components/ui/Badge";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { PowBurst } from "@/components/effects/PowBurst";
import { Terminal } from "@/components/terminal/Terminal";
import { cn } from "@/lib/cn";

export function ContinueScreen() {
  const { contact } = portfolio;
  const colors = ["yellow", "cyan", "magenta", "green", "red"] as const;

  return (
    <Stage
      id="contact"
      label="CONTINUE?"
      title="ENTER YOUR NAME"
      subtitle={contact.blurb}
    >
      {/* Arcade marquee: insert-coin call to the REPL */}
      <motion.div
        initial={{ opacity: 0, y: -16, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: -1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="relative z-10 mb-8 flex flex-wrap items-center justify-between gap-3 nb-border nb-shadow-lg bg-ink px-4 py-3 -rotate-1"
      >
        <div className="flex items-center gap-3">
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="font-pixel text-[10px] text-pop-yellow"
          >
            CREDITS: ∞
          </motion.span>
          <span className="font-pixel text-[10px] text-pop-green hidden sm:inline">
            1UP
          </span>
        </div>
        <span className="font-pixel text-[8px] text-pop-cyan">
          ▸ TYPE &apos;help&apos; — OR &apos;play guess&apos; ◂
        </span>
      </motion.div>

      <div className="relative grid gap-8 md:grid-cols-[1.6fr_1fr]">
        {/* LEFT: the live CRT terminal — centerpiece */}
        <motion.div
          initial={{ opacity: 0, x: -40, rotate: 1 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="relative"
        >
          <div className="absolute -top-6 -left-3 z-20 -rotate-6">
            <PowBurst word="BOOT!" />
          </div>
          <Terminal className="relative" />
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="font-pixel text-[8px] text-paper/60">
              CRT-9000 // 80x24
            </span>
            <Badge className="bg-pop-magenta text-ink -rotate-2">
              REPL ONLINE
            </Badge>
          </div>
        </motion.div>

        {/* RIGHT: FIND ME socials panel (real links) */}
        <motion.div
          initial={{ opacity: 0, x: 40, rotate: -2 }}
          whileInView={{ opacity: 1, x: 0, rotate: -1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="-rotate-1 md:mt-6"
        >
          <Panel color="yellow" lg className="relative p-6">
            <p className="font-comic text-3xl mb-1 text-ink">FIND ME</p>
            <SpeechBubble className="mb-5 -rotate-1 text-sm">
              Or skip the shell and ping me at{" "}
              <a
                href={`mailto:${contact.email}`}
                className="font-mono underline decoration-2 underline-offset-2"
              >
                {contact.email}
              </a>
            </SpeechBubble>

            <ul className="space-y-4">
              {contact.socials.map((s, i) => (
                <motion.li
                  key={s.label}
                  initial={{ opacity: 0, x: 24, rotate: i % 2 ? 2 : -2 }}
                  whileInView={{ opacity: 1, x: 0, rotate: i % 2 ? 1 : -1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.15 + i * 0.12,
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                  whileHover={{ x: 6, rotate: 0, scale: 1.02 }}
                  className={cn(
                    "relative",
                    i === 1 && "md:ml-6",
                    i === 2 && "md:-ml-2",
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 font-pixel text-[8px] text-ink/60"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <ArcadeButton
                    href={s.href}
                    color={colors[(i + 1) % colors.length]}
                    className="w-full justify-center"
                  >
                    {s.label} ▸
                  </ArcadeButton>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t-[3px] border-ink/30 pt-3">
              <span className="font-pixel text-[8px] text-ink/70">HI-SCORE</span>
              <span className="font-pixel text-[8px] text-ink" aria-hidden>
                AAA_ 999999
              </span>
            </div>
          </Panel>
        </motion.div>
      </div>
    </Stage>
  );
}
