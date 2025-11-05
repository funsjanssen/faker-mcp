import { BaseGenerator, BaseGeneratorOptions } from './base-generator.js';
import { PersonGenerator } from './person-generator.js';
import { CompanyGenerator } from './company-generator.js';
import { EntityType, type DatasetSchema } from '../types/schema.js';
import type { PersonData, CompanyData } from '../types/responses.js';
import type { Faker } from '@faker-js/faker';

/**
 * Represents a generated dataset with multiple entities
 */
export interface GeneratedDataset {
  dataset: Record<string, unknown[]>;
  metadata: {
    entityCounts: Record<string, number>;
    totalRecords: number;
    seed: number;
  };
}

/**
 * ID pool for tracking generated entity IDs
 */
class IDPool {
  private pools: Map<string, string[]> = new Map();
  private counters: Map<string, number> = new Map();

  /**
   * Generate and track a new entity ID
   */
  public generateEntityId(entityName: string): string {
    const counter = (this.counters.get(entityName) || 0) + 1;
    this.counters.set(entityName, counter);

    const id = `${entityName.toLowerCase()}_${counter}`;

    const pool = this.pools.get(entityName);
    if (!pool) {
      this.pools.set(entityName, [id]);
    } else {
      pool.push(id);
    }

    return id;
  }

  /**
   * Get all IDs for an entity
   */
  public getEntityIds(entityName: string): string[] {
    return this.pools.get(entityName) || [];
  }

  /**
   * Select a random foreign key value from the pool
   */
  public selectForeignKeyValue(
    entityName: string,
    faker: Faker,
    nullable: boolean = false
  ): string | null {
    const ids = this.getEntityIds(entityName);

    if (ids.length === 0) {
      throw new Error(`No IDs available for entity '${entityName}'`);
    }

    // Handle nullable relationships
    if (nullable && faker.datatype.boolean({ probability: 0.2 })) {
      return null;
    }

    // Select random ID from pool
    const selectedId = faker.helpers.arrayElement(ids);
    return selectedId;
  }

  /**
   * Track existing IDs
   */
  public trackEntityIds(entityName: string, ids: string[]): void {
    this.pools.set(entityName, ids);
    this.counters.set(entityName, ids.length);
  }
}

/**
 * Generator for structured datasets with multiple entities
 */
export class DatasetGenerator extends BaseGenerator {
  private personGenerator: PersonGenerator;
  private companyGenerator: CompanyGenerator;
  private idPool: IDPool;

  constructor(options: BaseGeneratorOptions = {}) {
    super(options);
    this.personGenerator = new PersonGenerator(options);
    this.companyGenerator = new CompanyGenerator(options);
    this.idPool = new IDPool();
  }

  /**
   * Generate a complete dataset based on schema
   */
  public generateDataset(schema: DatasetSchema): GeneratedDataset {
    const dataset: Record<string, unknown[]> = {};
    const entityCounts: Record<string, number> = {};

    // Sort entities by dependencies (topological sort)
    const sortedEntities = this.topologicalSort(schema);

    // Generate each entity in dependency order
    for (const entityName of sortedEntities) {
      const entityDef = schema.entities[entityName];
      if (!entityDef) continue;

      const entities = this.generateEntity(entityName, entityDef, schema);
      dataset[entityName] = entities;
      entityCounts[entityName] = entities.length;
    }

    const totalRecords = Object.values(entityCounts).reduce((sum, count) => sum + count, 0);

    return {
      dataset,
      metadata: {
        entityCounts,
        totalRecords,
        seed: this.getSeed(),
      },
    };
  }

