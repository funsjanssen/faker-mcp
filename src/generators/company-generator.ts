import { BaseGenerator, BaseGeneratorOptions } from './base-generator.js';
import { CompanyData } from '../types/responses.js';

/**
 * Options for controlling company data generation.
 *
 * @interface CompanyGenerationOptions
 * @example
 * ```typescript
 * const options: CompanyGenerationOptions = {
 *   includeAddress: true,
 *   includeWebsite: true,
 *   includeFoundedYear: true,
 *   includeEmployeeCount: true
 * };
 * ```
 */
export interface CompanyGenerationOptions {
  /** Whether to include address information (defaults to true) */
  includeAddress?: boolean;
  /** Whether to include phone number (defaults to true) */
  includePhone?: boolean;
  /** Whether to include website URL (defaults to true) */
  includeWebsite?: boolean;
  /** Whether to include founded year (defaults to false) */
  includeFoundedYear?: boolean;
  /** Whether to include employee count (defaults to false) */
  includeEmployeeCount?: boolean;
}

/**
 * Generator for realistic company data.
 * Generates company records with names, industries, contact information, addresses, and business details.
 * Supports multiple locales and reproducible generation via seeds.
 *
 * @class CompanyGenerator
 * @extends BaseGenerator
 * @example
 * ```typescript
 * const generator = new CompanyGenerator({
 *   locale: SupportedLocale.EN,
 *   seed: 12345
 * });
 *
 * // Generate a single company
 * const company = generator.generate({
 *   includeAddress: true,
 *   includeWebsite: true,
 *   includeFoundedYear: true
 * });
 *
 * // Generate multiple companies
 * const companies = generator.generateMany(50, {
 *   includeEmployeeCount: true
 * });
 * ```
 */
export class CompanyGenerator extends BaseGenerator {
  /**
   * Creates a new CompanyGenerator instance.
   *
   * @constructor
   * @param {BaseGeneratorOptions} [options={}] - Generator configuration options
   * @example
   * ```typescript
   * const generator = new CompanyGenerator({
   *   locale: SupportedLocale.DE,
   *   seed: 12345
   * });
   * ```
   */
  constructor(options: BaseGeneratorOptions = {}) {
    super(options);
  }

  /**
   * Gets an industry name with locale-specific fallback.
   * Uses buzzNoun if available in the locale, otherwise falls back to generic industries.
   *
   * @private
   * @returns {string} An industry name
   * @example
   * ```typescript
   * const industry = this.getIndustry();
   * // Returns: 'Technology', 'Finance', 'Manufacturing', etc.
   * ```
   */
  private getIndustry(): string {
    try {
      return this.faker.company.buzzNoun();
    } catch {
      // Fallback to generic industries for locales without buzzNoun
      const industries = [
        'Technology',
        'Manufacturing',
        'Retail',
        'Healthcare',
        'Finance',
        'Education',
        'Consulting',
        'Real Estate',
        'Transportation',
        'Hospitality',
      ];
      return this.faker.helpers.arrayElement(industries);
    }
  }

