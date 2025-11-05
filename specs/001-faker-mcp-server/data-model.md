# Data Model: Fake Data Generation MCP Server

**Date**: 2025-11-05  
**Feature**: 001-faker-mcp-server

## Overview

This document defines the data entities, types, and relationships for the Faker MCP server. Since this is a stateless data generation service, the data model focuses on request/response structures, generation configurations, and output data schemas rather than persistent storage entities.

---

## Core Entities

### 1. GenerationRequest

Represents a client request for fake data generation.

**Fields**:
- `toolName` (string, required): Name of the MCP tool being invoked
- `parameters` (object, required): Tool-specific parameters (validated against tool schema)
- `requestId` (string, auto-generated): Unique identifier for tracking requests
- `timestamp` (ISO 8601 string, auto-generated): Request timestamp

**Relationships**:
- Has one `GenerationResponse` (output)

**Validation Rules**:
- `toolName` must be one of: `generate-person`, `generate-company`, `generate-dataset`, `generate-custom`
- `parameters` must conform to tool-specific JSON Schema
- Request size must not exceed 1MB

**State Transitions**: N/A (stateless)

---

### 2. GenerationResponse

Represents the result of a data generation request.

**Fields**:
- `content` (array of objects, required): Generated fake data records
- `metadata` (object, required): Response metadata
  - `count` (number): Number of records generated
  - `seed` (number, optional): Seed used for generation (if specified or auto-generated)
  - `locale` (string): Locale used for data generation
  - `generationTimeMs` (number): Time taken to generate data in milliseconds
- `isError` (boolean): Whether response represents an error
- `text` (string): Human-readable summary of generated data

**Relationships**:
- Belongs to one `GenerationRequest` (input)

**Validation Rules**:
- `content` array must not exceed 10,000 elements
- `count` must match actual number of records in `content`
- `generationTimeMs` must be positive number

---

### 3. PersonData

Represents generated data for a person entity.

**Fields**:
- `id` (string, required): Unique identifier (format: `person_${seed}_${index}`)
- `firstName` (string, required): Person's first name
- `lastName` (string, required): Person's last name
- `fullName` (string, required): Complete name
- `email` (string, required): Email address (format validated)
- `phone` (string, optional): Phone number
- `dateOfBirth` (ISO 8601 string, optional): Date of birth
- `address` (object, optional): Address information
  - `street` (string): Street address
  - `city` (string): City name
  - `state` (string): State/province
  - `postalCode` (string): Postal/ZIP code
  - `country` (string): Country name

**Validation Rules**:
- `email` must match regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `phone` must be valid phone format for specified locale
- `dateOfBirth` if provided must be in past and reasonable (18-100 years ago by default)
- All string fields must be non-empty and ≤ 255 characters

**Example**:
```json
{
  "id": "person_12345_0",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "dateOfBirth": "1985-06-15",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62701",
    "country": "United States"
  }
}
```

---

### 4. CompanyData

Represents generated data for a company entity.

**Fields**:
- `id` (string, required): Unique identifier (format: `company_${seed}_${index}`)
- `name` (string, required): Company name
- `industry` (string, required): Industry/sector
- `email` (string, required): Company email address
- `phone` (string, optional): Company phone number
- `website` (string, optional): Company website URL
- `address` (object, optional): Company address (same structure as PersonData.address)
- `founded` (number, optional): Year founded (1900-current year)
- `employeeCount` (number, optional): Number of employees

**Validation Rules**:
- `name` must be non-empty and ≤ 255 characters
- `email` must match email format regex
- `website` must be valid URL if provided
- `founded` must be between 1900 and current year
- `employeeCount` must be positive integer if provided

**Example**:
```json
{
  "id": "company_12345_0",
  "name": "Acme Corporation",
  "industry": "Technology",
  "email": "contact@acme.example.com",
  "phone": "+1-555-987-6543",
  "website": "https://acme.example.com",
  "address": {
    "street": "456 Business Blvd",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "United States"
  },
  "founded": 2010,
  "employeeCount": 250
}
```

---

### 5. DatasetSchema

Defines the structure for multi-entity dataset generation.

**Fields**:
- `entities` (object, required): Map of entity names to entity definitions
  - `[entityName]` (object): Entity definition
    - `count` (number, required): Number of records to generate (1-10,000)
    - `type` (string, required): Entity type (`person`, `company`, or `custom`)
    - `fields` (array of strings, optional): Specific fields to include (defaults to all)
    - `relationships` (object, optional): Foreign key relationships
      - `[fieldName]` (object): Relationship definition
        - `references` (string, required): Name of parent entity
        - `type` (string, required): Relationship type (`one-to-many`, `many-to-many`)
        - `nullable` (boolean, optional): Whether FK can be null (default: false)

**Validation Rules**:
- Must define at least one entity
- Total record count across all entities must not exceed 10,000
- Referenced entities in relationships must exist in schema
- Relationship references must point to entities defined before the current entity (no circular dependencies in generation order)
- Entity names must be valid identifiers (alphanumeric + underscore)

**Example**:
```json
{
  "entities": {
    "users": {
      "count": 100,
      "type": "person",
      "fields": ["id", "fullName", "email", "phone"]
    },
    "orders": {
      "count": 500,
      "type": "custom",
      "fields": ["id", "userId", "productName", "price", "orderDate"],
      "relationships": {
        "userId": {
          "references": "users",
          "type": "one-to-many",
          "nullable": false
        }
      }
    }
  }
}
```

---

### 6. CustomPattern

Defines custom data generation patterns for specialized fields.

