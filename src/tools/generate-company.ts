import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CompanyGenerator } from '../generators/company-generator.js';
import { SupportedLocale } from '../types/schema.js';

/**
 * Zod schema for generate-company parameters
 */
export const GenerateCompanySchema = z.object({
  count: z.number().min(1).max(10000).default(1).describe('Number of company records to generate'),
  locale: z
    .nativeEnum(SupportedLocale)
    .default(SupportedLocale.EN)
    .describe('Locale for generated data'),
  seed: z.number().optional().describe('Optional seed for reproducible generation'),
  includeAddress: z.boolean().default(true).describe('Whether to include address information'),
  includeWebsite: z.boolean().default(true).describe('Whether to include website URL'),
  includePhone: z.boolean().default(true).describe('Whether to include phone number'),
  includeFoundedYear: z.boolean().default(false).describe('Whether to include founded year'),
  includeEmployeeCount: z.boolean().default(false).describe('Whether to include employee count'),
});

export type GenerateCompanyParams = z.infer<typeof GenerateCompanySchema>;

/**
 * MCP Tool definition for generate-company
 */
export const generateCompanyTool: Tool = {
  name: 'generate-company',
  description:
    'Generates fake company data including names, industries, contact information, and addresses',
  inputSchema: zodToJsonSchema(GenerateCompanySchema) as Tool['inputSchema'],
};

/**
 * Handler for generate-company tool
 */
export function handleGenerateCompany(args: unknown): Promise<{ content: unknown[] }> {
  const startTime = Date.now();

  try {
    // Validate and parse arguments
    const params = GenerateCompanySchema.parse(args);

    // Create generator
    const generator = new CompanyGenerator({
      seed: params.seed,
      locale: params.locale,
    });

    // Generate data
    const data =
      params.count === 1
        ? [
            generator.generate({
              includeAddress: params.includeAddress,
              includeWebsite: params.includeWebsite,
              includePhone: params.includePhone,
              includeFoundedYear: params.includeFoundedYear,
              includeEmployeeCount: params.includeEmployeeCount,
            }),
          ]
        : generator.generateMany(params.count, {
            includeAddress: params.includeAddress,
            includeWebsite: params.includeWebsite,
            includePhone: params.includePhone,
            includeFoundedYear: params.includeFoundedYear,
            includeEmployeeCount: params.includeEmployeeCount,
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
      ? `Generated ${data.length} company record${data.length > 1 ? 's' : ''} with seed ${params.seed}`
      : `Generated ${data.length} company record${data.length > 1 ? 's' : ''}`;

    return Promise.resolve({
      content: [
        {
          type: 'text',
          text: responseText,
        },
        {
          type: 'resource',
          resource: {
            uri: 'faker://companies/generated',
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
