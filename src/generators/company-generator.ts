import { BaseGenerator, BaseGeneratorOptions } from './base-generator.js';
import { CompanyData } from '../types/responses.js';

/**
 * Options for company generation
 */
export interface CompanyGenerationOptions {
  includeAddress?: boolean;
  includePhone?: boolean;
  includeWebsite?: boolean;
  includeFoundedYear?: boolean;
  includeEmployeeCount?: boolean;
}

/**
 * Generator for company data
 */
export class CompanyGenerator extends BaseGenerator {
  constructor(options: BaseGeneratorOptions = {}) {
    super(options);
  }

  /**
   * Get industry name - with fallback for locales that don't support buzzNoun
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
   * Generate a single company record
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
   * Generate multiple company records
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
