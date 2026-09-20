import { describe, it, expect, vi, beforeEach } from "vitest";

const { toast } = vi.hoisted(() => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("sonner", () => ({ toast }));

import { notifySuccess, notifyError, notifyWarning, notifyInfo } from "../notify";

describe("notify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards message and description to the matching sonner channel", () => {
    notifySuccess("ok", "saved");
    notifyError("boom", "bad passphrase");
    notifyWarning("careful", "expires soon");
    notifyInfo("fyi", "client-side only");

    expect(toast.success).toHaveBeenCalledWith("ok", { description: "saved" });
    expect(toast.error).toHaveBeenCalledWith("boom", { description: "bad passphrase" });
    expect(toast.warning).toHaveBeenCalledWith("careful", { description: "expires soon" });
    expect(toast.info).toHaveBeenCalledWith("fyi", { description: "client-side only" });
  });

  it("passes an undefined description when none is given", () => {
    notifySuccess("done");
    notifyError("fail");
    notifyWarning("hmm");
    notifyInfo("note");

    expect(toast.success).toHaveBeenCalledWith("done", { description: undefined });
    expect(toast.error).toHaveBeenCalledWith("fail", { description: undefined });
    expect(toast.warning).toHaveBeenCalledWith("hmm", { description: undefined });
    expect(toast.info).toHaveBeenCalledWith("note", { description: undefined });
  });
});
