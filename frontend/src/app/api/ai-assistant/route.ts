/**
 * AI Assistant API Route — StratumIQ
 * Proxies messages to Anthropic claude-sonnet model.
 * The API key must be set as ANTHROPIC_API_KEY env var.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { content: "AI assistant is not configured. Please set ANTHROPIC_API_KEY." },
        { status: 200 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 512,
        system:     system ?? "You are a helpful assistant for StratumIQ, a heavy equipment management platform.",
        messages:   messages ?? [],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[ai-assistant] Anthropic error:", err);
      return NextResponse.json({ content: "AI service temporarily unavailable. Please try again." }, { status: 200 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "Sorry, I couldn't process that request.";
    return NextResponse.json({ content });

  } catch (err) {
    console.error("[ai-assistant] Error:", err);
    return NextResponse.json(
      { content: "Something went wrong. Please try again." },
      { status: 200 }
    );
  }
}