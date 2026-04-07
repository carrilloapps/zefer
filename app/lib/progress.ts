export type CryptoStage =
  | "idle"
  | "compressing"
  | "deriving"
  | "encrypting"
  | "packaging"
  | "decompressing"
  | "decrypting"
  | "verifying"
  | "done";

export interface ProgressState {
  stage: CryptoStage;
  percent: number;  // 0-100, always REAL progress
  label: string;
}

export type ProgressCallback = (state: ProgressState) => void;

/**
 * Real progress tracker for encryption.
 * Stages and their weight in the overall progress:
 *   compressing:  10%
 *   deriving:      5% (PBKDF2 is a single atomic call — jumps from 0 to done)
 *   encrypting:   80% (chunked — real per-chunk progress)
 *   packaging:     5%
 */
export function createEncryptTracker(onProgress: ProgressCallback) {
  function set(stage: CryptoStage, label: string, percent: number) {
    onProgress({ stage, percent: Math.min(Math.round(percent), 100), label });
  }

  return {
    compressing(percent: number) {
      set("compressing", "progress.compressing", percent * 0.1);
    },
    compressingDone() {
      set("compressing", "progress.compressing", 10);
    },
    deriving() {
      set("deriving", "progress.deriving", 10);
    },
    derivingDone() {
      set("deriving", "progress.deriving", 15);
    },
    encrypting(chunkIndex: number, totalChunks: number) {
      const chunkProgress = chunkIndex / totalChunks;
      set("encrypting", "progress.encrypting", 15 + chunkProgress * 80);
    },
    packaging() {
      set("packaging", "progress.packaging", 95);
    },
    done() {
      set("done", "progress.done", 100);
    },
  };
}

/**
 * Real progress tracker for decryption.
 * Stages:
 *   deriving:       5%
 *   decrypting:    80% (chunked — real per-chunk progress)
 *   decompressing: 10%
 *   verifying:      5%
 */
export function createDecryptTracker(onProgress: ProgressCallback) {
  function set(stage: CryptoStage, label: string, percent: number) {
    onProgress({ stage, percent: Math.min(Math.round(percent), 100), label });
  }

  return {
    deriving() {
      set("deriving", "progress.deriving", 0);
    },
    derivingDone() {
      set("deriving", "progress.deriving", 5);
    },
    decrypting(chunkIndex: number, totalChunks: number) {
      const chunkProgress = chunkIndex / totalChunks;
      set("decrypting", "progress.decrypting", 5 + chunkProgress * 80);
    },
    decompressing() {
      set("decompressing", "progress.decompressing", 85);
    },
    verifying() {
      set("verifying", "progress.verifying", 95);
    },
    done() {
      set("done", "progress.done", 100);
    },
  };
}
