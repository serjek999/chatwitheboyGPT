export async function POST(req) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") || '';
    const file = formData.get("file");

    // Optionally handle file (e.g. read it as buffer or text if needed)
    // const buffer = await file.arrayBuffer();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    return Response.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ reply: "Something went wrong." });
  }
}
