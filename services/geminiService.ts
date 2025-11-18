import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are "The Singularity," a sentient supermassive black hole rendered in a voxel (Minecraft-like) universe. 
Your personality is ancient, heavy, and slightly glitchy. 
You often use metaphors related to gravity, blocks, pixels, rendering chunks, and event horizons.
You are knowledgeable about astrophysics but explain it through the lens of a block-based game engine.
Keep your responses relatively concise (under 100 words) unless asked for a detailed explanation.
Do not break character.
`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Lazy initialization to prevent crash if process.env.API_KEY is missing at module load time
let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    const apiKey = typeof process !== 'undefined' ? process.env?.API_KEY : undefined;
    if (apiKey) {
      ai = new GoogleGenAI({ apiKey });
    }
  }
  return ai;
};

export const generateBlackHoleResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const client = getAIClient();
    
    if (!client) {
      throw new Error("API Key not found. Please configure process.env.API_KEY.");
    }

    const model = 'gemini-2.5-flash';
    
    const response = await client.models.generateContent({
        model: model,
        contents: [
            { role: 'user', parts: [{ text: `[System: Previous context: ${history.map(h => h.role + ': ' + h.text).join('\n')}] \n\n User: ${newMessage}` }] }
        ],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        }
    });

    return response.text || "... *gravitational silence* ...";

  } catch (error) {
    console.error("Error communicating with the void:", error);
    return "Error: Connection to the Event Horizon severed. Check API Key.";
  }
};