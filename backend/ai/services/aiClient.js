import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../../.env.local") });

import { Client } from "aisuite";
import {SYSTEM_CONTENT} from "../shared/systemContent.js"

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required but not found in environment variables");
}

const client = new Client({
  openai: { apiKey: process.env.OPENAI_API_KEY }
});

export const generateAIResponse = 
  async ({ prompt, model, type }) => {

    if(!SYSTEM_CONTENT[type]) {
      throw new Error(`Invalid AI type: ${type}. Must be one of: ${Object.keys(SYSTEM_CONTENT).join(', ')}`);
    }

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: SYSTEM_CONTENT[type],
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });
        
    const text = response?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Invalid response from AI");
    }

    return JSON.parse(text);

}