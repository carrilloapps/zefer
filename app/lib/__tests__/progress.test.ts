import { describe, it, expect, vi } from "vitest";
import { createEncryptTracker, createDecryptTracker, type ProgressState } from "../progress";

function capture() {
  const states: ProgressState[] = [];
  return { states, onProgress: vi.fn((s: ProgressState) => { states.push(s); }) };
}

describe("createEncryptTracker", () => {
  it("reports the documented percentage for every stage", () => {
    const { states, onProgress } = capture();
    const t = createEncryptTracker(onProgress);

    t.compressing(50);
    t.compressingDone();
    t.deriving();
    t.derivingDone();
    t.encrypting(0, 4);
    t.encrypting(2, 4);
    t.encrypting(4, 4);
    t.packaging();
    t.done();

    expect(states).toEqual([
      { stage: "compressing", percent: 5, label: "progress.compressing" },
      { stage: "compressing", percent: 10, label: "progress.compressing" },
      { stage: "deriving", percent: 10, label: "progress.deriving" },
      { stage: "deriving", percent: 15, label: "progress.deriving" },
      { stage: "encrypting", percent: 15, label: "progress.encrypting" },
      { stage: "encrypting", percent: 55, label: "progress.encrypting" },
      { stage: "encrypting", percent: 95, label: "progress.encrypting" },
      { stage: "packaging", percent: 95, label: "progress.packaging" },
      { stage: "done", percent: 100, label: "progress.done" },
    ]);
  });

  it("rounds and clamps the percentage to 100", () => {
    const { states, onProgress } = capture();
    const t = createEncryptTracker(onProgress);

    t.compressing(33); // 3.3 -> 3
    t.encrypting(10, 4); // 15 + 200 -> clamped
    expect(states[0].percent).toBe(3);
    expect(states[1].percent).toBe(100);
  });
});

describe("createDecryptTracker", () => {
  it("reports the documented percentage for every stage", () => {
    const { states, onProgress } = capture();
    const t = createDecryptTracker(onProgress);

    t.deriving();
    t.derivingDone();
    t.decrypting(0, 2);
    t.decrypting(1, 2);
    t.decompressing();
    t.verifying();
    t.done();

    expect(states).toEqual([
      { stage: "deriving", percent: 0, label: "progress.deriving" },
      { stage: "deriving", percent: 5, label: "progress.deriving" },
      { stage: "decrypting", percent: 5, label: "progress.decrypting" },
      { stage: "decrypting", percent: 45, label: "progress.decrypting" },
      { stage: "decompressing", percent: 85, label: "progress.decompressing" },
      { stage: "verifying", percent: 95, label: "progress.verifying" },
      { stage: "done", percent: 100, label: "progress.done" },
    ]);
  });

  it("clamps an over-long chunk stream to 100", () => {
    const { states, onProgress } = capture();
    createDecryptTracker(onProgress).decrypting(5, 2);
    expect(states[0].percent).toBe(100);
  });
});
