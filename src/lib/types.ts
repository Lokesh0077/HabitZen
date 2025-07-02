export interface Habit {
  id: string;
  name: string;
  completions: Record<string, boolean>; // Key: "YYYY-MM-DD"
  createdAt: string; // ISO String
}