  /**
   * Generate entities based on type and definition
   */
  private generateEntity(
    entityName: string,
    entityDef: DatasetSchema['entities'][string],
    schema: DatasetSchema
  ): unknown[] {
    const { count, type, fields, relationships } = entityDef;

    switch (type) {
      case EntityType.PERSON:
        return this.generatePersonEntities(entityName, count);

      case EntityType.COMPANY:
        return this.generateCompanyEntities(entityName, count);

      case EntityType.CUSTOM:
        return this.generateCustomEntities(entityName, count, fields || [], relationships, schema);

      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`Unknown entity type: ${String(exhaustiveCheck)}`);
      }
    }
  }

  /**
   * Generate person entities
   */
  private generatePersonEntities(entityName: string, count: number): PersonData[] {
    const entities = this.personGenerator.generateMany(count, {
      includeAddress: true,
      includePhone: true,
      includeDateOfBirth: false,
    });

    // Update IDs to match entity name
    const updatedEntities = entities.map((entity) => ({
      ...entity,
      id: this.idPool.generateEntityId(entityName),
    }));

    return updatedEntities;
  }

  /**
   * Generate company entities
   */
  private generateCompanyEntities(entityName: string, count: number): CompanyData[] {
    const entities = this.companyGenerator.generateMany(count, {
      includeAddress: true,
      includePhone: true,
      includeWebsite: true,
    });

    // Update IDs to match entity name
    const updatedEntities = entities.map((entity) => ({
      ...entity,
      id: this.idPool.generateEntityId(entityName),
    }));

    return updatedEntities;
  }

  /**
   * Generate custom entities with specified fields and relationships
   */
  private generateCustomEntities(
    entityName: string,
    count: number,
    fields: string[],
    relationships: DatasetSchema['entities'][string]['relationships'],
    _schema: DatasetSchema
  ): Record<string, unknown>[] {
    const entities: Record<string, unknown>[] = [];

    for (let i = 0; i < count; i++) {
      const entity: Record<string, unknown> = {};

      // Always include ID
      entity['id'] = this.idPool.generateEntityId(entityName);

      // Generate fields
      for (const field of fields) {
        // Check if field is a relationship
        const relationship = relationships?.[field];

        if (relationship) {
          // Generate foreign key
          entity[field] = this.idPool.selectForeignKeyValue(
            relationship.references,
            this.faker,
            relationship.nullable || false
          );
        } else {
          // Generate random field value based on field name
          entity[field] = this.generateFieldValue(field);
        }
      }

      entities.push(entity);
    }

    return entities;
  }

  /**
   * Generate a field value based on field name heuristics
   */
  private generateFieldValue(fieldName: string): unknown {
    const lowerFieldName = fieldName.toLowerCase();

    // ID fields (already handled separately)
    if (lowerFieldName === 'id' || lowerFieldName.endsWith('id')) {
      return this.faker.string.uuid();
    }

    // Name fields
    if (lowerFieldName.includes('name') || lowerFieldName === 'title') {
      return this.faker.commerce.productName();
    }

    // Email fields
    if (lowerFieldName.includes('email')) {
      return this.faker.internet.email().toLowerCase();
    }

    // Phone fields
    if (lowerFieldName.includes('phone') || lowerFieldName.includes('tel')) {
      return this.faker.phone.number();
    }

    // Price/amount fields
    if (
      lowerFieldName.includes('price') ||
      lowerFieldName.includes('amount') ||
      lowerFieldName.includes('cost')
    ) {
      return parseFloat(this.faker.commerce.price());
    }

    // Date fields
    if (lowerFieldName.includes('date') || lowerFieldName.includes('time')) {
      return this.faker.date.recent().toISOString();
    }

    // Status fields
    if (lowerFieldName.includes('status')) {
      return this.faker.helpers.arrayElement(['active', 'inactive', 'pending', 'completed']);
    }

    // Boolean fields
    if (
      lowerFieldName.includes('is') ||
      lowerFieldName.includes('has') ||
      lowerFieldName.includes('active')
    ) {
      return this.faker.datatype.boolean();
    }

    // Quantity fields
    if (lowerFieldName.includes('quantity') || lowerFieldName.includes('count')) {
      return this.faker.number.int({ min: 1, max: 100 });
    }

    // Description fields
    if (lowerFieldName.includes('description') || lowerFieldName.includes('notes')) {
      return this.faker.lorem.sentence();
    }

    // URL fields
    if (lowerFieldName.includes('url') || lowerFieldName.includes('website')) {
      return this.faker.internet.url();
    }

    // Default: string
    return this.faker.lorem.word();
  }

  /**
   * Topological sort of entities based on dependencies
   */
  private topologicalSort(schema: DatasetSchema): string[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize graph and in-degree
    for (const entityName of Object.keys(schema.entities)) {
      graph.set(entityName, []);
      inDegree.set(entityName, 0);
    }

    // Build dependency graph
    for (const [entityName, entityDef] of Object.entries(schema.entities)) {
      if (entityDef.relationships) {
        for (const relationship of Object.values(entityDef.relationships)) {
          const referencedEntity = relationship.references;

          // Skip self-references
          if (referencedEntity === entityName) {
            continue;
          }

          // Add edge: referencedEntity -> entityName
          graph.get(referencedEntity)?.push(entityName);
          inDegree.set(entityName, (inDegree.get(entityName) || 0) + 1);
        }
      }
    }

    // Kahn's algorithm for topological sort
    const queue: string[] = [];
    const sorted: string[] = [];

    // Start with entities that have no dependencies
    for (const [entityName, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(entityName);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;

      sorted.push(current);

      const neighbors = graph.get(current) || [];
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);

        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check if all entities are included (no circular dependencies)
    if (sorted.length !== Object.keys(schema.entities).length) {
      throw new Error('Circular dependencies detected in schema');
    }

    return sorted;
  }
}