  /**
   * Generates a single company record with complete business information.
   *
   * @param {CompanyGenerationOptions} [options={}] - Options controlling which fields to include
   * @returns {CompanyData} A company data object
   * @example
   * ```typescript
   * const company = generator.generate({
   *   includeAddress: true,
   *   includeWebsite: true,
   *   includeFoundedYear: true,
   *   includeEmployeeCount: true
   * });
   * // Returns: {
   * //   id: 'company_12345_0',
   * //   name: 'Acme Corporation',
   * //   industry: 'Technology',
   * //   email: 'acme@contact.com',
   * //   phone: '+1-555-987-6543',
   * //   website: 'https://acme.com',
   * //   founded: 1995,
   * //   employeeCount: 150,
   * //   address: { ... }
   * // }
   * ```
   */
  public generate(options: CompanyGenerationOptions = {}): CompanyData {
    const {
      includeAddress = true,
      includePhone = true,
      includeWebsite = true,
      includeFoundedYear = false,
      includeEmployeeCount = false,
    } = options;

    const companyName = this.faker.company.name();

    const company: CompanyData = {
      id: this.generateId('company', 0),
      name: companyName,
      industry: this.getIndustry(),
      email: this.faker.internet
        .email({
          firstName: companyName.split(' ')[0]?.toLowerCase() ?? 'info',
          lastName: 'contact',
        })
        .toLowerCase(),
    };

    if (includePhone) {
      company.phone = this.faker.phone.number();
    }

    if (includeWebsite) {
      company.website = this.faker.internet.url();
    }

    if (includeFoundedYear) {
      company.founded = this.faker.date
        .between({ from: '1900-01-01', to: new Date() })
        .getFullYear();
    }

    if (includeEmployeeCount) {
      // Generate employee count weighted towards smaller companies
      const weights = [0.5, 0.3, 0.15, 0.05]; // 50% small, 30% medium, 15% large, 5% enterprise
      const ranges = [
        { min: 1, max: 50 },
        { min: 51, max: 500 },
        { min: 501, max: 5000 },
        { min: 5001, max: 50000 },
      ];

      const rand = Math.random();
      let cumulative = 0;
      let range = ranges[0] ?? { min: 1, max: 50 };

      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i] ?? 0;
        if (rand < cumulative) {
          range = ranges[i] ?? { min: 1, max: 50 };
          break;
        }
      }

      company.employeeCount = this.faker.number.int({ min: range.min, max: range.max });
    }

    if (includeAddress) {
      company.address = {
        street: this.faker.location.streetAddress(),
        city: this.faker.location.city(),
        state: this.faker.location.state(),
        postalCode: this.faker.location.zipCode(),
        country: this.faker.location.country(),
      };
    }

    return company;
  }

  /**
   * Generates multiple company records efficiently.
   * Uses batch processing for large datasets to optimize memory usage.
   * Employee counts are weighted toward smaller companies (realistic distribution).
   *
   * @param {number} count - Number of company records to generate
   * @param {CompanyGenerationOptions} [options={}] - Options controlling which fields to include
   * @returns {CompanyData[]} Array of company data objects
   * @example
   * ```typescript
   * const companies = generator.generateMany(100, {
   *   includeAddress: true,
   *   includeWebsite: true,
   *   includeFoundedYear: true,
   *   includeEmployeeCount: true
   * });
   * console.log(`Generated ${companies.length} companies`);
   * ```
   */
  public generateMany(count: number, options: CompanyGenerationOptions = {}): CompanyData[] {
    return this.batchGenerate(count, (index) => {
      const {
        includeAddress = true,
        includePhone = true,
        includeWebsite = true,
        includeFoundedYear = false,
        includeEmployeeCount = false,
      } = options;

      const companyName = this.faker.company.name();

      const company: CompanyData = {
        id: this.generateId('company', index),
        name: companyName,
        industry: this.getIndustry(),
        email: this.faker.internet
          .email({
            firstName: companyName.split(' ')[0]?.toLowerCase() ?? 'info',
            lastName: 'contact',
          })
          .toLowerCase(),
      };

      if (includePhone) {
        company.phone = this.faker.phone.number();
      }

      if (includeWebsite) {
        company.website = this.faker.internet.url();
      }

      if (includeFoundedYear) {
        company.founded = this.faker.date
          .between({ from: '1900-01-01', to: new Date() })
          .getFullYear();
      }

      if (includeEmployeeCount) {
        const weights = [0.5, 0.3, 0.15, 0.05];
        const ranges = [
          { min: 1, max: 50 },
          { min: 51, max: 500 },
          { min: 501, max: 5000 },
          { min: 5001, max: 50000 },
        ];

        const rand = Math.random();
        let cumulative = 0;
        let range = ranges[0] ?? { min: 1, max: 50 };

        for (let i = 0; i < weights.length; i++) {
          cumulative += weights[i] ?? 0;
          if (rand < cumulative) {
            range = ranges[i] ?? { min: 1, max: 50 };
            break;
          }
        }

        company.employeeCount = this.faker.number.int({ min: range.min, max: range.max });
      }

      if (includeAddress) {
        company.address = {
          street: this.faker.location.streetAddress(),
          city: this.faker.location.city(),
          state: this.faker.location.state(),
          postalCode: this.faker.location.zipCode(),
          country: this.faker.location.country(),
        };
      }

      return company;
    });
  }
}
