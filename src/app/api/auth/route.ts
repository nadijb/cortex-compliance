import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.N8N_API_URL;

// POST /api/auth - Authenticate user
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const basicToken = Buffer.from(`${username}:${password}`).toString(
      "base64"
    );

    const response = await fetch(`${API_BASE_URL}?action=auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || "Invalid credentials" },
        { status: 401 }
      );
    }

    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
