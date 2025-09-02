
'use server';
/**
 * @fileOverview A Bitly URL shortener flow.
 *
 * - shortenUrl - A function that handles the URL shortening process.
 * - ShortenUrlInput - The input type for the shortenUrl function.
 * - ShortenUrlOutput - The return type for the shortenUrl function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getBrand } from '@/lib/firestore';
import { decryptPassword } from '@/lib/crypto';
import axios from 'axios';

const ShortenUrlInputSchema = z.object({
  longUrl: z.string().url().describe("The long URL to be shortened."),
  brandId: z.string().describe("The ID of the brand whose Bitly credentials should be used."),
});
export type ShortenUrlInput = z.infer<typeof ShortenUrlInputSchema>;

const ShortenUrlOutputSchema = z.object({
  shortUrl: z.string().url().describe('The shortened URL from Bitly.'),
});
export type ShortenUrlOutput = z.infer<typeof ShortenUrlOutputSchema>;


export const shortenUrlFlow = ai.defineFlow(
  {
    name: 'shortenUrlFlow',
    inputSchema: ShortenUrlInputSchema,
    outputSchema: ShortenUrlOutputSchema,
  },
  async ({ longUrl, brandId }) => {
    
    const brand = await getBrand(brandId);
    if (!brand || !brand.integrations?.bitly?.encryptedAccessToken) {
        throw new Error("Bitly integration is not configured for this brand.");
    }
    
    const accessToken = decryptPassword(brand.integrations.bitly.encryptedAccessToken);
    
    try {
        const response = await axios.post(
            'https://api-ssl.bitly.com/v4/shorten',
            { long_url: longUrl },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return { shortUrl: response.data.link };
        
    } catch (error: any) {
         console.error("Bitly API Error:", error.response?.data || error.message);
         throw new Error(`Failed to shorten URL: ${error.response?.data?.description || error.message}`);
    }
  }
);


export async function shortenUrl(input: ShortenUrlInput): Promise<ShortenUrlOutput> {
  return shortenUrlFlow(input);
}
