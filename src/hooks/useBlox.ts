"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  COLS, ROWS, SHAPES, createInitialState, gravityMs, reduce,
  type Action, type BloxState,
} from "@/lib/blox";

const PAL = { bg: "#9bbc0f", grid: "#8bac0f", mid: "#306230", dark: "#0f380f" };
const CELL = 7;
const OX = 4;
const OY = 8;

function drawCell(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = PAL.dark;
  ctx.fillRect(cx, cy, CELL, CELL);
  ctx.fillStyle = PAL.mid;
  ctx.fillRect(cx + 1, cy + 1, CELL - 3, CELL - 3);
}

function drawMini(ctx: CanvasRenderingContext2D, cells: number[][], px: number, py: number, size = 5) {
  for (let r = 0; r < cells.length; r++)
    for (let c = 0; c < cells[r].length; c++)
      if (cells[r][c]) {
        ctx.fillStyle = PAL.dark;
        ctx.fillRect(px + c * size, py + r * size, size, size);
      }
}

export function drawBlox(ctx: CanvasRenderingContext2D, state: BloxState, best: number, next?: number[][]) {
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, 160, 144);

  const pw = COLS * CELL, ph = ROWS * CELL;
  ctx.fillStyle = PAL.grid;
  ctx.fillRect(OX - 1, OY - 1, pw + 2, ph + 2);
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(OX, OY, pw, ph);

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (state.board[r][c]) drawCell(ctx, OX + c * CELL, OY + r * CELL);

  if (state.piece && state.phase !== "gameover") {
    const p = state.piece;
    for (let r = 0; r < p.cells.length; r++)
      for (let c = 0; c < p.cells[r].length; c++)
        if (p.cells[r][c]) drawCell(ctx, OX + (p.x + c) * CELL, OY + (p.y + r) * CELL);
  }

  const panelX = OX + pw + 6;
  ctx.fillStyle = PAL.dark;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = "8px monospace";
  ctx.fillText("NEXT", panelX, OY);
  if (next) drawMini(ctx, next, panelX, OY + 12);
  ctx.fillText("SCORE", panelX, OY + 44);
  ctx.fillText(String(state.score).padStart(6, "0"), panelX, OY + 54);
  ctx.fillText("LINES", panelX, OY + 72);
  ctx.fillText(String(state.lines), panelX, OY + 82);
  ctx.fillText("LV", panelX, OY + 100);
  ctx.fillText(String(state.level), panelX, OY + 110);
  ctx.fillText("BEST", panelX, OY + 122);
  ctx.fillText(String(best).padStart(6, "0"), panelX, OY + 132);

  const overlay = (lines: string[]) => {
    ctx.fillStyle = "rgba(15,56,15,0.82)";
    ctx.fillRect(OX, OY + ph / 2 - 22, pw, 44);
    ctx.fillStyle = PAL.bg;
    ctx.textAlign = "center";
    ctx.font = "9px monospace";
    lines.forEach((l, i) => ctx.fillText(l, OX + pw / 2, OY + ph / 2 - 14 + i * 12));
    ctx.textAlign = "left";
  };
  if (state.phase === "ready") overlay(["PLAYER ONE", "PRESS START"]);
  else if (state.phase === "paused") overlay(["PAUSED"]);
  else if (state.phase === "gameover") overlay(["GAME OVER", "PRESS START"]);
}

export function useBlox(enabled: boolean) {
  const [state, dispatch] = useReducer(
    (s: BloxState, a: Action) => reduce(s, a),
    undefined,
    createInitialState,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    setBest(Number(localStorage.getItem("blox.best") || 0));
  }, []);
  useEffect(() => {
    if (state.score > best) {
      setBest(state.score);
      localStorage.setItem("blox.best", String(state.score));
    }
  }, [state.score, best]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const id = setInterval(() => dispatch("tick"), gravityMs(state.level));
    return () => clearInterval(id);
  }, [state.phase, state.level]);

  useEffect(() => {
    if (!enabled) return;
    const map: Record<string, Action> = {
      ArrowLeft: "left", ArrowRight: "right", ArrowDown: "softDrop", ArrowUp: "rotateCW",
      x: "rotateCW", X: "rotateCW", z: "rotateCCW", Z: "rotateCCW", " ": "hardDrop", Enter: "start",
    };
    const onKey = (e: KeyboardEvent) => {
      const a = map[e.key];
      if (!a) return;
      e.preventDefault();
      dispatch(a);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!ctx) return;
    const nextCells = state.queue[0] ? SHAPES[state.queue[0]] : undefined;
    drawBlox(ctx, state, best, nextCells);
  }, [state, best]);

  return { state, dispatch, canvasRef, best };
}
