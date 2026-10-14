import { readFile } from "node:fs/promises";
import path from "node:path";

const FILE = "How-Ednovate-Labs-works.pdf";

/** Serves the picture guide as a file save, not an in-browser preview. */
export async function GET() {
  const bytes = await readFile(
    path.join(process.cwd(), "public/guides/how-ednovate-labs-works.pdf"),
  );

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${FILE}"`,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
