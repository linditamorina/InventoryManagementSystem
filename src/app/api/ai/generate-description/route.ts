import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { productName, category } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Model i fuqishëm dhe i shpejtë
        messages: [
          {
            role: "system",
            content: "Je një ekspert i marketingut për menaxhimin e inventarit. Gjenero një përshkrim profesional, të shkurtër (max 2 fjali) në gjuhën shqipe për produktin e dhënë."
          },
          {
            role: "user",
            content: `Emri i produktit: ${productName}, Kategoria: ${category}`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ description: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Dështoi gjenerimi i përshkrimit' }, { status: 500 });
  }
}