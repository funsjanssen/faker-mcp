/**
 * Supported entity types for dataset generation.
 * These types determine the structure and fields of generated entities.
 *
 * @enum {string}
 * @example
 * ```typescript
 * const schema: DatasetSchema = {
 *   entities: {
 *     users: {
 *       type: EntityType.PERSON,
 *       count: 10
 *     }
 *   }
 * };
 * ```
 */
export enum EntityType {
  /** Person entity with name, email, phone, and address fields */
  PERSON = 'person',
  /** Company entity with name, industry, email, website, and address fields */
  COMPANY = 'company',
  /** Custom entity with user-defined fields */
  CUSTOM = 'custom',
}

/**
 * Supported relationship types for dataset generation.
 * Defines how entities are related to each other.
 *
 * @enum {string}
 * @example
 * ```typescript
 * const relationship: RelationshipDefinition = {
 *   references: 'users',
 *   type: RelationshipType.ONE_TO_MANY
 * };
 * ```
 */
export enum RelationshipType {
  /** One-to-many relationship (e.g., one user has many orders) */
  ONE_TO_MANY = 'one-to-many',
  /** Many-to-many relationship (e.g., users can have many roles, roles can have many users) */
  MANY_TO_MANY = 'many-to-many',
}

/**
 * Supported custom pattern types for data generation.
 * These patterns allow generating data that follows specific rules.
 *
 * @enum {string}
 * @example
 * ```typescript
 * const pattern: CustomPattern = {
 *   type: PatternType.REGEX,
 *   value: '[A-Z]{3}-\\d{4}'
 * };
 * ```
 */
export enum PatternType {
  /** Regular expression pattern (e.g., '[A-Z]{3}-\\d{4}') */
  REGEX = 'regex',
  /** Enumeration - random selection from array (e.g., ['active', 'inactive', 'pending']) */
  ENUM = 'enum',
  /** Format template with placeholders (e.g., 'USER-{{number:4}}-{{year}}') */
  FORMAT = 'format',
  /** Numeric range with optional precision (e.g., { min: 0, max: 100, precision: 2 }) */
  RANGE = 'range',
}

/**
 * Supported locales for data generation.
 * Locales affect the generated data (names, addresses, phone formats, etc.).
 *
 * @enum {string}
 * @example
 * ```typescript
 * const generator = new PersonGenerator({
 *   locale: SupportedLocale.FR
 * });
 * ```
 */
export enum SupportedLocale {
  /** English (United States) */
  EN = 'en',
  /** French (France) */
  FR = 'fr',
  /** German (Germany) */
  DE = 'de',
  /** Spanish (Spain) */
  ES = 'es',
  /** Japanese (Japan) */
  JA = 'ja',
}

/**
 * Represents a physical address with complete location information.
 * Used in person and company data generation.
 *
 * @interface Address
 * @example
 * ```typescript
 * const address: Address = {
 *   street: '123 Main St',
 *   city: 'Springfield',
 *   state: 'IL',
 *   postalCode: '62701',
 *   country: 'United States'
 * };
 * ```
 */
export interface Address {
  /** Street address including house/building number */
  street: string;
  /** City name */
  city: string;
  /** State or province name */
  state: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** Country name */
  country: string;
}

/**
 * Defines a relationship between entities in a dataset.
 * Specifies which entity is referenced and the relationship type.
 *
 * @interface RelationshipDefinition
 * @example
 * ```typescript
 * const relationship: RelationshipDefinition = {
 *   references: 'users',
 *   type: RelationshipType.ONE_TO_MANY,
 *   nullable: false
 * };
 * ```
 */
export interface RelationshipDefinition {
  /** Name of the entity being referenced */
  references: string;
  /** Type of relationship (one-to-many or many-to-many) */
  type: RelationshipType;
  /** Whether the relationship can be null (optional, defaults to false) */
  nullable?: boolean;
}

