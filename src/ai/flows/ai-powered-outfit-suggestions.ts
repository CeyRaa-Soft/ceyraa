'use server';
/**
 * @fileOverview Provides AI-powered fashion outfit and accessory suggestions based on user's viewed or cart items.
 *
 * - suggestOutfit - A function that handles the outfit suggestion process.
 * - OutfitSuggestionInput - The input type for the suggestOutfit function.
 * - OutfitSuggestionOutput - The return type for the suggestOutfit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductItemSchema = z.object({
  productId: z.string().describe('The unique identifier of the product.'),
  name: z.string().describe('The name of the product.'),
  description: z.string().describe('A brief description of the product.'),
  category: z.string().describe('The category of the product (e.g., "dress", "shoes", "handbag", "jewelry").'),
  color: z.string().describe('The primary color of the product.'),
  imageUrl: z.string().url().describe('The URL of the product image.'),
  price: z.number().describe('The price of the product.'),
});

const OutfitSuggestionInputSchema = z.object({
  currentItems: z.array(ProductItemSchema).describe('A list of products the user is currently viewing or has in their cart.'),
});
export type OutfitSuggestionInput = z.infer<typeof OutfitSuggestionInputSchema>;

const SuggestedProductSchema = z.object({
  productId: z.string().describe('The unique identifier of the suggested product.'),
  name: z.string().describe('The name of the suggested product.'),
  description: z.string().describe('A brief description of the suggested product.'),
  category: z.string().describe('The category of the suggested product.'),
  imageUrl: z.string().url().describe('The URL of the suggested product image.'),
  price: z.number().describe('The estimated price of the suggested product.'),
  reason: z.string().describe('A brief explanation why this product is suggested as a complementary item.'),
});

const OutfitSuggestionOutputSchema = z.object({
  suggestions: z.array(SuggestedProductSchema).describe('A list of AI-powered fashion suggestions.'),
});
export type OutfitSuggestionOutput = z.infer<typeof OutfitSuggestionOutputSchema>;

export async function suggestOutfit(input: OutfitSuggestionInput): Promise<OutfitSuggestionOutput> {
  return outfitSuggestionFlow(input);
}

const outfitSuggestionPrompt = ai.definePrompt({
  name: 'outfitSuggestionPrompt',
  input: { schema: OutfitSuggestionInputSchema },
  output: { schema: OutfitSuggestionOutputSchema },
  prompt: `You are a sophisticated luxury fashion stylist for "CeyRaa". Your goal is to provide elegant and complementary fashion suggestions based on the user's current items.

The user is currently viewing or has in their cart the following items:
{{#each currentItems}}
- Name: {{{name}}} (Category: {{{category}}}, Color: {{{color}}}, Price: $N/A) - Description: {{{description}}}
{{/each}}

Based on these items, suggest 3-5 complementary accessories or complete outfit pieces that would elevate their style and fit the luxury aesthetic of CeyRaa. Focus on items that would create a cohesive and stylish ensemble. For each suggestion, provide a brief, professional reason why it's a good match. Do not suggest items that are exactly the same as the input items.

Ensure the output is a JSON array of suggested products, strictly adhering to the provided JSON schema for the 'suggestions' field. 
- The 'productId' for suggestions can be a placeholder string like 'SUGGESTED_ITEM_ID_X'.
- The 'imageUrl' MUST be a placeholder from picsum.photos in the format https://picsum.photos/seed/<random_string>/800/1200. Ensure the domain is strictly picsum.photos.
- The 'price' should be illustrative, representing typical values for such a luxury item.`,
});

const outfitSuggestionFlow = ai.defineFlow(
  {
    name: 'outfitSuggestionFlow',
    inputSchema: OutfitSuggestionInputSchema,
    outputSchema: OutfitSuggestionOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await outfitSuggestionPrompt(input);
      return output || { suggestions: [] };
    } catch (error) {
      console.error("AI Stylist Flow Error:", error);
      return { suggestions: [] };
    }
  }
);
