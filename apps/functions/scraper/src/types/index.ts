import type { DishProps } from '@devolunch/shared';

export interface PageContent {
  html: string;
  text: string;
  title: string;
  url: string;
  images?: string[];
}

export interface MenuExtractionResult {
  dishes: DishProps[];
  confidence: number;
  reasoning: string;
  lunchInfo?: {
    servingTimes?: string;
    includedItems?: string[];
    specialNotes?: string;
  };
}
