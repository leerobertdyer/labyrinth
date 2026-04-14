import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const secret = process.env.CHAT_API_SECRET ?? "";

  const resp = await fetch("http://localhost:3333/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-chat-api-secret": secret,
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  return NextResponse.json(data);
}
