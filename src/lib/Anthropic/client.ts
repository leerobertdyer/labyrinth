'use server'
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"]
});

export async function sendNPCMessage(userMessage: string, systemPrompt: string) {
  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: userMessage }],
    system: systemPrompt
  });
  return message.content[0].type === 'text' ? message.content[0].text : '';
}