import { Address } from './schema.js';

/**
 * Generated person data
 */
export interface PersonData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Address;
}

/**
 * Generated company data
 */
export interface CompanyData {
  id: string;
  name: string;
  industry: string;
  email: string;
  phone?: string;
  website?: string;
  address?: Address;
  founded?: number;
  employeeCount?: number;
}

/**
 * Generated custom data (flexible structure)
 */
export type CustomData = Record<string, unknown> & { id: string };

/**
 * Union type for all generated data types
 */
export type GeneratedData = PersonData | CompanyData | CustomData;

/**
 * Dataset containing multiple entities
 */
export type GeneratedDataset = Record<string, GeneratedData[]>;

/**
 * Response metadata
 */
export interface ResponseMetadata {
  count: number;
  seed?: number;
  locale: string;
  generationTimeMs: number;
}

/**
 * Generation response
 */
export interface GenerationResponse<T = GeneratedData> {
  data: T[];
  metadata: ResponseMetadata;
}

/**
 * Dataset generation response
 */
export interface DatasetGenerationResponse {
  dataset: GeneratedDataset;
  metadata: ResponseMetadata & {
    entityCounts: Record<string, number>;
  };
}
