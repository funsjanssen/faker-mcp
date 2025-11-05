import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CustomGenerator } from '../generators/custom-generator.js';
import { SupportedLocale, PatternType, type RangePattern } from '../types/schema.js';

/**
 * Zod validation schema for range pattern values.
 *
 * @constant
 * @type {z.ZodObject}
 */
const RangePatternSchema = z.object({
  min: z.number().describe('Minimum value'),
  max: z.number().describe('Maximum value'),
  precision: z.number().optional().describe('Decimal precision (0 for integers)'),
});

/**
 * Zod validation schema for custom pattern definitions.
 *
 * @constant
 * @type {z.ZodObject}
 */
const CustomPatternSchema = z.object({
  type: z.nativeEnum(PatternType).describe('Pattern type'),
  value: z
    .union([z.string(), z.array(z.string()), RangePatternSchema])
    .describe('Pattern value (type depends on pattern type)'),
});

/**
 * Zod validation schema for generate-custom tool parameters.
 *
 * @constant
 * @type {z.ZodObject}
 */
export const GenerateCustomSchema = z.object({
  count: z.number().min(1).max(10000).default(1).describe('Number of records to generate'),
  patterns: z
    .record(z.string(), CustomPatternSchema)
    .refine((patterns) => Object.keys(patterns).length > 0, {
      message: 'At least one pattern must be defined',
    })
    .describe('Map of field names to pattern definitions'),
  locale: z
    .nativeEnum(SupportedLocale)
    .default(SupportedLocale.EN)
    .describe('Locale for generated data (affects format-based patterns)'),
  seed: z.number().optional().describe('Optional seed for reproducible generation'),
});

/**
 * Type definition for generate-custom parameters, inferred from Zod schema.
 *
 * @typedef {z.infer<typeof GenerateCustomSchema>} GenerateCustomParams
 */
export type GenerateCustomParams = z.infer<typeof GenerateCustomSchema>;

/**
 * MCP Tool definition for custom pattern-based data generation.
 * Supports regex, enum, format, and range patterns.
 *
 * @constant
 * @type {Tool}
 * @property {string} name - Tool identifier
 * @property {string} description - Human-readable tool description
 * @property {Object} inputSchema - JSON Schema for tool inputs
 */
export const generateCustomTool: Tool = {
  name: 'generate-custom',
  description:
    'Generates fake data following custom patterns, including regex patterns, enums, formats, and ranges',
  inputSchema: zodToJsonSchema(GenerateCustomSchema) as Tool['inputSchema'],
};

/**
 * Handler function for the generate-custom MCP tool.
 * Validates pattern definitions, generates custom data following patterns,
 * and returns formatted MCP response.
 *
 * @async
 * @param {unknown} args - Raw arguments from MCP client (validated against schema)
 * @returns {Promise<{ content: unknown[] }>} MCP-formatted response with generated data
 * @throws {Error} If parameter validation fails, patterns are invalid, or generation encounters an error
 * @example
 * ```typescript
 * const result = await handleGenerateCustom({
 *   count: 100,
 *   patterns: {
 *     orderId: { type: 'regex', value: 'ORD-[A-Z]{3}-\\d{4}' },
 *     status: { type: 'enum', value: ['pending', 'shipped', 'delivered'] },
 *     amount: { type: 'range', value: { min: 10, max: 1000, precision: 2 } }
 *   },
 *   seed: 12345
 * });
 * ```
 */
