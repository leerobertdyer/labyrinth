import { MessageParam } from "@anthropic-ai/sdk/resources.js";

export async function sendPrompt(history: MessageParam[], systemPrompt: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, systemPrompt }),
  });
  const data = await response.json();
  return data;
}