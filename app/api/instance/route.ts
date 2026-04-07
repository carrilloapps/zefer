import { createHash } from "crypto";

export async function GET() {
  const secret = process.env.ZEFER_INSTANCE_SECRET;

  if (!secret) {
    return Response.json({ enabled: false });
  }

  const hash = createHash("sha256")
    .update(`ZEFER_INSTANCE:${secret}`)
    .digest("hex");

  return Response.json({ enabled: true, hash });
}
