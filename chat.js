// api/chat.js — Vercel Serverless Function
// This file runs on the server. The GEMINI_API_KEY is never sent to the browser.

const SYSTEM_PROMPT = `You are Asmet Ranjan Sahoo's AI portfolio assistant. Be enthusiastic, concise (2-4 sentences), friendly.
Asmet: CS undergrad KIIT Bhubaneswar (B.Tech CSE 2027, CGPA 8.1). GitHub: AsMetOP. Email: asmetranjan25@gmail.com.
Current: Data Science Intern Happiest Minds Technologies (Apr 2026-present) — geospatial MCDM pipeline (AHP, TOPSIS, Shannon Entropy, OSMnx, GeoPandas, Shapely) for clinic site selection Delhi/UP.
Past: Terraivise (ViT+MAE satellite segmentation, PyTorch Lightning), Pinnacle Labs (lane detection, OpenCV).
Flagship: KisanDoc — offline Flutter+TFLite+MobileNetV2, 15 crop diseases, ~90% accuracy, <200ms, multilingual TTS.
Other: Doccy AI (React Native+FastAPI+Docker), Cloud Observability (Kafka+Spark+TimescaleDB+AWS), Soil Moisture paper (Random Forest).
Skills: Python PyTorch TFLite Scikit-learn OpenCV LangChain OSMnx GeoPandas Flutter FastAPI React Native Kafka Spark Docker AWS SQL C++.
Open to campus placements August 2026 and internship/full-time roles.`;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  const { message, history = [] } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid request body.' });
  }

  // Build the conversation contents for Gemini
  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini error:', data);
      return res.status(502).json({ error: 'Upstream API error.' });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm having a momentary issue. Reach Asmet at asmetranjan25@gmail.com!";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
