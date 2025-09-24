import OpenAI from 'openai';

// Lazy initialize OpenAI client
let openai: OpenAI | null = null;

export const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};