export function handleGenerateCustom(args: unknown): Promise<{ content: unknown[] }> {
  const startTime = Date.now();

  try {
    // Validate and parse arguments
    const params = GenerateCustomSchema.parse(args);

    // Validate patterns
    validatePatterns(params.patterns);

    // Create generator
    const generator = new CustomGenerator({
      seed: params.seed,
      locale: params.locale,
    });

    // Generate data
    const data =
      params.count === 1
        ? [generator.generate({ patterns: params.patterns })]
        : generator.generateMany(params.count, { patterns: params.patterns });

    const generationTimeMs = Date.now() - startTime;

    // Build response
    const metadata = {
      count: data.length,
      patternCount: Object.keys(params.patterns).length,
      seed: generator.getSeed(),
      locale: generator.getLocale(),
      generationTimeMs,
    };

    const responseText = params.seed
      ? `Generated ${data.length} custom record${data.length > 1 ? 's' : ''} with seed ${params.seed}`
      : `Generated ${data.length} custom record${data.length > 1 ? 's' : ''}`;

    return Promise.resolve({
      content: [
        {
          type: 'text',
          text: responseText,
        },
        {
          type: 'resource',
          resource: {
            uri: 'faker://custom/generated',
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

/**
 * Validates all pattern definitions in a patterns map.
 * Checks each pattern type (regex, enum, format, range) for correctness.
 *
 * @param {Record<string, { type: PatternType; value: string | string[] | RangePattern }>} patterns - Map of field names to patterns
 * @throws {Error} If any pattern is invalid, with field name and specific error
 * @example
 * ```typescript
 * validatePatterns({
 *   code: { type: PatternType.REGEX, value: '[A-Z]{3}' },
 *   status: { type: PatternType.ENUM, value: ['active', 'inactive'] }
 * });
 * ```
 */
function validatePatterns(
  patterns: Record<string, { type: PatternType; value: string | string[] | RangePattern }>
): void {
  for (const [fieldName, pattern] of Object.entries(patterns)) {
    try {
      switch (pattern.type) {
        case PatternType.REGEX:
          validateRegexPattern(pattern.value as string);
          break;
        case PatternType.ENUM:
          validateEnumPattern(pattern.value as string[]);
          break;
        case PatternType.FORMAT:
          validateFormatPattern(pattern.value as string);
          break;
        case PatternType.RANGE:
          validateRangePattern(pattern.value as RangePattern);
          break;
        default:
          throw new Error(`Unsupported pattern type`);
      }
    } catch (error) {
      throw new Error(`Invalid pattern for field '${fieldName}': ${(error as Error).message}`);
    }
  }
}

/**
 * Validates a regex pattern string by attempting to compile it.
 *
 * @param {string} regexValue - The regex pattern to validate
 * @throws {Error} If the regex pattern is empty or has invalid syntax
 * @example
 * ```typescript
 * validateRegexPattern('[A-Z]{3}-\\d{4}'); // Valid
 * validateRegexPattern('[invalid'); // Throws error
 * ```
 */
function validateRegexPattern(regexValue: string): void {
  if (typeof regexValue !== 'string' || regexValue.length === 0) {
    throw new Error('Regex pattern must be a non-empty string');
  }

  try {
    new RegExp(regexValue);
  } catch (error) {
    throw new Error(`Invalid regex syntax: ${(error as Error).message}`);
  }
}

/**
 * Validates an enum pattern array.
 * Ensures the array is non-empty and contains only string values.
 *
 * @param {string[]} enumValues - Array of enum values
 * @throws {Error} If the array is empty, not an array, or contains non-string values
 * @example
 * ```typescript
 * validateEnumPattern(['active', 'inactive', 'pending']); // Valid
 * validateEnumPattern([]); // Throws error
 * validateEnumPattern([1, 2, 3]); // Throws error (not strings)
 * ```
 */
function validateEnumPattern(enumValues: string[]): void {
  if (!Array.isArray(enumValues)) {
    throw new Error('Enum pattern must be an array');
  }

  if (enumValues.length === 0) {
    throw new Error('Enum pattern must have at least one value');
  }

  if (!enumValues.every((v) => typeof v === 'string')) {
    throw new Error('Enum pattern must contain only string values');
  }
}

/**
 * Validates a format pattern string with placeholder syntax.
 * Supports {{year}}, {{random:N}}, and {{number:N}} placeholders.
 *
 * @param {string} formatValue - The format template string
 * @throws {Error} If the format is empty or contains invalid placeholders
 * @example
 * ```typescript
 * validateFormatPattern('USER-{{number:4}}-{{year}}'); // Valid
 * validateFormatPattern('CODE-{{random:5}}'); // Valid
 * validateFormatPattern(''); // Throws error
 * ```
 */
function validateFormatPattern(formatValue: string): void {
  if (typeof formatValue !== 'string' || formatValue.length === 0) {
    throw new Error('Format pattern must be a non-empty string');
  }

  // Check for valid placeholder syntax
  const placeholderRegex = /\{\{(year|random:\d+|number:\d+)\}\}/g;
  const placeholders = formatValue.match(placeholderRegex);

  if (placeholders) {
    // Validate each placeholder
    for (const placeholder of placeholders) {
      if (placeholder.includes('random:') || placeholder.includes('number:')) {
        const lengthMatch = placeholder.match(/:(\d+)\}\}/);
        if (lengthMatch && lengthMatch[1]) {
          const length = parseInt(lengthMatch[1], 10);
          if (length <= 0 || length > 100) {
            throw new Error(
              `Invalid placeholder length in '${placeholder}': must be between 1 and 100`
            );
          }
        }
      }
    }
  }
}

/**
 * Validates a range pattern object.
 * Ensures min/max are numbers, min <= max, and precision is valid.
 *
 * @param {RangePattern} rangeValue - The range pattern to validate
 * @throws {Error} If the range is invalid (min > max, missing values, invalid precision)
 * @example
 * ```typescript
 * validateRangePattern({ min: 0, max: 100 }); // Valid integer range
 * validateRangePattern({ min: 0, max: 1, precision: 2 }); // Valid float range
 * validateRangePattern({ min: 100, max: 0 }); // Throws error (min > max)
 * ```
 */
function validateRangePattern(rangeValue: RangePattern): void {
  if (typeof rangeValue !== 'object' || rangeValue === null) {
    throw new Error('Range pattern must be an object');
  }

  if (typeof rangeValue.min !== 'number' || typeof rangeValue.max !== 'number') {
    throw new Error('Range pattern must have numeric min and max values');
  }

  if (rangeValue.min > rangeValue.max) {
    throw new Error(
      `Range pattern invalid: min (${rangeValue.min}) must be less than or equal to max (${rangeValue.max})`
    );
  }

  if (rangeValue.precision !== undefined) {
    if (typeof rangeValue.precision !== 'number' || rangeValue.precision < 0) {
      throw new Error('Range pattern precision must be a non-negative number');
    }
  }
}
