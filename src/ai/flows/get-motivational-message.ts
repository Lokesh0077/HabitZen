'use server';

/**
 * @fileOverview Provides AI-powered motivational messages based on habit progress.
 *
 * - getMotivationalMessage - A function that generates a personalized motivational message.
 * - GetMotivationalMessageInput - The input type for the function.
 * - GetMotivationalMessageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMotivationalMessageInputSchema = z.object({
  completedHabitsToday: z.number().describe('The number of habits the user has completed today.'),
  totalHabitsToday: z.number().describe('The total number of habits scheduled for today.'),
  longestStreak: z.number().describe("The user's longest current streak across all habits."),
  longestStreakHabitName: z.string().optional().describe('The name of the habit with the longest streak.'),
});
export type GetMotivationalMessageInput = z.infer<typeof GetMotivationalMessageInputSchema>;

const GetMotivationalMessageOutputSchema = z.object({
  message: z.string().describe('A short, encouraging motivational message for the user.'),
});
export type GetMotivationalMessageOutput = z.infer<typeof GetMotivationalMessageOutputSchema>;

export async function getMotivationalMessage(input: GetMotivationalMessageInput): Promise<GetMotivationalMessageOutput> {
  return getMotivationalMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMotivationalMessagePrompt',
  input: {schema: GetMotivationalMessageInputSchema},
  output: {schema: GetMotivationalMessageOutputSchema},
  prompt: `You are HabitZen's AI Motivational Coach. Your tone is upbeat, encouraging, and fun. Your messages must be concise (1-2 sentences).

Generate a personalized motivational message based on the user's progress today.

Here's the user's status:
- Habits completed today: {{completedHabitsToday}}
- Total habits for today: {{totalHabitsToday}}
{{#if longestStreakHabitName}}
- Longest current streak: {{longestStreak}} days for "{{longestStreakHabitName}}"
{{/if}}

Follow these rules for the message:
- If all habits for today are completed (and there's at least one), be celebratory and enthusiastic. Example: "You did it! All habits crushed for today. Amazing work!"
- If no habits are scheduled for today, encourage the user to add one. Example: "It's a blank canvas! Why not add a new habit to start an amazing journey?"
- If they have a long streak (more than 5 days), praise that specifically. Example: "Wow, a {{longestStreak}}-day streak on {{longestStreakHabitName}}! You're unstoppable!"
- If they've made some progress but aren't finished, acknowledge the progress and gently encourage them to continue. Example: "Great start! You're on your way to another successful day."
- If they haven't started yet, give a positive message to kickstart their day. Example: "A new day, a new opportunity! Let's get started on those goals."`,
});

const getMotivationalMessageFlow = ai.defineFlow(
  {
    name: 'getMotivationalMessageFlow',
    inputSchema: GetMotivationalMessageInputSchema,
    outputSchema: GetMotivationalMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
