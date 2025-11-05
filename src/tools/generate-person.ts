import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PersonGenerator } from '../generators/person-generator.js';
import { SupportedLocale } from '../types/schema.js';

/**
 * Zod schema for generate-person parameters
 */
export const GeneratePersonSchema = z.object({
  count: z.number().min(1).max(10000).default(1).describe('Number of person records to generate'),
  locale: z
    .nativeEnum(SupportedLocale)
    .default(SupportedLocale.EN)
    .describe('Locale for generated data'),
  seed: z.number().optional().describe('Optional seed for reproducible generation'),
  includeAddress: z.boolean().default(true).describe('Whether to include address information'),
  includePhone: z.boolean().default(true).describe('Whether to include phone number'),
  includeDateOfBirth: z.boolean().default(false).describe('Whether to include date of birth'),
});

export type GeneratePersonParams = z.infer<typeof GeneratePersonSchema>;

/**
 * MCP Tool definition for generate-person
 */
export const generatePersonTool: Tool = {
  name: 'generate-person',
  description: 'Generates fake person data including names, emails, phone numbers, and addresses',
  inputSchema: zodToJsonSchema(GeneratePersonSchema) as Tool['inputSchema'],
};

/**
 * Handler for generate-person tool
 */
export function handleGeneratePerson(args: unknown): Promise<{ content: unknown[] }> {
  const startTime = Date.now();

  try {
    // Validate and parse arguments
    const params = GeneratePersonSchema.parse(args);

    // Create generator
    const generator = new PersonGenerator({
      seed: params.seed,
      locale: params.locale,
    });

    // Generate data
    const data =
      params.count === 1
        ? [
            generator.generate({
              includeAddress: params.includeAddress,
              includePhone: params.includePhone,
              includeDateOfBirth: params.includeDateOfBirth,
            }),
          ]
        : generator.generateMany(params.count, {
            includeAddress: params.includeAddress,
            includePhone: params.includePhone,
            includeDateOfBirth: params.includeDateOfBirth,
          });

    const generationTimeMs = Date.now() - startTime;

    // Build response
    const metadata = {
      count: data.length,
      seed: generator.getSeed(),
      locale: generator.getLocale(),
      generationTimeMs,
    };

    const responseText = params.seed
      ? `Generated ${data.length} person record${data.length > 1 ? 's' : ''} with seed ${params.seed}`
      : `Generated ${data.length} person record${data.length > 1 ? 's' : ''}`;

    return Promise.resolve({
      content: [
        {
          type: 'text',
          text: responseText,
        },
        {
          type: 'resource',
          resource: {
            uri: 'faker://persons/generated',
            mimeType: 'application/json',
            text: JSON.stringify({ data, metadata }, null, 2),
          },
        },
      ],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid parameters: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw error;
  }
}