/**
 * Defines an entity within a dataset schema.
 * Specifies the entity type, count, fields, and relationships.
 *
 * @interface EntityDefinition
 * @example
 * ```typescript
 * const entityDef: EntityDefinition = {
 *   count: 50,
 *   type: EntityType.CUSTOM,
 *   fields: ['orderId', 'amount', 'status'],
 *   relationships: {
 *     userId: {
 *       references: 'users',
 *       type: RelationshipType.ONE_TO_MANY
 *     }
 *   }
 * };
 * ```
 */
export interface EntityDefinition {
  /** Number of records to generate for this entity (1-10000) */
  count: number;
  /** Entity type (person, company, or custom) */
  type: EntityType;
  /** Field names for custom entities (required for EntityType.CUSTOM) */
  fields?: string[];
  /** Relationships to other entities (field name -> relationship definition) */
  relationships?: Record<string, RelationshipDefinition>;
}

/**
 * Complete schema definition for dataset generation.
 * Contains all entities and their relationships.
 *
 * @interface DatasetSchema
 * @example
 * ```typescript
 * const schema: DatasetSchema = {
 *   entities: {
 *     users: {
 *       count: 10,
 *       type: EntityType.PERSON
 *     },
 *     companies: {
 *       count: 5,
 *       type: EntityType.COMPANY
 *     },
 *     orders: {
 *       count: 50,
 *       type: EntityType.CUSTOM,
 *       fields: ['orderId', 'amount', 'status'],
 *       relationships: {
 *         userId: {
 *           references: 'users',
 *           type: RelationshipType.ONE_TO_MANY
 *         }
 *       }
 *     }
 *   }
 * };
 * ```
 */
export interface DatasetSchema {
  /** Map of entity names to their definitions */
  entities: Record<string, EntityDefinition>;
}

/**
 * Defines a numeric range pattern for custom data generation.
 * Supports both integer and floating-point ranges.
 *
 * @interface RangePattern
 * @example
 * ```typescript
 * // Integer range
 * const intRange: RangePattern = { min: 1, max: 100 };
 *
 * // Float range with 2 decimal places
 * const floatRange: RangePattern = { min: 0, max: 1, precision: 2 };
 * ```
 */
export interface RangePattern {
  /** Minimum value (inclusive) */
  min: number;
  /** Maximum value (inclusive) */
  max: number;
  /** Decimal precision (0 or undefined for integers, >0 for floats) */
  precision?: number;
}

/**
 * Defines a custom pattern for data generation.
 * The pattern type determines how the value is interpreted.
 *
 * @interface CustomPattern
 * @example
 * ```typescript
 * // Regex pattern
 * const regex: CustomPattern = {
 *   type: PatternType.REGEX,
 *   value: '[A-Z]{3}-\\d{4}'
 * };
 *
 * // Enum pattern
 * const enum: CustomPattern = {
 *   type: PatternType.ENUM,
 *   value: ['active', 'inactive', 'pending']
 * };
 *
 * // Format pattern
 * const format: CustomPattern = {
 *   type: PatternType.FORMAT,
 *   value: 'USER-{{number:4}}-{{year}}'
 * };
 *
 * // Range pattern
 * const range: CustomPattern = {
 *   type: PatternType.RANGE,
 *   value: { min: 0, max: 100, precision: 2 }
 * };
 * ```
 */
export interface CustomPattern {
  /** Pattern type (regex, enum, format, or range) */
  type: PatternType;
  /** Pattern value (type depends on pattern type) */
  value: string | string[] | RangePattern;
}

/**
 * Configuration for seed-based reproducible data generation.
 * Tracks whether a seed was explicitly provided or auto-generated.
 *
 * @interface SeedConfiguration
 * @example
 * ```typescript
 * const config: SeedConfiguration = {
 *   seed: 12345,
 *   autoGenerated: false,
 *   seedString: 'my-test-data'
 * };
 * ```
 */
export interface SeedConfiguration {
  /** Numeric seed value (if provided) */
  seed?: number;
  /** Whether the seed was automatically generated (true) or explicitly provided (false) */
  autoGenerated: boolean;
  /** String used to generate the seed (if hash-based seed generation was used) */
  seedString?: string;
}
