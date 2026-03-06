import { NextRequest, NextResponse } from "next/server";
import { MOCK_VEHICLES } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const region = searchParams.get("region");

  let vehicles = MOCK_VEHICLES;

  if (status && status !== "all") {
    vehicles = vehicles.filter((v) => v.status === status);
  }

  if (region) {
    vehicles = vehicles.filter(
      (v) => v.region.toLowerCase() === region.toLowerCase()
    );
  }

  return NextResponse.json(vehicles);
}
