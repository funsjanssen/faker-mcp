import { describe, it, expect } from 'vitest';
import { CompanyGenerator } from '../../../src/generators/company-generator';
import { SupportedLocale } from '../../../src/types/schema';
import { assertions } from '../../helpers/test-utils';

describe('CompanyGenerator', () => {
  describe('Basic Generation', () => {
    it('should generate company with all required fields', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate();

      expect(company).toHaveProperty('id');
      expect(company).toHaveProperty('name');
      expect(company).toHaveProperty('industry');
      expect(company).toHaveProperty('email');

      assertions.toBeNonEmptyString(company.id);
      assertions.toBeNonEmptyString(company.name);
      assertions.toBeNonEmptyString(company.industry);
      assertions.toBeValidEmail(company.email);
    });

    it('should generate unique IDs for multiple companies', () => {
      const generator = new CompanyGenerator({ seed: 456 });
      const companies = generator.generateMany(10);

      assertions.toHaveUniqueIds(companies);
    });

    it('should generate consistent data with same seed', () => {
      const gen1 = new CompanyGenerator({ seed: 789 });
      const gen2 = new CompanyGenerator({ seed: 789 });

      const company1 = gen1.generate();
      const company2 = gen2.generate();

      expect(company1).toEqual(company2);
    });

    it('should generate different data with different seeds', () => {
      const gen1 = new CompanyGenerator({ seed: 111 });
      const gen2 = new CompanyGenerator({ seed: 222 });

      const company1 = gen1.generate();
      const company2 = gen2.generate();

      expect(company1.email).not.toBe(company2.email);
      expect(company1.name).not.toBe(company2.name);
    });
  });

  describe('Optional Fields', () => {
    it('should include address when requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includeAddress: true });

      expect(company.address).toBeDefined();
      expect(company.address).toHaveProperty('street');
      expect(company.address).toHaveProperty('city');
      expect(company.address).toHaveProperty('state');
      expect(company.address).toHaveProperty('postalCode');
      expect(company.address).toHaveProperty('country');
    });

    it('should exclude address when not requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includeAddress: false });

      expect(company.address).toBeUndefined();
    });

    it('should include website when requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includeWebsite: true });

      expect(company.website).toBeDefined();
      assertions.toBeValidUrl(company.website as string);
    });

    it('should exclude website when not requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includeWebsite: false });

      expect(company.website).toBeUndefined();
    });

    it('should include phone when requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includePhone: true });

      expect(company.phone).toBeDefined();
      assertions.toBeNonEmptyString(company.phone as string);
    });

    it('should exclude phone when not requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includePhone: false });

      expect(company.phone).toBeUndefined();
    });

    it('should include founded year when requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includeFoundedYear: true });

      expect(company.founded).toBeDefined();
      expect(company.founded).toBeGreaterThanOrEqual(1900);
      expect(company.founded).toBeLessThanOrEqual(new Date().getFullYear());
    });

    it('should exclude founded year when not requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includeFoundedYear: false });

      expect(company.founded).toBeUndefined();
    });

    it('should include employee count when requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includeEmployeeCount: true });

      expect(company.employeeCount).toBeDefined();
      expect(company.employeeCount).toBeGreaterThan(0);
    });

    it('should exclude employee count when not requested', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const company = generator.generate({ includeEmployeeCount: false });

      expect(company.employeeCount).toBeUndefined();
    });
  });

  describe('Locale Handling', () => {
    it('should generate data in English locale', () => {
      const generator = new CompanyGenerator({ seed: 123, locale: SupportedLocale.EN });
      const company = generator.generate();

      expect(generator.getLocale()).toBe(SupportedLocale.EN);
      assertions.toBeNonEmptyString(company.name);
    });

    it('should generate data in French locale', () => {
      const generator = new CompanyGenerator({ seed: 123, locale: SupportedLocale.FR });
      const company = generator.generate();

      expect(generator.getLocale()).toBe(SupportedLocale.FR);
      assertions.toBeNonEmptyString(company.name);
    });

    it('should throw error for unsupported locale', () => {
      expect(() => {
        new CompanyGenerator({ seed: 123, locale: 'invalid' as SupportedLocale });
      }).toThrow('Unsupported locale');
    });
  });

  describe('Batch Generation', () => {
    it('should generate correct number of records', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const companies = generator.generateMany(50);

      expect(companies).toHaveLength(50);
    });

    it('should handle large batches efficiently', () => {
      const generator = new CompanyGenerator({ seed: 123 });
      const startTime = Date.now();
      const companies = generator.generateMany(1000);
      const duration = Date.now() - startTime;

      expect(companies).toHaveLength(1000);
      assertions.toHaveUniqueIds(companies);
      // Should complete in reasonable time (< 2 seconds for 1000 records)
      expect(duration).toBeLessThan(2000);
    });

    it('should maintain seed consistency in batch generation', () => {
      const gen1 = new CompanyGenerator({ seed: 999 });
      const gen2 = new CompanyGenerator({ seed: 999 });

      const batch1 = gen1.generateMany(10);
      const batch2 = gen2.generateMany(10);

      expect(batch1).toEqual(batch2);
    });
  });
});
