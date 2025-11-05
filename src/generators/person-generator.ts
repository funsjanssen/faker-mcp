import { BaseGenerator, BaseGeneratorOptions } from './base-generator.js';
import { PersonData } from '../types/responses.js';

/**
 * Options for person generation
 */
export interface PersonGenerationOptions {
  includeAddress?: boolean;
  includePhone?: boolean;
  includeDateOfBirth?: boolean;
}

/**
 * Generator for person data
 */
export class PersonGenerator extends BaseGenerator {
  constructor(options: BaseGeneratorOptions = {}) {
    super(options);
  }

  /**
   * Generate a single person record
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
   * Generate multiple person records
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
