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
  percent: number;
  label: string;
}

// Estimated weight of each stage (sums to 100)
const ENCRYPT_WEIGHTS = {
  compressing: 5,
  deriving: 75,
  encrypting: 10,
  packaging: 10,
};

const DECRYPT_WEIGHTS = {
  deriving: 75,
  decrypting: 10,
  decompressing: 5,
  verifying: 10,
};

export type ProgressCallback = (state: ProgressState) => void;

/**
 * Create a progress tracker for encryption.
 * Uses device benchmark to estimate PBKDF2 duration and animate smoothly.
 */
export function createEncryptTracker(
  onProgress: ProgressCallback,
  msPerDerivation: number,
  iterations: number,
  hasRevealKey: boolean
) {
  let animFrame = 0;
  let derivationStart = 0;
  const derivationMs = (msPerDerivation / 100_000) * iterations;
  const totalDerivations = hasRevealKey ? 2 : 1;
  let currentDerivation = 0;

  function setStage(stage: CryptoStage, label: string, percent: number) {
    onProgress({ stage, percent: Math.min(percent, 100), label });
  }

  function animateDerivation() {
    const elapsed = performance.now() - derivationStart;
    const singleProgress = Math.min(elapsed / derivationMs, 1);
    const totalProgress = (currentDerivation + singleProgress) / totalDerivations;

    const base = ENCRYPT_WEIGHTS.compressing;
    const deriveRange = ENCRYPT_WEIGHTS.deriving;
    const percent = base + totalProgress * deriveRange;

    setStage("deriving", "progress.deriving", percent);

    if (singleProgress < 1) {
      animFrame = requestAnimationFrame(animateDerivation);
    }
  }

  return {
    compressing() {
      setStage("compressing", "progress.compressing", 0);
    },
    startDerivation() {
      currentDerivation = 0;
      derivationStart = performance.now();
      animateDerivation();
    },
    nextDerivation() {
      currentDerivation++;
      derivationStart = performance.now();
      animateDerivation();
    },
    encrypting() {
      cancelAnimationFrame(animFrame);
      const base = ENCRYPT_WEIGHTS.compressing + ENCRYPT_WEIGHTS.deriving;
      setStage("encrypting", "progress.encrypting", base);
    },
    packaging() {
      const base = ENCRYPT_WEIGHTS.compressing + ENCRYPT_WEIGHTS.deriving + ENCRYPT_WEIGHTS.encrypting;
      setStage("packaging", "progress.packaging", base);
    },
    done() {
      cancelAnimationFrame(animFrame);
      setStage("done", "progress.done", 100);
    },
    cancel() {
      cancelAnimationFrame(animFrame);
    },
  };
}

/**
 * Create a progress tracker for decryption.
 */
export function createDecryptTracker(
  onProgress: ProgressCallback,
  msPerDerivation: number,
  iterations: number,
  candidateCount: number
) {
  let animFrame = 0;
  let derivationStart = 0;
  const derivationMs = (msPerDerivation / 100_000) * iterations;
  let currentCandidate = 0;

  function setStage(stage: CryptoStage, label: string, percent: number) {
    onProgress({ stage, percent: Math.min(percent, 100), label });
  }

  function animateDerivation() {
    const elapsed = performance.now() - derivationStart;
    const singleProgress = Math.min(elapsed / derivationMs, 1);
    const totalProgress = (currentCandidate + singleProgress) / candidateCount;
    const percent = totalProgress * DECRYPT_WEIGHTS.deriving;

    setStage("deriving", "progress.deriving", percent);

    if (singleProgress < 1) {
      animFrame = requestAnimationFrame(animateDerivation);
    }
  }

  return {
    startDerivation() {
      currentCandidate = 0;
      derivationStart = performance.now();
      animateDerivation();
    },
    nextCandidate() {
      currentCandidate++;
      derivationStart = performance.now();
      animateDerivation();
    },
    decrypting() {
      cancelAnimationFrame(animFrame);
      setStage("decrypting", "progress.decrypting", DECRYPT_WEIGHTS.deriving);
    },
    decompressing() {
      const base = DECRYPT_WEIGHTS.deriving + DECRYPT_WEIGHTS.decrypting;
      setStage("decompressing", "progress.decompressing", base);
    },
    verifying() {
      const base = DECRYPT_WEIGHTS.deriving + DECRYPT_WEIGHTS.decrypting + DECRYPT_WEIGHTS.decompressing;
      setStage("verifying", "progress.verifying", base);
    },
    done() {
      cancelAnimationFrame(animFrame);
      setStage("done", "progress.done", 100);
    },
    cancel() {
      cancelAnimationFrame(animFrame);
    },
  };
}
