import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ content: "Error: OpenRouter Key is missing" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
        "X-Title": "LUKZ ERP AI", // Required by OpenRouter
      },
      body: JSON.stringify({
        // 'google/gemini-2.0-flash-lite:free' is currently the best stable free model
        model: "google/gemini-2.0-flash-lite-001", 
        messages: [
          { 
            role: "system", 
            content: "You are the LUKZ ERP AI. Expert in manufacturing and industrial chemistry." 
          },
          ...messages
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenRouter Error:", data.error);
      return NextResponse.json({ content: `AI Error: ${data.error.message}` }, { status: 500 });
    }

    const aiText = data.choices[0]?.message?.content || "No response.";
    return NextResponse.json({ role: "assistant", content: aiText });

  } catch (error: any) {
    return NextResponse.json({ content: "Internal Server Error" }, { status: 500 });
  }
}