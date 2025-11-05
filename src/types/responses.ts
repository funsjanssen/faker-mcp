import { Address } from './schema.js';

/**
 * Generated person data with complete personal information.
 * Includes mandatory fields (name, email) and optional fields (phone, address, date of birth).
 *
 * @interface PersonData
 * @example
 * ```typescript
 * const person: PersonData = {
 *   id: 'person_12345_0',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   fullName: 'John Doe',
 *   email: 'john.doe@example.com',
 *   phone: '+1-555-123-4567',
 *   dateOfBirth: '1990-01-15',
 *   address: {
 *     street: '123 Main St',
 *     city: 'Springfield',
 *     state: 'IL',
 *     postalCode: '62701',
 *     country: 'United States'
 *   }
 * };
 * ```
 */
export interface PersonData {
  /** Unique identifier for the person record */
  id: string;
  /** First name / given name */
  firstName: string;
  /** Last name / family name */
  lastName: string;
  /** Full name (first + last) */
  fullName: string;
  /** Email address (lowercase) */
  email: string;
  /** Phone number (optional, locale-specific format) */
  phone?: string;
  /** Date of birth in ISO format YYYY-MM-DD (optional) */
  dateOfBirth?: string;
  /** Physical address (optional) */
  address?: Address;
}

/**
 * Generated company data with complete business information.
 * Includes mandatory fields (name, industry, email) and optional fields (phone, website, address, etc.).
 *
 * @interface CompanyData
 * @example
 * ```typescript
 * const company: CompanyData = {
 *   id: 'company_12345_0',
 *   name: 'Acme Corporation',
 *   industry: 'Technology',
 *   email: 'contact@acme.com',
 *   phone: '+1-555-987-6543',
 *   website: 'https://acme.com',
 *   founded: 1995,
 *   employeeCount: 150,
 *   address: {
 *     street: '456 Business Blvd',
 *     city: 'San Francisco',
 *     state: 'CA',
 *     postalCode: '94105',
 *     country: 'United States'
 *   }
 * };
 * ```
 */
export interface CompanyData {
  /** Unique identifier for the company record */
  id: string;
  /** Company name */
  name: string;
  /** Industry or business sector */
  industry: string;
  /** Company email address (lowercase) */
  email: string;
  /** Company phone number (optional) */
  phone?: string;
  /** Company website URL (optional) */
  website?: string;
  /** Physical address (optional) */
  address?: Address;
  /** Year the company was founded (optional) */
  founded?: number;
  /** Number of employees (optional) */
  employeeCount?: number;
}

/**
 * Generated custom data with flexible structure.
 * All fields except 'id' are user-defined based on the custom patterns provided.
 *
 * @typedef {Record<string, unknown> & { id: string }} CustomData
 * @example
 * ```typescript
 * const custom: CustomData = {
 *   id: 'custom_12345_0',
 *   orderId: 'ORD-4567',
 *   amount: 99.99,
 *   status: 'active',
 *   productCode: 'ABC-1234'
 * };
 * ```
 */
export type CustomData = Record<string, unknown> & { id: string };

/**
 * Union type representing any type of generated data.
 * Can be a person, company, or custom data record.
 *
 * @typedef {PersonData | CompanyData | CustomData} GeneratedData
 * @example
 * ```typescript
 * function processData(data: GeneratedData) {
 *   // Handle any type of generated data
 *   console.log(data.id);
 * }
 * ```
 */
export type GeneratedData = PersonData | CompanyData | CustomData;

/**
 * Dataset containing multiple entities.
 * Maps entity names to arrays of generated records.
 *
 * @typedef {Record<string, GeneratedData[]>} GeneratedDataset
 * @example
 * ```typescript
 * const dataset: GeneratedDataset = {
 *   users: [{ id: 'user_1', firstName: 'John', ... }],
 *   companies: [{ id: 'company_1', name: 'Acme', ... }],
 *   orders: [{ id: 'order_1', userId: 'user_1', ... }]
 * };
 * ```
 */
export type GeneratedDataset = Record<string, GeneratedData[]>;

/**
 * Metadata about the data generation process.
 * Includes count, seed, locale, and performance metrics.
 *
 * @interface ResponseMetadata
 * @example
 * ```typescript
 * const metadata: ResponseMetadata = {
 *   count: 100,
 *   seed: 12345,
 *   locale: 'en',
 *   generationTimeMs: 45
 * };
 * ```
 */
export interface ResponseMetadata {
  /** Number of records generated */
  count: number;
  /** Seed used for generation (if provided or auto-generated) */
  seed?: number;
  /** Locale used for generation */
  locale: string;
  /** Time taken to generate data in milliseconds */
  generationTimeMs: number;
}

/**
 * Standard response format for data generation requests.
 * Contains the generated data array and metadata.
 *
 * @interface GenerationResponse
 * @template T - Type of generated data (defaults to GeneratedData)
 * @example
 * ```typescript
 * const response: GenerationResponse<PersonData> = {
 *   data: [
 *     { id: 'person_1', firstName: 'John', lastName: 'Doe', ... }
 *   ],
 *   metadata: {
 *     count: 1,
 *     seed: 12345,
 *     locale: 'en',
 *     generationTimeMs: 12
 *   }
 * };
 * ```
 */
export interface GenerationResponse<T = GeneratedData> {
  /** Array of generated data records */
  data: T[];
  /** Metadata about the generation process */
  metadata: ResponseMetadata;
}

/**
 * Response format for dataset generation requests.
 * Contains the complete dataset with multiple entity types and extended metadata.
 *
 * @interface DatasetGenerationResponse
 * @example
 * ```typescript
 * const response: DatasetGenerationResponse = {
 *   dataset: {
 *     users: [{ id: 'user_1', ... }],
 *     orders: [{ id: 'order_1', userId: 'user_1', ... }]
 *   },
 *   metadata: {
 *     count: 11,
 *     seed: 12345,
 *     locale: 'en',
 *     generationTimeMs: 67,
 *     entityCounts: {
 *       users: 10,
 *       orders: 1
 *     }
 *   }
 * };
 * ```
 */
export interface DatasetGenerationResponse {
  /** Generated dataset with all entities */
  dataset: GeneratedDataset;
  /** Extended metadata including per-entity counts */
  metadata: ResponseMetadata & {
    /** Count of records per entity */
    entityCounts: Record<string, number>;
  };
}
