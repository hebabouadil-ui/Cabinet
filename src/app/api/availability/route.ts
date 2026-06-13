import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: "Paramètres date et serviceId requis" },
      { status: 400 }
    );
  }

  const slots = await getAvailableSlots(date, serviceId);
  return NextResponse.json({ slots });
}
