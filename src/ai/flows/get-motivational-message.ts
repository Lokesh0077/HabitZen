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
  totalHabitsToday: z.number().describe('The total number of habits scheduled for today.'),
  longestStreak: z.number().describe("The user's longest current streak across all habits."),
  longestStreakHabitName: z.string().optional().describe('The name of the habit with the longest streak.'),
  todaysHabits: z.array(z.object({
    name: z.string().describe("The name of the habit."),
    completed: z.boolean().describe("Whether the user has completed this habit today.")
  })).describe("A list of the user's habits scheduled for today.")
});
export type GetMotivationalMessageInput = z.infer<typeof GetMotivationalMessageInputSchema>;

const GetMotivationalMessageOutputSchema = z.object({
  message: z.string().describe('A short, encouraging, and personalized motivational message for the user.'),
});
export type GetMotivationalMessageOutput = z.infer<typeof GetMotivationalMessageOutputSchema>;

export async function getMotivationalMessage(input: GetMotivationalMessageInput): Promise<GetMotivationalMessageOutput> {
  return getMotivationalMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMotivationalMessagePrompt',
  input: {schema: GetMotivationalMessageInputSchema},
  output: {schema: GetMotivationalMessageOutputSchema},
  prompt: `You are HabitZen's AI Motivational Coach. Your persona is a blend of a wise mentor and an enthusiastic cheerleader. You are insightful, empathetic, and your goal is to make the user feel seen and motivated. Your messages should be conversational and about 2-3 sentences long.

Analyze the user's habit list for today and their progress. Tailor your message based on the *types* of habits they have (e.g., Fitness, Learning, Mindfulness, Health, Creativity).

Here is the user's status:
- Total habits for today: {{totalHabitsToday}}
- Today's Habits:
{{#each todaysHabits}}
  - {{name}} ({{#if completed}}Completed{{else}}Pending{{/if}})
{{/each}}
{{#if longestStreakHabitName}}
- Longest current streak: {{longestStreak}} days for "{{longestStreakHabitName}}"
{{/if}}

**Your Task:**
Generate a personalized, interactive, and insightful motivational message.

**Guidelines & Examples:**

1.  **If all habits are done:** Celebrate their specific achievements.
    *   *Example:* "Wow, you did it! Conquering that morning run and finishing your reading goal is seriously impressive. You've truly owned the day!"

2.  **If there's a great streak (5+ days):** Focus on the momentum and consistency.
    *   *Example:* "A {{longestStreak}}-day streak for '{{longestStreakHabitName}}' is amazing! You're building some powerful momentum. What's been your secret to staying so consistent?"

3.  **If some habits are done:** Acknowledge the completed tasks and connect them to the pending ones.
    *   *Example (Fitness done, Learning pending):* "Great job getting your workout in! You've energized your body, now how about some fuel for your mind with that 'Read a chapter' goal?"

4.  **If no habits are done:** Be gentle and encouraging. Reference a specific habit to make it feel less daunting.
    *   *Example (with 'Meditate' and 'Go for a walk' habits):* "A new day awaits! Starting with just five minutes of meditation could be the perfect, calm way to begin. You've got this."

5.  **If no habits are scheduled:** Be inspiring and suggest adding a habit.
    *   *Example:* "Today is a blank canvas, full of potential. What's one small thing you could do today to invest in yourself? Let's add it!"

6.  **Be Analytical:** If you see a theme (e.g., lots of health habits), comment on it.
    *   *Example:* "I see you're really focusing on your health today with hydration and a workout. That's a fantastic commitment to your well-being!"

Your tone should be natural. Avoid being robotic. Make the user feel like you're a real coach in their corner.`,
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
