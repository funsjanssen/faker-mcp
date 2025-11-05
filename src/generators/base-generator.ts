import { Faker, en, fr, de, es, ja } from '@faker-js/faker';
import { SupportedLocale } from '../types/schema.js';
import { getOrGenerateSeed } from '../utils/seed-manager.js';

/**
 * Locale mapping for Faker.js
 */
const LOCALE_MAP = {
  [SupportedLocale.EN]: en,
  [SupportedLocale.FR]: fr,
  [SupportedLocale.DE]: de,
  [SupportedLocale.ES]: es,
  [SupportedLocale.JA]: ja,
};

/**
 * Options for configuring a base generator instance.
 *
 * @interface BaseGeneratorOptions
 * @example
 * ```typescript
 * const options: BaseGeneratorOptions = {
 *   locale: SupportedLocale.FR,
 *   seed: 12345
 * };
 * ```
 */
export interface BaseGeneratorOptions {
  /** Locale for data generation (defaults to 'en') */
  locale?: SupportedLocale;
  /** Numeric seed for reproducible generation */
  seed?: number;
  /** String to hash into a seed (alternative to numeric seed) */
  seedString?: string;
}

/**
 * Abstract base class for all data generators.
 * Handles Faker.js instance management, seed handling, and locale configuration.
 * All concrete generators should extend this class.
 *
 * @abstract
 * @class BaseGenerator
 * @example
 * ```typescript
 * class MyGenerator extends BaseGenerator {
 *   generate() {
 *     return {
 *       id: this.generateId('my', 0),
 *       name: this.faker.person.fullName()
 *     };
 *   }
 * }
 *
 * const gen = new MyGenerator({ seed: 12345 });
 * const data = gen.generate();
 * ```
 */
export abstract class BaseGenerator {
  protected readonly faker: Faker;
  protected readonly seed: number;
  protected readonly locale: SupportedLocale;

  /**
   * Creates a new BaseGenerator instance with specified options.
   * Initializes Faker.js with the provided locale and seed.
   *
   * @constructor
   * @param {BaseGeneratorOptions} [options={}] - Generator configuration options
   * @throws {Error} If locale is unsupported or locale data is not found
   * @example
   * ```typescript
   * const generator = new PersonGenerator({
   *   locale: SupportedLocale.FR,
   *   seed: 12345
   * });
   * ```
   */
  constructor(options: BaseGeneratorOptions = {}) {
    const locale = options.locale ?? SupportedLocale.EN;
    const seed = getOrGenerateSeed(options.seed, options.seedString);

    // Validate locale
    if (!Object.values(SupportedLocale).includes(locale)) {
      throw new Error(
        `Unsupported locale: ${locale}. Supported locales: ${Object.values(SupportedLocale).join(', ')}`
      );
    }

    this.locale = locale;
    this.seed = seed;

    // Create Faker instance with locale and seed
    const localeData = LOCALE_MAP[locale];
    if (!localeData) {
      throw new Error(`Locale data not found for: ${locale}`);
    }

    this.faker = new Faker({ locale: localeData });
    this.faker.seed(seed);
  }

  /**
   * Gets the seed value used by this generator.
   * Useful for reproducing the same data in future runs.
   *
   * @returns {number} The seed value
   * @example
   * ```typescript
   * const seed = generator.getSeed();
   * console.log(`Use seed ${seed} to reproduce this data`);
   * ```
   */
  public getSeed(): number {
    return this.seed;
  }

  /**
   * Gets the locale used by this generator.
   *
   * @returns {SupportedLocale} The locale (e.g., 'en', 'fr', 'de')
   * @example
   * ```typescript
   * const locale = generator.getLocale();
   * console.log(`Generating data in locale: ${locale}`);
   * ```
   */
  public getLocale(): SupportedLocale {
    return this.locale;
  }

  /**
   * Generates a unique identifier for a record.
   * Format: `{prefix}_{seed}_{index}`
   *
   * @protected
   * @param {string} prefix - Prefix for the ID (e.g., 'person', 'company')
   * @param {number} index - Index of the record in the batch
   * @returns {string} A unique identifier string
   * @example
   * ```typescript
   * const id = this.generateId('person', 0);
   * // Returns: 'person_12345_0'
   * ```
   */
  protected generateId(prefix: string, index: number): string {
    return `${prefix}_${this.seed}_${index}`;
  }

  /**
   * Helper method to batch generate records efficiently.
   * Processes records in batches to allow garbage collection for large datasets.
   *
   * @protected
   * @template T - Type of generated records
   * @param {number} count - Total number of records to generate
   * @param {Function} generateFn - Function that generates a single record given an index
   * @param {number} [batchSize=1000] - Number of records per batch
   * @returns {T[]} Array of generated records
   * @example
   * ```typescript
   * const persons = this.batchGenerate(5000, (index) => ({
   *   id: this.generateId('person', index),
   *   name: this.faker.person.fullName()
   * }));
   * ```
   */
  protected batchGenerate<T>(
    count: number,
    generateFn: (index: number) => T,
    batchSize = 1000
  ): T[] {
    const results: T[] = [];
    const batches = Math.ceil(count / batchSize);

    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, count - i * batchSize);
      const batch = Array.from({ length: currentBatchSize }, (_, idx) =>
        generateFn(i * batchSize + idx)
      );
      results.push(...batch);

      // Allow GC between batches for large datasets
      if (count > 5000) {
        // Small delay to allow event loop processing
        // In Node.js this doesn't block synchronously
      }
    }

    return results;
  }
}
