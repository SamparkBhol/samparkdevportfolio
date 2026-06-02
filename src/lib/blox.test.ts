import { describe, it, expect } from "vitest";
import {
  COLS, ROWS, SHAPES, rotateCW, rotateCCW, emptyBoard, createBag, spawn,
  collides, merge, clearLines, scoreForLines, gravityMs, levelFor, reduce, createInitialState,
} from "./blox";

describe("blox engine", () => {
  it("rotateCW turns a 3x3 T and is reversible with rotateCCW", () => {
    const t = SHAPES[3];
    expect(rotateCCW(rotateCW(t))).toEqual(t);
    expect(rotateCW(t).length).toBe(t[0].length);
  });
  it("createBag yields all 7 distinct pieces", () => {
    const bag = createBag(() => 0.5);
    expect([...bag].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("collides detects walls, floor, and stacked cells", () => {
    const b = emptyBoard();
    expect(collides(b, SHAPES[2], -1, 0)).toBe(true);
    expect(collides(b, SHAPES[2], COLS - 1, 0)).toBe(true);
    expect(collides(b, SHAPES[2], 0, ROWS - 1)).toBe(true);
    b[5][0] = 1;
    expect(collides(b, SHAPES[2], 0, 4)).toBe(true);
    expect(collides(b, SHAPES[2], 4, 0)).toBe(false);
  });
  it("clearLines removes full rows and compacts from the top", () => {
    const b = emptyBoard();
    b[ROWS - 1] = Array(COLS).fill(1);
    const { board, cleared } = clearLines(b);
    expect(cleared).toBe(1);
    expect(board.length).toBe(ROWS);
    expect(board[ROWS - 1].every((c) => c === 0)).toBe(true);
  });
  it("scoreForLines and gravityMs/levelFor follow the tables", () => {
    expect(scoreForLines(0, 1)).toBe(0);
    expect(scoreForLines(4, 1)).toBe(1600);
    expect(levelFor(0)).toBe(1);
    expect(levelFor(25)).toBe(3);
    expect(gravityMs(1)).toBe(800);
    expect(gravityMs(20)).toBe(90);
  });
  it("reduce: start from ready spawns a piece and enters playing", () => {
    const s = reduce(createInitialState(), "start");
    expect(s.phase).toBe("playing");
    expect(s.piece).not.toBeNull();
  });
  it("reduce: hardDrop locks the piece and spawns the next", () => {
    let s = reduce(createInitialState(), "start");
    const before = s.piece;
    s = reduce(s, "hardDrop");
    expect(s.piece).not.toBe(before);
    expect(s.board.flat().some((c) => c !== 0)).toBe(true);
  });
  it("merge writes piece cells into the board", () => {
    const p = spawn(2);
    const b = merge(emptyBoard(), p);
    expect(b.flat().filter((c) => c !== 0).length).toBe(4);
  });
});
