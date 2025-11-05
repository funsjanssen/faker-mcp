import { describe, it, expect } from 'vitest';
import { PersonGenerator } from '../../src/generators/person-generator.js';
import { CompanyGenerator } from '../../src/generators/company-generator.js';
import { DatasetGenerator } from '../../src/generators/dataset-generator.js';
import { EntityType, SupportedLocale } from '../../src/types/schema.js';

describe('Generation Performance Benchmarks', () => {
  describe('Person Generation Performance', () => {
    it('should generate 1000 person records in reasonable time', () => {
      const generator = new PersonGenerator({ locale: SupportedLocale.EN });
      const startTime = Date.now();

      const data = generator.generateMany(1000);

      const duration = Date.now() - startTime;

      expect(data).toHaveLength(1000);
      expect(duration).toBeLessThan(2000); // Should complete in < 2 seconds
      console.log(`✓ Generated 1000 person records in ${duration}ms`);
    });

    it('should generate 5000 person records in reasonable time', () => {
      const generator = new PersonGenerator({ locale: SupportedLocale.EN });
      const startTime = Date.now();

      const data = generator.generateMany(5000);

      const duration = Date.now() - startTime;

      expect(data).toHaveLength(5000);
      expect(duration).toBeLessThan(10000); // Should complete in < 10 seconds
      console.log(`✓ Generated 5000 person records in ${duration}ms`);
    });

    it('should generate 10000 person records in reasonable time', () => {
      const generator = new PersonGenerator({ locale: SupportedLocale.EN });
      const startTime = Date.now();

      const data = generator.generateMany(10000);

      const duration = Date.now() - startTime;

      expect(data).toHaveLength(10000);
      expect(duration).toBeLessThan(20000); // Should complete in < 20 seconds
      console.log(`✓ Generated 10000 person records in ${duration}ms`);
    });
  });

  describe('Company Generation Performance', () => {
    it('should generate 1000 company records in reasonable time', () => {
      const generator = new CompanyGenerator({ locale: SupportedLocale.EN });
      const startTime = Date.now();

      const data = generator.generateMany(1000);

      const duration = Date.now() - startTime;

      expect(data).toHaveLength(1000);
      expect(duration).toBeLessThan(2000); // Should complete in < 2 seconds
      console.log(`✓ Generated 1000 company records in ${duration}ms`);
    });

    it('should generate 5000 company records in reasonable time', () => {
      const generator = new CompanyGenerator({ locale: SupportedLocale.EN });
      const startTime = Date.now();

      const data = generator.generateMany(5000);

      const duration = Date.now() - startTime;

      expect(data).toHaveLength(5000);
      expect(duration).toBeLessThan(10000); // Should complete in < 10 seconds
      console.log(`✓ Generated 5000 company records in ${duration}ms`);
    });
  });

  describe('Dataset Generation Performance', () => {
    it('should generate dataset with 1000 total records in reasonable time', () => {
      const generator = new DatasetGenerator({ locale: SupportedLocale.EN });
      const startTime = Date.now();

      const result = generator.generateDataset({
        entities: {
          users: {
            count: 500,
            type: EntityType.PERSON,
          },
          orders: {
            count: 500,
            type: EntityType.CUSTOM,
            relationships: {
              userId: {
                references: 'users',
                type: 'one-to-many',
              },
            },
          },
        },
      });

      const duration = Date.now() - startTime;

      expect(result.dataset['users']).toHaveLength(500);
      expect(result.dataset['orders']).toHaveLength(500);
      expect(duration).toBeLessThan(3000); // Should complete in < 3 seconds
      console.log(`✓ Generated dataset with 1000 total records in ${duration}ms`);
    });

    it('should generate large dataset with 5000 total records in reasonable time', () => {
      const generator = new DatasetGenerator({ locale: SupportedLocale.EN });
      const startTime = Date.now();

      const result = generator.generateDataset({
        entities: {
          users: {
            count: 1000,
            type: EntityType.PERSON,
          },
          companies: {
            count: 1000,
            type: EntityType.COMPANY,
          },
          orders: {
            count: 3000,
            type: EntityType.CUSTOM,
            relationships: {
              userId: {
                references: 'users',
                type: 'one-to-many',
              },
              companyId: {
                references: 'companies',
                type: 'one-to-many',
              },
            },
          },
        },
      });

      const duration = Date.now() - startTime;

      expect(result.dataset['users']).toHaveLength(1000);
      expect(result.dataset['companies']).toHaveLength(1000);
      expect(result.dataset['orders']).toHaveLength(3000);
      expect(duration).toBeLessThan(15000); // Should complete in < 15 seconds
      console.log(`✓ Generated dataset with 5000 total records in ${duration}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('should not exceed reasonable memory usage for large generation', () => {
      const generator = new PersonGenerator({ locale: SupportedLocale.EN });

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memBefore = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      // Generate 10000 records
      const data = generator.generateMany(10000);

      const memAfter = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const memUsed = memAfter - memBefore;

      expect(data).toHaveLength(10000);
      expect(memUsed).toBeLessThan(100); // Should use < 100MB
      console.log(`✓ Generated 10000 records using ${memUsed.toFixed(2)}MB of memory`);
    });
  });

  describe('Throughput', () => {
    it('should achieve target throughput of >1000 records/second', () => {
      const generator = new PersonGenerator({ locale: SupportedLocale.EN });
      const recordCount = 2000;

      const startTime = Date.now();
      const data = generator.generateMany(recordCount);
      const duration = Date.now() - startTime;

      const throughput = (recordCount / duration) * 1000; // records per second

      expect(data).toHaveLength(recordCount);
      expect(throughput).toBeGreaterThan(1000);
      console.log(`✓ Achieved throughput of ${throughput.toFixed(0)} records/second`);
    });
  });
});
