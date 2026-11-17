import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processCircular } from "@/lib/pipeline";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    return NextResponse.redirect(new URL("/", req.url), 303);
  }

  const form = await req.formData();
  const mode = String(form.get("mode") ?? "text");

  try {
    let id: string;
    if (mode === "pdf") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) throw new Error("No PDF file was uploaded.");
      const buffer = new Uint8Array(await file.arrayBuffer());
      id = await processCircular({
        sourceType: "PDF",
        fileBuffer: buffer,
        originalFileName: file.name,
        createdById: user.id,
      });
    } else if (mode === "photo") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) throw new Error("No photo was uploaded.");
      const buffer = Buffer.from(await file.arrayBuffer());
      id = await processCircular({
        sourceType: "PHOTO",
        imageBase64: buffer.toString("base64"),
        imageMimeType: file.type || "image/jpeg",
        originalFileName: file.name,
        createdById: user.id,
      });
    } else {
      const text = String(form.get("text") ?? "").trim();
      if (text.length < 20) throw new Error("The pasted circular is too short to process.");
      id = await processCircular({
        sourceType: "TEXT",
        originalText: text,
        createdById: user.id,
      });
    }
    return NextResponse.redirect(new URL(`/teacher/circulars/${id}`, req.url), 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong while adding the circular.";
    const url = new URL("/teacher", req.url);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url, 303);
  }
}
