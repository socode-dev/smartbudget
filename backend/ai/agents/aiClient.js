import dotenv from "dotenv";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../../.env.local") });

import { Client } from "aisuite";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required but not found in environment variables");
}

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