**Fields**:
- `fieldName` (string, required): Name of the field to generate
- `pattern` (object, required): Pattern definition
  - `type` (string, required): Pattern type (`regex`, `enum`, `format`, `range`)
  - `value` (string | array | object, required): Type-specific pattern value
    - For `regex`: Regular expression string
    - For `enum`: Array of possible values
    - For `format`: Format string with placeholders
    - For `range`: Object with `min` and `max` properties

**Validation Rules**:
- `fieldName` must be valid identifier
- `type` must be one of supported pattern types
- `value` must be valid for specified type
- Regex patterns must be valid and not catastrophically backtracking
- Enum arrays must have at least one element
- Range min must be less than max

**Examples**:
```json
// Regex pattern
{
  "fieldName": "productCode",
  "pattern": {
    "type": "regex",
    "value": "PRD-[0-9]{4}-[A-Z]{2}"
  }
}

// Enum pattern
{
  "fieldName": "status",
  "pattern": {
    "type": "enum",
    "value": ["pending", "active", "completed", "cancelled"]
  }
}

// Format pattern
{
  "fieldName": "reference",
  "pattern": {
    "type": "format",
    "value": "REF-{{year}}-{{random:5}}"
  }
}

// Range pattern
{
  "fieldName": "age",
  "pattern": {
    "type": "range",
    "value": { "min": 18, "max": 65 }
  }
}
```

---

### 7. SeedConfiguration

Manages seed values for reproducible data generation.

**Fields**:
- `seed` (number, optional): User-provided seed value
- `autoGenerated` (boolean): Whether seed was auto-generated
- `seedString` (string, optional): Alternative string seed (hashed to number)

**Validation Rules**:
- If provided, `seed` must be safe integer (Number.isSafeInteger)
- `seedString` if provided must be non-empty and ≤ 100 characters
- Only one of `seed` or `seedString` should be provided

**Behavior**:
- If no seed provided: auto-generate from current timestamp
- If seedString provided: hash to consistent numeric seed
- Seed is propagated to all Faker instances in the request

---

## Type Hierarchies

### GeneratedData (Union Type)
```typescript
type GeneratedData = PersonData | CompanyData | CustomData;
```

### EntityType (Enum)
```typescript
enum EntityType {
  PERSON = 'person',
  COMPANY = 'company',
  CUSTOM = 'custom'
}
```

### RelationshipType (Enum)
```typescript
enum RelationshipType {
  ONE_TO_MANY = 'one-to-many',
  MANY_TO_MANY = 'many-to-many'
}
```

### PatternType (Enum)
```typescript
enum PatternType {
  REGEX = 'regex',
  ENUM = 'enum',
  FORMAT = 'format',
  RANGE = 'range'
}
```

### SupportedLocale (Enum)
```typescript
enum SupportedLocale {
  EN = 'en',
  FR = 'fr',
  DE = 'de',
  ES = 'es',
  JA = 'ja'
}
```

---

## Data Flow Diagrams

### Single Entity Generation Flow
```
Client Request
    ↓
[Validate Parameters] → [Error Response] (if invalid)
    ↓
[Generate Seed] (if not provided)
    ↓
[Initialize Faker Instance]
    ↓
[Generate N Records] (batched for large N)
    ↓
[Build Response with Metadata]
    ↓
Response to Client
```

### Multi-Entity Dataset Generation Flow
```
Client Request with Schema
    ↓
[Validate Schema] → [Error Response] (if invalid)
    ↓
[Sort Entities by Dependencies] → [Error Response] (if circular)
    ↓
[Generate Seed] (if not provided)
    ↓
[For Each Entity in Order]:
    ↓
    [Initialize Entity Generator]
    ↓
    [Generate Records with FK References]
    ↓
    [Store IDs for Child Relationships]
    ↓
[Build Dataset Response]
    ↓
Response to Client
```

---

## Validation Matrix

| Entity | Field | Validation | Error Code |
|--------|-------|------------|------------|
| GenerationRequest | toolName | Must be known tool | -32602 |
| GenerationRequest | parameters | Must match tool schema | -32602 |
| PersonData | email | Must match email regex | -32602 |
| PersonData | phone | Must be valid for locale | -32602 |
| CompanyData | website | Must be valid URL | -32602 |
| CompanyData | founded | Must be 1900-current year | -32602 |
| DatasetSchema | entities | Must have ≥1 entity | -32602 |
| DatasetSchema | count | Total ≤ 10,000 records | -32602 |
| DatasetSchema | relationships | No circular dependencies | -32602 |
| CustomPattern | regex | Must be valid regex | -32602 |
| SeedConfiguration | seed | Must be safe integer | -32602 |

---

## Performance Considerations

### Memory Estimates (per record)
- PersonData (full): ~500 bytes
- PersonData (minimal): ~200 bytes
- CompanyData (full): ~600 bytes
- CompanyData (minimal): ~250 bytes

### Batch Sizes
- 1-1,000 records: Single batch, no streaming
- 1,001-5,000 records: Batch size 1,000
- 5,001-10,000 records: Batch size 1,000 with GC hints

### Memory Limits
- Target: <100MB total memory usage
- Reserve: 20MB for overhead and temporary buffers
- Per-record budget: ~8KB (conservative estimate for 10k records)

---

## Extension Points

Future enhancements may include:
1. **Additional Entity Types**: Product, Event, Transaction, etc.
2. **Advanced Patterns**: Weighted distributions, conditional generation, template-based composition
3. **Export Formats**: CSV, SQL INSERT statements, Parquet files
4. **Streaming Responses**: Server-sent events for very large datasets (>10k records)
5. **Custom Faker Plugins**: User-defined data generators

---

**Data Model Version**: 1.0.0  
**Last Updated**: 2025-11-05
