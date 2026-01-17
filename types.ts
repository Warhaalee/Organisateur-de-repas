
export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  category?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  groundingSources?: { title: string; uri: string }[];
  isManual?: boolean;
}

export type MealType = 'lunch' | 'dinner';
export type DayOfWeek = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';

export interface WeeklyPlan {
  [day: string]: {
    lunch?: string;
    dinner?: string;
  };
}

export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K'
}
