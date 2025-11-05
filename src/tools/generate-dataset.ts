import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatasetGenerator } from '../generators/dataset-generator.js';
import { EntityType, RelationshipType, SupportedLocale } from '../types/schema.js';
import { validateDatasetSchema } from '../utils/validators.js';

/**
 * Zod schema for relationship definition
 */
const RelationshipDefinitionSchema = z.object({
  references: z.string().min(1, 'Relationship references must be a non-empty string'),
  type: z.nativeEnum(RelationshipType),
  nullable: z.boolean().optional(),
});

/**
 * Zod schema for entity definition
 */
const EntityDefinitionSchema = z.object({
  count: z
    .number()
    .int('Count must be an integer')
    .min(1, 'Count must be at least 1')
    .max(10000, 'Count must not exceed 10000'),
  type: z.nativeEnum(EntityType),
  fields: z.array(z.string()).optional(),
  relationships: z.record(z.string(), RelationshipDefinitionSchema).optional(),
});

/**
 * Zod schema for dataset schema
 */
const DatasetSchemaSchema = z.object({
  entities: z
    .record(z.string(), EntityDefinitionSchema)
    .refine((entities) => Object.keys(entities).length > 0, {
      message: 'Schema must contain at least one entity',
    }),
});

/**
 * Zod schema for generate-dataset parameters
 */
export const GenerateDatasetParamsSchema = z.object({
  schema: DatasetSchemaSchema,
  seed: z.number().int().optional(),
  locale: z.nativeEnum(SupportedLocale).optional().default(SupportedLocale.EN),
});

/**
 * Type for generate-dataset parameters
 */
export type GenerateDatasetParams = z.infer<typeof GenerateDatasetParamsSchema>;

/**
 * Tool definition for MCP server
 */
export const generateDatasetTool: Tool = {
  name: 'generate-dataset',
  description:
    'Generate a structured dataset with multiple related entities and referential integrity. ' +
    'Supports person, company, and custom entity types with one-to-many and many-to-many relationships. ' +
    'Perfect for creating test databases, mock APIs, and complex data scenarios.',
  inputSchema: zodToJsonSchema(GenerateDatasetParamsSchema) as Tool['inputSchema'],
};

/**
 * Generate dataset tool handler
 */
export function handleGenerateDataset(params: unknown) {
  try {
    // Validate parameters
    const validatedParams = GenerateDatasetParamsSchema.parse(params);

    // Additional schema validation (referential integrity, circular dependencies)
    const schemaValidation = validateDatasetSchema(validatedParams.schema);
    if (!schemaValidation.valid) {
      throw new Error(`Invalid dataset schema: ${schemaValidation.errors.join(', ')}`);
    }

    // Create generator
    const generator = new DatasetGenerator({
      seed: validatedParams.seed,
      locale: validatedParams.locale,
    });

    // Generate dataset
    const result = generator.generateDataset(validatedParams.schema);

    // Log generation (no console.log, following linter rules - will log in server.ts instead)

    // Return response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    // Error handling
    if (error instanceof z.ZodError) {
      const errorMessage = `Validation error: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      // Log error (will be handled by server)
      throw new Error(errorMessage);
    }

    if (error instanceof Error) {
      // Log error (will be handled by server)
      throw error;
    }

    // Log unknown error (will be handled by server)
    throw new Error('Unknown error occurred during dataset generation');
  }
}
