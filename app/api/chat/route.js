export async function POST(req) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") || '';
    const historyJSON = formData.get("history") || '[]';

    // Parse full message history from frontend
    const history = JSON.parse(historyJSON);

    // Add current user message to history
    history.push({ role: "user", content: message });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: history,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API error:", data);
      return Response.json({ reply: "OpenRouter API error: " + (data.error?.message || "Unknown error") });
    }

    const reply = data.choices?.[0]?.message?.content;
    return Response.json({ reply: reply || "No response from model." });

  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ reply: "Server error. Try again later." });
  }
}
