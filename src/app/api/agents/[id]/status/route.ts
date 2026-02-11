import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.N8N_API_URL;

// GET /api/agents/[id]/status - Get compliance status for an agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(`${API_BASE_URL}?action=get-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ agent_id: id }),
    });

    const data = await response.json();

    if (data.status === "error") {
      return NextResponse.json(
        { error: data.error?.message || "Failed to fetch compliance status" },
        { status: 400 }
      );
    }

    return NextResponse.json(data.data.compliance);
  } catch (error) {
    console.error("Error fetching compliance status:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance status" },
      { status: 500 }
    );
  }
}
