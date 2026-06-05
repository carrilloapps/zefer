// In-memory handoff for passing a File between pages during client-side
// navigation (e.g. /analyzer → home decrypt form). Module state survives
// Next.js client navigations; it is intentionally lost on a full reload.

let pendingDecryptFile: File | null = null;

export function setPendingDecryptFile(file: File): void {
  pendingDecryptFile = file;
}

/** Returns the pending file once and clears it (consume-once semantics). */
export function takePendingDecryptFile(): File | null {
  const file = pendingDecryptFile;
  pendingDecryptFile = null;
  return file;
}
