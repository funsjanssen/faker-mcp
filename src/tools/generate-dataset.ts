import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DatasetGenerator } from '../generators/dataset-generator.js';
import { EntityType, RelationshipType, SupportedLocale } from '../types/schema.js';
import { validateDatasetSchema } from '../utils/validators.js';

/**
 * Zod validation schema for relationship definitions within dataset entities.
 *
 * @constant
 * @type {z.ZodObject}
 */
const RelationshipDefinitionSchema = z.object({
  references: z.string().min(1, 'Relationship references must be a non-empty string'),
  type: z.nativeEnum(RelationshipType),
  nullable: z.boolean().optional(),
});

/**
 * Zod validation schema for entity definitions within datasets.
 *
 * @constant
 * @type {z.ZodObject}
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
 * Zod validation schema for complete dataset schemas.
 *
 * @constant
 * @type {z.ZodObject}
 */
const DatasetSchemaSchema = z.object({
  entities: z
    .record(z.string(), EntityDefinitionSchema)
    .refine((entities) => Object.keys(entities).length > 0, {
      message: 'Schema must contain at least one entity',
    }),
});

/**
 * Zod validation schema for generate-dataset tool parameters.
 *
 * @constant
 * @type {z.ZodObject}
 */
export const GenerateDatasetParamsSchema = z.object({
  schema: DatasetSchemaSchema,
  seed: z.number().int().optional(),
  locale: z.nativeEnum(SupportedLocale).optional().default(SupportedLocale.EN),
});

/**
 * Type definition for generate-dataset parameters, inferred from Zod schema.
 *
 * @typedef {z.infer<typeof GenerateDatasetParamsSchema>} GenerateDatasetParams
 */
export type GenerateDatasetParams = z.infer<typeof GenerateDatasetParamsSchema>;

/**
 * MCP Tool definition for dataset generation with multiple related entities.
 * Supports complex data scenarios with referential integrity.
 *
 * @constant
 * @type {Tool}
 * @property {string} name - Tool identifier
 * @property {string} description - Human-readable tool description
 * @property {Object} inputSchema - JSON Schema for tool inputs
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
 * Handler function for the generate-dataset MCP tool.
 * Validates schema structure, checks referential integrity, generates related entities,
 * and returns formatted MCP response with complete dataset.
 *
 * @param {unknown} params - Raw parameters from MCP client (validated against schema)
 * @returns {{ content: Array<{ type: string; text: string }> }} MCP-formatted response with dataset
 * @throws {Error} If schema validation fails, circular dependencies detected, or generation fails
 * @example
 * ```typescript
 * const result = handleGenerateDataset({
 *   schema: {
 *     entities: {
 *       users: { count: 10, type: 'person' },
 *       orders: {
 *         count: 50,
 *         type: 'custom',
 *         fields: ['amount', 'status'],
 *         relationships: {
 *           userId: { references: 'users', type: 'one-to-many' }
 *         }
 *       }
 *     }
 *   },
 *   seed: 12345
 * });
 * // Returns MCP response with users and orders datasets
 * ```
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
