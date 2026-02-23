import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@amazon-inventory/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pageNum = Math.max(1, Number(searchParams.get("page") || "1"));
    const perPageNum = Math.min(200, Math.max(1, Number(searchParams.get("perPage") || "50")));

    const [data, total] = await Promise.all([
      prisma.t4sInventoryData.findMany({
        skip: (pageNum - 1) * perPageNum,
        take: perPageNum,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.t4sInventoryData.count(),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: { page: pageNum, perPage: perPageNum, total },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
