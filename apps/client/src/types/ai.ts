export type PromptSuggestion = {
  title: string;
  highlight?: string;
  reason?: string;
  url?: string;
  googleMapsUrl?: string;
  imageUrl?: string;
  location?: string;
  distanceKm?: number;
};

export type PromptAiResult = {
  id: number;
  response: string;
  suggestions: PromptSuggestion[];
};
