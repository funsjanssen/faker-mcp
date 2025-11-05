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
 * Base generator options
 */
export interface BaseGeneratorOptions {
  locale?: SupportedLocale;
  seed?: number;
  seedString?: string;
}

/**
 * Abstract base class for all data generators
 * Handles Faker instance management, seed handling, and locale setup
 */
export abstract class BaseGenerator {
  protected readonly faker: Faker;
  protected readonly seed: number;
  protected readonly locale: SupportedLocale;

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
   * Gets the seed used by this generator
   */
  public getSeed(): number {
    return this.seed;
  }

  /**
   * Gets the locale used by this generator
   */
  public getLocale(): SupportedLocale {
    return this.locale;
  }

  /**
   * Generates a unique ID for a record
   */
  protected generateId(prefix: string, index: number): string {
    return `${prefix}_${this.seed}_${index}`;
  }

  /**
   * Helper method to batch generate records
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
