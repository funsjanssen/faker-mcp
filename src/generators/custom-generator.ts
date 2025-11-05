import RandExp from 'randexp';
import { BaseGenerator } from './base-generator.js';
import { PatternType, type CustomPattern, type RangePattern } from '../types/schema.js';

/**
 * Custom data generation options
 */
export interface CustomGenerationOptions {
  patterns: Record<string, CustomPattern>;
}

/**
 * Generated custom record
 */
export interface CustomData {
  id: string;
  [key: string]: string | number | boolean;
}

/**
 * Generator for custom data patterns
 * Supports regex, enum, format, and range patterns
 */
export class CustomGenerator extends BaseGenerator {
  private recordIndex: number = 0;

  /**
   * Generate a single custom data record
   */
  public generate(options: CustomGenerationOptions): CustomData {
    const record: CustomData = {
      id: this.generateId('custom', this.recordIndex++),
    };

    for (const [fieldName, pattern] of Object.entries(options.patterns)) {
      record[fieldName] = this.generateFieldValue(pattern);
    }

    return record;
  }

  /**
   * Generate multiple custom data records
   */
  public generateMany(count: number, options: CustomGenerationOptions): CustomData[] {
    return this.batchGenerate(count, (index) => {
      const record: CustomData = {
        id: this.generateId('custom', index),
      };

      for (const [fieldName, pattern] of Object.entries(options.patterns)) {
        record[fieldName] = this.generateFieldValue(pattern);
      }

      return record;
    });
  }

  /**
   * Generate value for a single field based on pattern
   */
  private generateFieldValue(pattern: CustomPattern): string | number {
    switch (pattern.type) {
      case PatternType.REGEX:
        return this.generateRegexPattern(pattern.value as string);
      case PatternType.ENUM:
        return this.generateEnumPattern(pattern.value as string[]);
      case PatternType.FORMAT:
        return this.generateFormatPattern(pattern.value as string);
      case PatternType.RANGE:
        return this.generateRangePattern(pattern.value as RangePattern);
      default:
        // Exhaustive check - this ensures all pattern types are handled
        throw new Error(`Unsupported pattern type`);
    }
  }

  /**
   * Generate data matching a regex pattern
   */
  private generateRegexPattern(regexValue: string): string {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const randexp = new RandExp(regexValue) as {
        gen: () => string;
        randInt?: (min: number, max: number) => number;
      };
      // Use faker's random generator for consistency with seed
      randexp.randInt = (min: number, max: number) => {
        return this.faker.number.int({ min, max });
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return randexp.gen();
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${regexValue}. Error: ${(error as Error).message}`);
    }
  }

  /**
   * Generate data by randomly selecting from enum values
   */
  private generateEnumPattern(enumValues: string[]): string {
    if (!Array.isArray(enumValues) || enumValues.length === 0) {
      throw new Error('Enum pattern must have at least one value');
    }
    return this.faker.helpers.arrayElement(enumValues);
  }

  /**
   * Generate data using format template with placeholders
   * Supported placeholders:
   * - {{year}}: Current year
   * - {{random:N}}: N random alphanumeric characters
   * - {{number:N}}: N random digits
   */
  private generateFormatPattern(formatValue: string): string {
    let result = formatValue;

    // Replace {{year}} with current year
    result = result.replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

    // Replace {{random:N}} with N random alphanumeric characters
    result = result.replace(/\{\{random:(\d+)\}\}/g, (_match, length: string) => {
      return this.faker.string.alphanumeric(parseInt(length, 10));
    });

    // Replace {{number:N}} with N random digits
    result = result.replace(/\{\{number:(\d+)\}\}/g, (_match, length: string) => {
      return this.faker.string.numeric(parseInt(length, 10));
    });

    return result;
  }

  /**
   * Generate numeric value within specified range
   */
  private generateRangePattern(rangeValue: RangePattern): number {
    const { min, max, precision } = rangeValue;

    if (min > max) {
      throw new Error(`Invalid range: min (${min}) must be less than or equal to max (${max})`);
    }

    if (precision === undefined || precision === 0) {
      // Integer range
      return this.faker.number.int({ min, max });
    } else {
      // Float range with precision
      const value = this.faker.number.float({ min, max, multipleOf: Math.pow(10, -precision) });
      return parseFloat(value.toFixed(precision));
    }
  }
}
