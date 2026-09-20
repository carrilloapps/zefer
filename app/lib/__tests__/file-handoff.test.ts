import { describe, it, expect } from "vitest";
import { setPendingDecryptFile, takePendingDecryptFile } from "../file-handoff";

describe("file-handoff", () => {
  it("starts empty", () => {
    expect(takePendingDecryptFile()).toBeNull();
  });

  it("hands the file over exactly once", () => {
    const file = new File([new Uint8Array([1, 2, 3])], "secret.zefer");
    setPendingDecryptFile(file);

    expect(takePendingDecryptFile()).toBe(file);
    expect(takePendingDecryptFile()).toBeNull();
  });

  it("keeps only the most recently set file", () => {
    const first = new File(["a"], "a.zefer");
    const second = new File(["b"], "b.zefer");
    setPendingDecryptFile(first);
    setPendingDecryptFile(second);

    expect(takePendingDecryptFile()).toBe(second);
  });
});
