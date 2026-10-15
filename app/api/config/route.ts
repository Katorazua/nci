import { NextResponse } from "next/server";
import { getProviderConfiguration } from "@/lib/ai/provider-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getProviderConfiguration(), {
    headers: { "Cache-Control": "no-store" },
  });
}
