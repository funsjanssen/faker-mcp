import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CustomGenerator } from '../generators/custom-generator.js';
import { SupportedLocale, PatternType, type RangePattern } from '../types/schema.js';

/**
 * Zod schema for range pattern
 */
const RangePatternSchema = z.object({
  min: z.number().describe('Minimum value'),
  max: z.number().describe('Maximum value'),
  precision: z.number().optional().describe('Decimal precision (0 for integers)'),
});

/**
 * Zod schema for custom pattern
 */
const CustomPatternSchema = z.object({
  type: z.nativeEnum(PatternType).describe('Pattern type'),
  value: z
    .union([z.string(), z.array(z.string()), RangePatternSchema])
    .describe('Pattern value (type depends on pattern type)'),
});

/**
 * Zod schema for generate-custom parameters
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

export type GenerateCustomParams = z.infer<typeof GenerateCustomSchema>;

/**
 * MCP Tool definition for generate-custom
 */
export const generateCustomTool: Tool = {
  name: 'generate-custom',
  description:
    'Generates fake data following custom patterns, including regex patterns, enums, formats, and ranges',
  inputSchema: zodToJsonSchema(GenerateCustomSchema) as Tool['inputSchema'],
};

/**
 * Handler for generate-custom tool
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
 * Validate pattern definitions
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
 * Validate regex pattern
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
 * Validate enum pattern
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
 * Validate format pattern
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
 * Validate range pattern
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
