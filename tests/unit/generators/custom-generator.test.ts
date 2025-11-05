/**
 * Unit tests for CustomGenerator
 *
 * Tests:
 * - Regex pattern generation
 * - Enum value selection
 * - Format template expansion
 * - Range value generation (integer and decimal)
 * - Seed reproducibility
 * - Error handling
 */

import { describe, it, expect } from 'vitest';
import { CustomGenerator } from '../../../src/generators/custom-generator.js';
import { PatternType, SupportedLocale } from '../../../src/types/schema.js';

describe('CustomGenerator', () => {
  describe('initialization', () => {
    it('should create generator with default options', () => {
      const generator = new CustomGenerator();

      expect(generator).toBeDefined();
      expect(generator.getSeed()).toBeGreaterThan(0);
      expect(generator.getLocale()).toBe(SupportedLocale.EN);
    });

    it('should create generator with custom seed', () => {
      const seed = 12345;
      const generator = new CustomGenerator({ seed });

      expect(generator.getSeed()).toBe(seed);
    });

    it('should create generator with custom locale', () => {
      const locale = SupportedLocale.FR;
      const generator = new CustomGenerator({ locale });

      expect(generator.getLocale()).toBe(locale);
    });
  });

  describe('regex pattern generation', () => {
    it('should generate data matching regex pattern', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        productCode: {
          type: PatternType.REGEX,
          value: 'PRD-[0-9]{4}',
        },
      };

      const data = generator.generate({ patterns: pattern });

      expect(data.productCode).toMatch(/^PRD-\d{4}$/);
    });

    it('should generate data matching complex regex pattern', () => {
      const generator = new CustomGenerator({ seed: 54321 });
      const pattern = {
        email: {
          type: PatternType.REGEX,
          value: '[a-z]{5}@(gmail|yahoo)\\.com',
        },
      };

      const data = generator.generate({ patterns: pattern });

      expect(data.email).toMatch(/^[a-z]{5}@(gmail|yahoo)\.com$/);
    });

    it('should generate multiple records with regex patterns', () => {
      const generator = new CustomGenerator({ seed: 99999 });
      const pattern = {
        code: {
          type: PatternType.REGEX,
          value: '[A-Z]{3}-[0-9]{3}',
        },
      };

      const data = generator.generateMany(10, { patterns: pattern });

      expect(data).toHaveLength(10);
      data.forEach((record) => {
        expect(record.code).toMatch(/^[A-Z]{3}-\d{3}$/);
      });
    });

    it('should throw error for invalid regex pattern', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        invalid: {
          type: PatternType.REGEX,
          value: '[invalid(',
        },
      };

      expect(() => generator.generate({ patterns: pattern })).toThrow();
    });
  });

  describe('enum pattern generation', () => {
    it('should generate value from enum list', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        status: {
          type: PatternType.ENUM,
          value: ['pending', 'active', 'completed'],
        },
      };

      const data = generator.generate({ patterns: pattern });

      expect(['pending', 'active', 'completed']).toContain(data.status);
    });

    it('should generate multiple records with enum values', () => {
      const generator = new CustomGenerator({ seed: 11111 });
      const pattern = {
        category: {
          type: PatternType.ENUM,
          value: ['A', 'B', 'C', 'D'],
        },
      };

      const data = generator.generateMany(20, { patterns: pattern });

      expect(data).toHaveLength(20);
      data.forEach((record) => {
        expect(['A', 'B', 'C', 'D']).toContain(record.category);
      });
    });

    it('should handle enum with single value', () => {
      const generator = new CustomGenerator({ seed: 22222 });
      const pattern = {
        constant: {
          type: PatternType.ENUM,
          value: ['only-value'],
        },
      };

      const data = generator.generate({ patterns: pattern });

      expect(data.constant).toBe('only-value');
    });

    it('should throw error for empty enum array', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        empty: {
          type: PatternType.ENUM,
          value: [],
        },
      };

      expect(() => generator.generate({ patterns: pattern })).toThrow();
    });
  });

  describe('format pattern generation', () => {
    it('should replace {{year}} placeholder with current year', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        reference: {
          type: PatternType.FORMAT,
          value: 'REF-{{year}}',
        },
      };

      const data = generator.generate({ patterns: pattern });
      const currentYear = new Date().getFullYear().toString();

      expect(data.reference).toBe(`REF-${currentYear}`);
    });

    it('should replace {{random:N}} placeholder with N alphanumeric characters', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        code: {
          type: PatternType.FORMAT,
          value: '{{random:5}}',
        },
      };

      const data = generator.generate({ patterns: pattern });

      expect(typeof data.code).toBe('string');
      expect(data.code).toHaveLength(5);
      expect(data.code).toMatch(/^[A-Za-z0-9]{5}$/);
    });

    it('should replace {{number:N}} placeholder with N digits', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        id: {
          type: PatternType.FORMAT,
          value: 'ID-{{number:6}}',
        },
      };

      const data = generator.generate({ patterns: pattern });

      expect(typeof data.id).toBe('string');
      expect(data.id).toMatch(/^ID-\d{6}$/);
    });

    it('should handle multiple placeholders in format', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        compound: {
          type: PatternType.FORMAT,
          value: '{{year}}-{{random:3}}-{{number:4}}',
        },
      };

      const data = generator.generate({ patterns: pattern });
      const currentYear = new Date().getFullYear().toString();

      expect(typeof data.compound).toBe('string');
      expect(data.compound).toContain(currentYear);
      expect(data.compound).toMatch(/^\d{4}-[A-Za-z0-9]{3}-\d{4}$/);
    });

    it('should generate consistent format with same seed', () => {
      const generator1 = new CustomGenerator({ seed: 99999 });
      const generator2 = new CustomGenerator({ seed: 99999 });
      const pattern = {
        code: {
          type: PatternType.FORMAT,
          value: '{{random:10}}',
        },
      };

      const data1 = generator1.generate({ patterns: pattern });
      const data2 = generator2.generate({ patterns: pattern });

      expect(data1.code).toBe(data2.code);
    });
  });

  describe('range pattern generation', () => {
    it('should generate integer within range (precision: 0)', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        quantity: {
          type: PatternType.RANGE,
          value: { min: 1, max: 100, precision: 0 },
        },
      };

      const data = generator.generateMany(50, { patterns: pattern });

      expect(data).toHaveLength(50);
      data.forEach((record) => {
        expect(typeof record.quantity).toBe('number');
        expect(Number.isInteger(record.quantity)).toBe(true);
        expect(record.quantity).toBeGreaterThanOrEqual(1);
        expect(record.quantity).toBeLessThanOrEqual(100);
      });
    });

    it('should generate decimal with precision', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        rating: {
          type: PatternType.RANGE,
          value: { min: 0, max: 5, precision: 1 },
        },
      };

      const data = generator.generateMany(20, { patterns: pattern });

      expect(data).toHaveLength(20);
      data.forEach((record) => {
        expect(typeof record.rating).toBe('number');
        expect(record.rating).toBeGreaterThanOrEqual(0);
        expect(record.rating).toBeLessThanOrEqual(5);
        // Check precision (1 decimal place)
        const decimalPart = (record.rating.toString().split('.')[1] || '').length;
        expect(decimalPart).toBeLessThanOrEqual(1);
      });
    });

    it('should generate float without specified precision', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        price: {
          type: PatternType.RANGE,
          value: { min: 10, max: 1000 },
        },
      };

      const data = generator.generateMany(30, { patterns: pattern });

      expect(data).toHaveLength(30);
      data.forEach((record) => {
        expect(typeof record.price).toBe('number');
        expect(record.price).toBeGreaterThanOrEqual(10);
        expect(record.price).toBeLessThanOrEqual(1000);
      });
    });

    it('should handle edge case where min equals max', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        constant: {
          type: PatternType.RANGE,
          value: { min: 42, max: 42, precision: 0 },
        },
      };

      const data = generator.generate({ patterns: pattern });

      expect(data.constant).toBe(42);
    });

    it('should throw error when min > max', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const pattern = {
        invalid: {
          type: PatternType.RANGE,
          value: { min: 100, max: 10 },
        },
      };

      expect(() => generator.generate({ patterns: pattern })).toThrow();
    });
  });

  describe('multiple patterns', () => {
    it('should generate data with multiple different pattern types', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const patterns = {
        productCode: {
          type: PatternType.REGEX,
          value: 'PRD-[0-9]{4}',
        },
        status: {
          type: PatternType.ENUM,
          value: ['active', 'inactive', 'pending'],
        },
        price: {
          type: PatternType.RANGE,
          value: { min: 10, max: 500, precision: 2 },
        },
        reference: {
          type: PatternType.FORMAT,
          value: 'REF-{{year}}-{{random:3}}',
        },
      };

      const data = generator.generate({ patterns });

      expect(data.productCode).toMatch(/^PRD-\d{4}$/);
      expect(['active', 'inactive', 'pending']).toContain(data.status);
      expect(typeof data.price).toBe('number');
      expect(data.price).toBeGreaterThanOrEqual(10);
      expect(data.price).toBeLessThanOrEqual(500);
      expect(typeof data.reference).toBe('string');
      expect(data.reference).toContain('REF-');
    });

    it('should generate multiple records with multiple patterns', () => {
      const generator = new CustomGenerator({ seed: 99999 });
      const patterns = {
        code: {
          type: PatternType.REGEX,
          value: '[A-Z]{2}',
        },
        value: {
          type: PatternType.RANGE,
          value: { min: 1, max: 10, precision: 0 },
        },
      };

      const data = generator.generateMany(5, { patterns });

      expect(data).toHaveLength(5);
      data.forEach((record) => {
        expect(record.code).toMatch(/^[A-Z]{2}$/);
        expect(Number.isInteger(record.value)).toBe(true);
        expect(record.value).toBeGreaterThanOrEqual(1);
        expect(record.value).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('seed reproducibility', () => {
    it('should generate identical data with same seed', () => {
      const seed = 12345;
      const patterns = {
        code: {
          type: PatternType.REGEX,
          value: '[A-Z]{5}',
        },
        status: {
          type: PatternType.ENUM,
          value: ['A', 'B', 'C', 'D'],
        },
        value: {
          type: PatternType.RANGE,
          value: { min: 1, max: 100 },
        },
      };

      const generator1 = new CustomGenerator({ seed });
      const data1 = generator1.generateMany(10, { patterns });

      const generator2 = new CustomGenerator({ seed });
      const data2 = generator2.generateMany(10, { patterns });

      expect(data1).toEqual(data2);
    });

    it('should generate different data with different seeds', () => {
      const patterns = {
        value: {
          type: PatternType.REGEX,
          value: '[A-Z]{10}',
        },
      };

      const generator1 = new CustomGenerator({ seed: 11111 });
      const data1 = generator1.generateMany(5, { patterns });

      const generator2 = new CustomGenerator({ seed: 22222 });
      const data2 = generator2.generateMany(5, { patterns });

      expect(data1).not.toEqual(data2);
    });
  });

  describe('ID generation', () => {
    it('should generate unique IDs for each record', () => {
      const generator = new CustomGenerator({ seed: 12345 });
      const patterns = {
        value: {
          type: PatternType.ENUM,
          value: ['test'],
        },
      };

      const data = generator.generateMany(5, { patterns });

      const ids = data.map((record) => record.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
      expect(ids[0]).toBe('custom_12345_0');
      expect(ids[1]).toBe('custom_12345_1');
      expect(ids[4]).toBe('custom_12345_4');
    });
  });
});
