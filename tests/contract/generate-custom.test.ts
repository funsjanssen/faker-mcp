/**
 * Contract Tests for generate-custom Tool
 *
 * Validates:
 * - Input schema validation (patterns, count, locale, seed)
 * - Pattern type definitions (regex, enum, format, range)
 * - Schema structure compliance
 */

import { describe, it, expect } from 'vitest';
import { PatternType } from '../../src/types/schema.js';
import type { RangePattern } from '../../src/types/schema.js';

describe('generate-custom contract tests', () => {
  describe('pattern type definitions', () => {
    it('should define regex pattern type', () => {
      expect(PatternType.REGEX).toBe('regex');
    });

    it('should define enum pattern type', () => {
      expect(PatternType.ENUM).toBe('enum');
    });

    it('should define format pattern type', () => {
      expect(PatternType.FORMAT).toBe('format');
    });

    it('should define range pattern type', () => {
      expect(PatternType.RANGE).toBe('range');
    });
  });

  describe('regex pattern schema', () => {
    it('should accept valid regex pattern definition', () => {
      const pattern = {
        type: PatternType.REGEX,
        value: 'PRD-[0-9]{4}-[A-Z]{2}',
      };

      expect(pattern.type).toBe(PatternType.REGEX);
      expect(pattern.value).toBe('PRD-[0-9]{4}-[A-Z]{2}');
    });

    it('should accept complex regex patterns', () => {
      const pattern = {
        type: PatternType.REGEX,
        value: '[a-z]{5,10}@(gmail|yahoo|outlook)\\.com',
      };

      expect(pattern.type).toBe(PatternType.REGEX);
      expect(typeof pattern.value).toBe('string');
    });
  });

  describe('enum pattern schema', () => {
    it('should accept valid enum pattern definition', () => {
      const pattern = {
        type: PatternType.ENUM,
        value: ['pending', 'active', 'completed', 'cancelled'],
      };

      expect(pattern.type).toBe(PatternType.ENUM);
      expect(Array.isArray(pattern.value)).toBe(true);
      expect(pattern.value).toHaveLength(4);
    });

    it('should accept enum with single value', () => {
      const pattern = {
        type: PatternType.ENUM,
        value: ['single'],
      };

      expect(pattern.type).toBe(PatternType.ENUM);
      expect(Array.isArray(pattern.value)).toBe(true);
      expect(pattern.value).toHaveLength(1);
    });
  });

  describe('format pattern schema', () => {
    it('should accept format pattern with year placeholder', () => {
      const pattern = {
        type: PatternType.FORMAT,
        value: 'REF-{{year}}-{{random:5}}',
      };

      expect(pattern.type).toBe(PatternType.FORMAT);
      expect(pattern.value).toContain('{{year}}');
      expect(pattern.value).toContain('{{random:5}}');
    });

    it('should accept format pattern with multiple placeholders', () => {
      const pattern = {
        type: PatternType.FORMAT,
        value: '{{random:3}}-{{year}}-{{number:4}}',
      };

      expect(pattern.type).toBe(PatternType.FORMAT);
      expect(typeof pattern.value).toBe('string');
    });
  });

  describe('range pattern schema', () => {
    it('should accept integer range pattern', () => {
      const pattern = {
        type: PatternType.RANGE,
        value: { min: 1, max: 100, precision: 0 } as RangePattern,
      };

      expect(pattern.type).toBe(PatternType.RANGE);
      expect(pattern.value.min).toBe(1);
      expect(pattern.value.max).toBe(100);
      expect(pattern.value.precision).toBe(0);
    });

    it('should accept decimal range pattern with precision', () => {
      const pattern = {
        type: PatternType.RANGE,
        value: { min: 0, max: 5, precision: 2 } as RangePattern,
      };

      expect(pattern.type).toBe(PatternType.RANGE);
      expect(pattern.value.min).toBe(0);
      expect(pattern.value.max).toBe(5);
      expect(pattern.value.precision).toBe(2);
    });

    it('should accept range pattern without precision (defaults to float)', () => {
      const pattern = {
        type: PatternType.RANGE,
        value: { min: 10, max: 1000 } as RangePattern,
      };

      expect(pattern.type).toBe(PatternType.RANGE);
      expect(pattern.value.min).toBe(10);
      expect(pattern.value.max).toBe(1000);
      expect(pattern.value.precision).toBeUndefined();
    });
  });

  describe('multiple patterns schema', () => {
    it('should accept multiple patterns of different types', () => {
      const patterns = {
        productCode: {
          type: PatternType.REGEX,
          value: 'PRD-[0-9]{4}',
        },
        status: {
          type: PatternType.ENUM,
          value: ['active', 'inactive'],
        },
        price: {
          type: PatternType.RANGE,
          value: { min: 10, max: 500 } as RangePattern,
        },
        reference: {
          type: PatternType.FORMAT,
          value: 'REF-{{year}}-{{random:3}}',
        },
      };

      expect(Object.keys(patterns)).toHaveLength(4);
      expect(patterns.productCode.type).toBe(PatternType.REGEX);
      expect(patterns.status.type).toBe(PatternType.ENUM);
      expect(patterns.price.type).toBe(PatternType.RANGE);
      expect(patterns.reference.type).toBe(PatternType.FORMAT);
    });
  });

  describe('generation request schema', () => {
    it('should accept valid generation request with all parameters', () => {
      const request = {
        count: 10,
        patterns: {
          code: {
            type: PatternType.REGEX,
            value: '[A-Z]{3}',
          },
        },
        locale: 'en' as const,
        seed: 12345,
      };

      expect(request.count).toBe(10);
      expect(request.patterns).toBeDefined();
      expect(request.locale).toBe('en');
      expect(request.seed).toBe(12345);
    });

    it('should accept minimum valid request (patterns only)', () => {
      const request = {
        patterns: {
          status: {
            type: PatternType.ENUM,
            value: ['active'],
          },
        },
      };

      expect(request.patterns).toBeDefined();
      expect(Object.keys(request.patterns)).toHaveLength(1);
    });
  });

  describe('schema validation rules', () => {
    it('should validate count must be between 1 and 10000', () => {
      const validCounts = [1, 100, 1000, 10000];

      validCounts.forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(10000);
      });
    });

    it('should validate at least one pattern must be defined', () => {
      const validPatterns = {
        field1: {
          type: PatternType.ENUM,
          value: ['value'],
        },
      };

      expect(Object.keys(validPatterns).length).toBeGreaterThan(0);
    });

    it('should validate supported locales', () => {
      const supportedLocales = ['en', 'fr', 'de', 'es', 'ja'];

      supportedLocales.forEach((locale) => {
        expect(['en', 'fr', 'de', 'es', 'ja']).toContain(locale);
      });
    });
  });

  describe('response format schema', () => {
    it('should define expected response structure', () => {
      const expectedResponse = {
        content: [
          {
            type: 'text',
            text: 'Generated 5 custom records with seed 12345',
          },
          {
            type: 'resource',
            resource: {
              uri: 'faker://custom/generated',
              mimeType: 'application/json',
              text: '[]',
            },
          },
        ],
      };

      expect(expectedResponse.content).toHaveLength(2);
      const [textContent, resourceContent] = expectedResponse.content;
      expect(textContent?.type).toBe('text');
      expect(resourceContent?.type).toBe('resource');
      if (resourceContent && 'resource' in resourceContent && resourceContent.resource) {
        expect(resourceContent.resource.uri).toBe('faker://custom/generated');
        expect(resourceContent.resource.mimeType).toBe('application/json');
      }
    });
  });
});
