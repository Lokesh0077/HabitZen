export type Day = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface Habit {
  id: string;
  name: string;
  completions: Record<string, boolean>; // Key: "YYYY-MM-DD"
  createdAt: string; // ISO String
  time?: string;
  days?: Day[];
}
