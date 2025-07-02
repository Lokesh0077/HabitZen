'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting habit ideas to users.
 *
 * The flow takes user preferences and goals as input and returns a list of suggested habits.
 * @fileOverview Suggests habit ideas to users based on their interests.
 *
 * - suggestHabitIdeas - A function that generates habit suggestions.
 * - SuggestHabitIdeasInput - The input type for the suggestHabitIdeas function.
 * - SuggestHabitIdeasOutput - The return type for the suggestHabitIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHabitIdeasInputSchema = z.object({
  interests: z
    .string()
    .describe('The user interests, hobbies, and goals to tailor habit suggestions.'),
});
export type SuggestHabitIdeasInput = z.infer<typeof SuggestHabitIdeasInputSchema>;

const SuggestHabitIdeasOutputSchema = z.object({
  habits: z
    .array(z.string())
    .describe('An array of habit suggestions tailored to the user interests.'),
});
export type SuggestHabitIdeasOutput = z.infer<typeof SuggestHabitIdeasOutputSchema>;

export async function suggestHabitIdeas(input: SuggestHabitIdeasInput): Promise<SuggestHabitIdeasOutput> {
  return suggestHabitIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHabitIdeasPrompt',
  input: {schema: SuggestHabitIdeasInputSchema},
  output: {schema: SuggestHabitIdeasOutputSchema},
  prompt: `You are a helpful assistant that suggests new habits to users based on their interests and goals.

  Given the user's interests, suggest a list of habits that they might find beneficial.
  The habits should be simple and easy to incorporate into their daily routine.

  Interests: {{{interests}}}

  Format the habits as a numbered list.
  `,
});

const suggestHabitIdeasFlow = ai.defineFlow(
  {
    name: 'suggestHabitIdeasFlow',
    inputSchema: SuggestHabitIdeasInputSchema,
    outputSchema: SuggestHabitIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
