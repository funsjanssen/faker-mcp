import { SupportedLocale, DatasetSchema, CustomPattern } from './schema.js';

/**
 * Base parameters shared by all generation requests.
 * Provides common options for count, locale, and seed.
 *
 * @interface GenerationRequestParams
 * @example
 * ```typescript
 * const params: GenerationRequestParams = {
 *   count: 100,
 *   locale: SupportedLocale.EN,
 *   seed: 12345
 * };
 * ```
 */
export interface GenerationRequestParams {
  /** Number of records to generate (1-10000, defaults to 1) */
  count?: number;
  /** Locale for data generation (defaults to 'en') */
  locale?: SupportedLocale;
  /** Optional seed for reproducible generation */
  seed?: number;
}

/**
 * Parameters for person data generation.
 * Extends base parameters with person-specific options.
 *
 * @interface PersonRequestParams
 * @extends GenerationRequestParams
 * @example
 * ```typescript
 * const params: PersonRequestParams = {
 *   count: 50,
 *   locale: SupportedLocale.FR,
 *   seed: 12345,
 *   includeAddress: true,
 *   includePhone: true,
 *   includeDateOfBirth: false
 * };
 * ```
 */
export interface PersonRequestParams extends GenerationRequestParams {
  /** Whether to include address information (defaults to true) */
  includeAddress?: boolean;
  /** Whether to include phone number (defaults to true) */
  includePhone?: boolean;
  /** Whether to include date of birth (defaults to false) */
  includeDateOfBirth?: boolean;
}

/**
 * Parameters for company data generation.
 * Extends base parameters with company-specific options.
 *
 * @interface CompanyRequestParams
 * @extends GenerationRequestParams
 * @example
 * ```typescript
 * const params: CompanyRequestParams = {
 *   count: 25,
 *   locale: SupportedLocale.DE,
 *   includeAddress: true,
 *   includeWebsite: true,
 *   includeFoundedYear: true,
 *   includeEmployeeCount: true
 * };
 * ```
 */
export interface CompanyRequestParams extends GenerationRequestParams {
  /** Whether to include address information (defaults to true) */
  includeAddress?: boolean;
  /** Whether to include website URL (defaults to true) */
  includeWebsite?: boolean;
  /** Whether to include founded year (defaults to false) */
  includeFoundedYear?: boolean;
  /** Whether to include employee count (defaults to false) */
  includeEmployeeCount?: boolean;
}

/**
 * Parameters for dataset generation with multiple related entities.
 * Uses a schema to define entities and their relationships.
 *
 * @interface DatasetRequestParams
 * @example
 * ```typescript
 * const params: DatasetRequestParams = {
 *   schema: {
 *     entities: {
 *       users: {
 *         count: 10,
 *         type: EntityType.PERSON
 *       },
 *       orders: {
 *         count: 50,
 *         type: EntityType.CUSTOM,
 *         fields: ['orderId', 'amount'],
 *         relationships: {
 *           userId: {
 *             references: 'users',
 *             type: RelationshipType.ONE_TO_MANY
 *           }
 *         }
 *       }
 *     }
 *   },
 *   locale: SupportedLocale.EN,
 *   seed: 12345
 * };
 * ```
 */
export interface DatasetRequestParams {
  /** Schema defining entities and relationships */
  schema: DatasetSchema;
  /** Locale for data generation (defaults to 'en') */
  locale?: SupportedLocale;
  /** Optional seed for reproducible generation */
  seed?: number;
}

/**
 * Parameters for custom pattern-based data generation.
 * Extends base parameters with pattern definitions.
 *
 * @interface CustomRequestParams
 * @extends GenerationRequestParams
 * @example
 * ```typescript
 * const params: CustomRequestParams = {
 *   count: 100,
 *   patterns: {
 *     orderId: {
 *       type: PatternType.REGEX,
 *       value: 'ORD-[A-Z]{3}-\\d{4}'
 *     },
 *     status: {
 *       type: PatternType.ENUM,
 *       value: ['pending', 'shipped', 'delivered']
 *     },
 *     amount: {
 *       type: PatternType.RANGE,
 *       value: { min: 10, max: 1000, precision: 2 }
 *     }
 *   },
 *   seed: 12345
 * };
 * ```
 */
export interface CustomRequestParams extends GenerationRequestParams {
  /** Map of field names to custom pattern definitions */
  patterns: Record<string, CustomPattern>;
}
