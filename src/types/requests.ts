import { SupportedLocale, DatasetSchema, CustomPattern } from './schema.js';

/**
 * Base parameters for all generation requests
 */
export interface GenerationRequestParams {
  count?: number;
  locale?: SupportedLocale;
  seed?: number;
}

/**
 * Parameters for person generation
 */
export interface PersonRequestParams extends GenerationRequestParams {
  includeAddress?: boolean;
  includePhone?: boolean;
  includeDateOfBirth?: boolean;
}

/**
 * Parameters for company generation
 */
export interface CompanyRequestParams extends GenerationRequestParams {
  includeAddress?: boolean;
  includeWebsite?: boolean;
  includeFoundedYear?: boolean;
  includeEmployeeCount?: boolean;
}

/**
 * Parameters for dataset generation
 */
export interface DatasetRequestParams {
  schema: DatasetSchema;
  locale?: SupportedLocale;
  seed?: number;
}

/**
 * Parameters for custom pattern generation
 */
export interface CustomRequestParams extends GenerationRequestParams {
  patterns: Record<string, CustomPattern>;
}
