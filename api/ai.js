import { Client } from "aisuite";
import { consumeQuota } from "../lib/quota.js";

const client = new Client({
  openai: { apiKey: process.env.OPENAI_API_KEY }
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { prompt, model, userId } = req.body;

    if(!prompt || !userId || !model) {
      return res.status(400).json(({error: "Missing prompt or userId"}))
    }

    const DEV_USER_ID = process.env.DEV_USER_ID;

    let quota = {allowed: true};

    if(userId !== DEV_USER_ID) {
    const quota = await consumeQuota(userId);
    }
    
    if(!quota.allowed) {
      return res.status(403).json({
        error: "AI_LIMIT_REACHED",
        message: "You've used all your free AI Insights."
      })
    }

    const response = await client.chat.completions.create({
        model,
        messages: [
                    {
                        role: "system",
                        content:
                        "You are a helpful financial assistant that explains spending clearly and simply.",
                    },
                    {
                        role: "user",
                        content: prompt,
                        },
            ],
        temperature: 0.3,
        max_tokens: 120,
    });
        
    const text = response?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Invalid response from AI API");
    }

    return res.status(200).json({ text });
    
  } catch (err) {
    console.error("AI API Error:", err);

    return res.status(500).json({
      error: "AI request failed",
    });
  }
}
