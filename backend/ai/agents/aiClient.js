import dotenv from "dotenv";
dotenv.config({path: ("./.env.local")});

import { Client } from "aisuite";

const client = new Client({
  openai: { apiKey: process.env.OPENAI_API_KEY }
});

export const generateAIResponse = 
  async ({ prompt, model }) => {

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
      throw new Error("Invalid response from AI");
    }

    return JSON.parse(text);

}