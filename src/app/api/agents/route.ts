import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.N8N_API_URL;

// GET /api/agents - List all agents
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=list-agents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status === "error") {
      return NextResponse.json(
        { error: data.error?.message || "Failed to fetch agents" },
        { status: 400 }
      );
    }

    return NextResponse.json(data.data.agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}?action=create-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: body.agent_id,
        name: body.name,
        description: body.description,
        status: body.status,
        workflow_id: body.workflow_id,
        metrics: body.metrics,
        executions: body.executions,
      }),
    });

    const data = await response.json();

    if (data.status === "error") {
      return NextResponse.json(
        { error: data.error?.message || "Failed to create agent" },
        { status: 400 }
      );
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
