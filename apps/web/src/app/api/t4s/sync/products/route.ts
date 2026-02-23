import { NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

async function fetchProductTitle(asin: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept-Language": "ja-JP,ja;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)\s*</);
    if (match) return match[1].trim();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    if (titleMatch) {
      let title = titleMatch[1].trim();
      title = title.replace(/^Amazon[.\s]*co[.\s]*jp[:\s]*/i, "");
      title = title.replace(/\s*:\s*[^:]*$/, "");
      return title || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    // Get all unique ASINs from T4S inventory
    const t4sItems = await prisma.t4sInventoryData.findMany({
      select: { asin: true, sku: true },
      distinct: ["asin"],
    });

    let updated = 0;
    for (const item of t4sItems) {
      // Check if product already has a title
      const existing = await prisma.product.findUnique({ where: { asin: item.asin } });
      if (existing?.title && existing.title !== item.asin) {
        continue; // Already has a real title
      }

      const title = await fetchProductTitle(item.asin);
      if (!title) continue;

      await prisma.product.upsert({
        where: { asin: item.asin },
        update: { title },
        create: {
          asin: item.asin,
          sku: item.sku,
          title,
        },
      });
      updated++;

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    }

    return NextResponse.json({
      success: true,
      data: { totalAsins: t4sItems.length, updated },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
