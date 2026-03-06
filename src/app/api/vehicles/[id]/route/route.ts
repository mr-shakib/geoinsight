import { NextRequest, NextResponse } from "next/server";
import { getRouteByVehicleId } from "@/lib/mockData";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const route = getRouteByVehicleId(id);

  if (!route) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  return NextResponse.json(route);
}
