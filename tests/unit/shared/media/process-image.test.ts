import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { processImageToWebp } from "@/shared/lib/media/process-image";

async function sampleJpeg(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 40, g: 120, b: 200 },
    },
  })
    .jpeg()
    .toBuffer();
}

describe("processImageToWebp", () => {
  it("avatar → WebP 256×256", async () => {
    const input = await sampleJpeg(1200, 800);
    const result = await processImageToWebp(input, "avatar");
    const meta = await sharp(result.bytes).metadata();

    expect(result.contentType).toBe("image/webp");
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(256);
    expect(meta.height).toBe(256);
  });

  it("logo → WebP com lado maior ≤ 1024 (sem upscale)", async () => {
    const input = await sampleJpeg(2000, 500);
    const result = await processImageToWebp(input, "logo");
    const meta = await sharp(result.bytes).metadata();

    expect(result.contentType).toBe("image/webp");
    expect(meta.width).toBe(1024);
    expect(meta.height).toBe(256);
  });

  it("logo pequena não é ampliada", async () => {
    const input = await sampleJpeg(400, 200);
    const result = await processImageToWebp(input, "logo");
    const meta = await sharp(result.bytes).metadata();

    expect(meta.width).toBe(400);
    expect(meta.height).toBe(200);
  });
});
