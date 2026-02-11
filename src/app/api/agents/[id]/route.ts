import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.N8N_API_URL;

// GET /api/agents/[id] - Get a single agent
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

    const response = await fetch(`${API_BASE_URL}?action=get-agent`, {
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
        { error: data.error?.message || "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data.data.agent);
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id] - Update an agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}?action=update-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        agent_id: id,
        name: body.name,
        description: body.description,
        status: body.status,
        workflow_id: body.workflow_id,
        metrics: body.metrics,
        executions: body.executions,
        impact_level: body.impact_level,
        real_time_class: body.real_time_class,
        action_type: body.action_type,
        llm_calls: body.llm_calls,
        api_calls: body.api_calls,
        error_points_identified: body.error_points_identified,
        error_points_implemented: body.error_points_implemented,
      }),
    });

    const data = await response.json();

    if (data.status === "error") {
      return NextResponse.json(
        { error: data.error?.message || "Failed to update agent" },
        { status: 400 }
      );
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(`${API_BASE_URL}?action=delete-agent`, {
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
        { error: data.error?.message || "Failed to delete agent" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
