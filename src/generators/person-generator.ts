import { BaseGenerator, BaseGeneratorOptions } from './base-generator.js';
import { PersonData } from '../types/responses.js';

/**
 * Options for controlling person data generation.
 *
 * @interface PersonGenerationOptions
 * @example
 * ```typescript
 * const options: PersonGenerationOptions = {
 *   includeAddress: true,
 *   includePhone: true,
 *   includeDateOfBirth: false
 * };
 * ```
 */
export interface PersonGenerationOptions {
  /** Whether to include address information (defaults to true) */
  includeAddress?: boolean;
  /** Whether to include phone number (defaults to true) */
  includePhone?: boolean;
  /** Whether to include date of birth (defaults to false) */
  includeDateOfBirth?: boolean;
}

/**
 * Generator for realistic person data.
 * Generates person records with names, emails, phone numbers, addresses, and dates of birth.
 * Supports multiple locales and reproducible generation via seeds.
 *
 * @class PersonGenerator
 * @extends BaseGenerator
 * @example
 * ```typescript
 * const generator = new PersonGenerator({
 *   locale: SupportedLocale.EN,
 *   seed: 12345
 * });
 *
 * // Generate a single person
 * const person = generator.generate({
 *   includeAddress: true,
 *   includePhone: true
 * });
 *
 * // Generate multiple persons
 * const persons = generator.generateMany(100, {
 *   includeDateOfBirth: true
 * });
 * ```
 */
export class PersonGenerator extends BaseGenerator {
  /**
   * Creates a new PersonGenerator instance.
   *
   * @constructor
   * @param {BaseGeneratorOptions} [options={}] - Generator configuration options
   * @example
   * ```typescript
   * const generator = new PersonGenerator({
   *   locale: SupportedLocale.FR,
   *   seed: 12345
   * });
   * ```
   */
  constructor(options: BaseGeneratorOptions = {}) {
    super(options);
  }

  /**
   * Generates a single person record with complete personal information.
   *
   * @param {PersonGenerationOptions} [options={}] - Options controlling which fields to include
   * @returns {PersonData} A person data object
   * @example
   * ```typescript
   * const person = generator.generate({
   *   includeAddress: true,
   *   includePhone: true,
   *   includeDateOfBirth: false
   * });
   * // Returns: {
   * //   id: 'person_12345_0',
   * //   firstName: 'John',
   * //   lastName: 'Doe',
   * //   fullName: 'John Doe',
   * //   email: 'john.doe@example.com',
   * //   phone: '+1-555-123-4567',
   * //   address: { ... }
   * // }
   * ```
   */
  public generate(options: PersonGenerationOptions = {}): PersonData {
    const { includeAddress = true, includePhone = true, includeDateOfBirth = false } = options;

    const firstName = this.faker.person.firstName();
    const lastName = this.faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    const person: PersonData = {
      id: this.generateId('person', 0),
      firstName,
      lastName,
      fullName,
      email: this.faker.internet.email({ firstName, lastName }).toLowerCase(),
    };

    if (includePhone) {
      person.phone = this.faker.phone.number();
    }

    if (includeDateOfBirth) {
      person.dateOfBirth = this.faker.date
        .birthdate({ min: 18, max: 100, mode: 'age' })
        .toISOString()
        .split('T')[0]; // YYYY-MM-DD format
    }

    if (includeAddress) {
      person.address = {
        street: this.faker.location.streetAddress(),
        city: this.faker.location.city(),
        state: this.faker.location.state(),
        postalCode: this.faker.location.zipCode(),
        country: this.faker.location.country(),
      };
    }

    return person;
  }

  /**
   * Generates multiple person records efficiently.
   * Uses batch processing for large datasets to optimize memory usage.
   *
   * @param {number} count - Number of person records to generate
   * @param {PersonGenerationOptions} [options={}] - Options controlling which fields to include
   * @returns {PersonData[]} Array of person data objects
   * @example
   * ```typescript
   * const persons = generator.generateMany(1000, {
   *   includeAddress: true,
   *   includePhone: true,
   *   includeDateOfBirth: true
   * });
   * console.log(`Generated ${persons.length} persons`);
   * ```
   */
  public generateMany(count: number, options: PersonGenerationOptions = {}): PersonData[] {
    return this.batchGenerate(count, (index) => {
      const { includeAddress = true, includePhone = true, includeDateOfBirth = false } = options;

      const firstName = this.faker.person.firstName();
      const lastName = this.faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;

      const person: PersonData = {
        id: this.generateId('person', index),
        firstName,
        lastName,
        fullName,
        email: this.faker.internet.email({ firstName, lastName }).toLowerCase(),
      };

      if (includePhone) {
        person.phone = this.faker.phone.number();
      }

      if (includeDateOfBirth) {
        person.dateOfBirth = this.faker.date
          .birthdate({ min: 18, max: 100, mode: 'age' })
          .toISOString()
          .split('T')[0];
      }

      if (includeAddress) {
        person.address = {
          street: this.faker.location.streetAddress(),
          city: this.faker.location.city(),
          state: this.faker.location.state(),
          postalCode: this.faker.location.zipCode(),
          country: this.faker.location.country(),
        };
      }

      return person;
    });
  }
}
