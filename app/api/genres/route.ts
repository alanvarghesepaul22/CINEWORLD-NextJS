import { NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function GET() {
  try {
    const data = await api.getGenres();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}