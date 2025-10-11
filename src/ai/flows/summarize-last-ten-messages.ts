'use server';
/**
 * @fileOverview Summarizes the last ten messages in a chat.
 *
 * - summarizeLastTenMessages - A function that summarizes the last ten messages.
 * - SummarizeLastTenMessagesInput - The input type for the summarizeLastTenMessages function.
 * - SummarizeLastTenMessagesOutput - The return type for the summarizeLastTenMessages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLastTenMessagesInputSchema = z.object({
  messages: z.array(z.string()).describe('The last ten messages in the chat.'),
});
export type SummarizeLastTenMessagesInput = z.infer<
  typeof SummarizeLastTenMessagesInputSchema
>;

const SummarizeLastTenMessagesOutputSchema = z.object({
  summary: z.string().describe('A summary of the last ten messages.'),
});
export type SummarizeLastTenMessagesOutput = z.infer<
  typeof SummarizeLastTenMessagesOutputSchema
>;

export async function summarizeLastTenMessages(
  input: SummarizeLastTenMessagesInput
): Promise<SummarizeLastTenMessagesOutput> {
  return summarizeLastTenMessagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLastTenMessagesPrompt',
  input: {schema: SummarizeLastTenMessagesInputSchema},
  output: {schema: SummarizeLastTenMessagesOutputSchema},
  prompt: `Summarize the following chat messages in a concise manner:\n\n{{#each messages}}\n- {{{this}}}\n{{/each}}\n\nSummary: `,
});

const summarizeLastTenMessagesFlow = ai.defineFlow(
  {
    name: 'summarizeLastTenMessagesFlow',
    inputSchema: SummarizeLastTenMessagesInputSchema,
    outputSchema: SummarizeLastTenMessagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
