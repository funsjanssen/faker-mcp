import { describe, it, expect } from 'vitest';
import { PersonGenerator } from '../../../src/generators/person-generator';
import { SupportedLocale } from '../../../src/types/schema.js';
import { assertions } from '../../helpers/test-utils';

describe('PersonGenerator', () => {
  describe('Basic Generation', () => {
    it('should generate person with all required fields', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const person = generator.generate();

      expect(person).toHaveProperty('id');
      expect(person).toHaveProperty('firstName');
      expect(person).toHaveProperty('lastName');
      expect(person).toHaveProperty('fullName');
      expect(person).toHaveProperty('email');

      assertions.toBeNonEmptyString(person.id);
      assertions.toBeNonEmptyString(person.firstName);
      assertions.toBeNonEmptyString(person.lastName);
      assertions.toBeNonEmptyString(person.fullName);
      assertions.toBeValidEmail(person.email);
    });

    it('should generate unique IDs for multiple persons', () => {
      const generator = new PersonGenerator({ seed: 456 });
      const persons = generator.generateMany(10);

      assertions.toHaveUniqueIds(persons);
    });

    it('should generate consistent data with same seed', () => {
      const gen1 = new PersonGenerator({ seed: 789 });
      const gen2 = new PersonGenerator({ seed: 789 });

      const person1 = gen1.generate();
      const person2 = gen2.generate();

      expect(person1).toEqual(person2);
    });

    it('should generate different data with different seeds', () => {
      const gen1 = new PersonGenerator({ seed: 111 });
      const gen2 = new PersonGenerator({ seed: 222 });

      const person1 = gen1.generate();
      const person2 = gen2.generate();

      expect(person1.email).not.toBe(person2.email);
      expect(person1.firstName).not.toBe(person2.firstName);
    });
  });

  describe('Optional Fields', () => {
    it('should include address when requested', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const person = generator.generate({ includeAddress: true });

      expect(person.address).toBeDefined();
      expect(person.address).toHaveProperty('street');
      expect(person.address).toHaveProperty('city');
      expect(person.address).toHaveProperty('state');
      expect(person.address).toHaveProperty('postalCode');
      expect(person.address).toHaveProperty('country');
    });

    it('should exclude address when not requested', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const person = generator.generate({ includeAddress: false });

      expect(person.address).toBeUndefined();
    });

    it('should include phone when requested', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const person = generator.generate({ includePhone: true });

      expect(person.phone).toBeDefined();
      assertions.toBeNonEmptyString(person.phone as string);
    });

    it('should exclude phone when not requested', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const person = generator.generate({ includePhone: false });

      expect(person.phone).toBeUndefined();
    });

    it('should include date of birth when requested', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const person = generator.generate({ includeDateOfBirth: true });

      expect(person.dateOfBirth).toBeDefined();
      // Should be a valid ISO date string
      expect(() => new Date(person.dateOfBirth as string)).not.toThrow();
    });

    it('should exclude date of birth when not requested', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const person = generator.generate({ includeDateOfBirth: false });

      expect(person.dateOfBirth).toBeUndefined();
    });
  });

  describe('Locale Handling', () => {
    it('should generate data in English locale', () => {
      const generator = new PersonGenerator({ seed: 123, locale: SupportedLocale.EN });
      const person = generator.generate();

      expect(generator.getLocale()).toBe(SupportedLocale.EN);
      assertions.toBeNonEmptyString(person.fullName);
    });

    it('should generate data in French locale', () => {
      const generator = new PersonGenerator({ seed: 123, locale: SupportedLocale.FR });
      const person = generator.generate();

      expect(generator.getLocale()).toBe(SupportedLocale.FR);
      assertions.toBeNonEmptyString(person.fullName);
    });

    it('should generate data in German locale', () => {
      const generator = new PersonGenerator({ seed: 123, locale: SupportedLocale.DE });
      const person = generator.generate();

      expect(generator.getLocale()).toBe(SupportedLocale.DE);
      assertions.toBeNonEmptyString(person.fullName);
    });

    it('should throw error for unsupported locale', () => {
      expect(() => {
        new PersonGenerator({ seed: 123, locale: 'invalid' as SupportedLocale });
      }).toThrow('Unsupported locale');
    });
  });

  describe('Batch Generation', () => {
    it('should generate correct number of records', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const persons = generator.generateMany(50);

      expect(persons).toHaveLength(50);
    });

    it('should handle large batches efficiently', () => {
      const generator = new PersonGenerator({ seed: 123 });
      const startTime = Date.now();
      const persons = generator.generateMany(1000);
      const duration = Date.now() - startTime;

      expect(persons).toHaveLength(1000);
      assertions.toHaveUniqueIds(persons);
      // Should complete in reasonable time (< 2 seconds for 1000 records)
      expect(duration).toBeLessThan(2000);
    });

    it('should maintain seed consistency in batch generation', () => {
      const gen1 = new PersonGenerator({ seed: 999 });
      const gen2 = new PersonGenerator({ seed: 999 });

      const batch1 = gen1.generateMany(10);
      const batch2 = gen2.generateMany(10);

      expect(batch1).toEqual(batch2);
    });
  });

  describe('Seed Management', () => {
    it('should accept numeric seed', () => {
      const generator = new PersonGenerator({ seed: 12345 });
      expect(generator.getSeed()).toBe(12345);
    });

    it('should handle seed string', () => {
      const generator = new PersonGenerator({ seedString: 'test-seed' });
      const seed = generator.getSeed();

      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThan(0);

      // Same string should produce same seed
      const generator2 = new PersonGenerator({ seedString: 'test-seed' });
      expect(generator2.getSeed()).toBe(seed);
    });

    it('should auto-generate seed if none provided', () => {
      const generator = new PersonGenerator();
      const seed = generator.getSeed();

      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThan(0);
    });
  });
});
