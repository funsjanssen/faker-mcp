# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-05

### Added

#### Core Features

- **MCP Server Infrastructure**: Full Model Context Protocol (MCP) compliant server with stdio transport support
- **Basic Data Generation** (Priority: P1):
  - `generate-person` tool: Generate realistic person data with names, emails, phone numbers, and addresses
  - `generate-company` tool: Generate company data with names, industries, contact information, and addresses
  - Support for optional fields (addresses, phone numbers, dates of birth, employee counts, founded years)
  - Configurable localization with support for English (en), French (fr), German (de), Spanish (es), and Japanese (ja)
  - Seed-based reproducible generation for consistent test data
  
- **Structured Dataset Generation** (Priority: P2):
  - `generate-dataset` tool: Generate multi-entity datasets with referential integrity
  - Support for complex entity relationships (one-to-many, many-to-many)
  - Automatic foreign key management and ID pool tracking
  - Schema validation with circular dependency detection
  - Configurable entity types (person, company, custom)
  
- **Custom Data Patterns** (Priority: P3):
  - `generate-custom` tool: Generate data following custom patterns and business rules
  - Regex pattern support for structured codes (e.g., product SKUs, reference numbers)
  - Enum pattern support for categorical data (e.g., status values, categories)
  - Format template support with placeholders (e.g., `REF-{{year}}-{{random:5}}`)
  - Range pattern support for numeric values with configurable min/max bounds

#### Developer Experience

- **TypeScript Support**: Full TypeScript implementation with strict mode enabled
- **Type Safety**: Comprehensive type definitions for all request/response schemas
- **Input Validation**: Zod-based parameter validation with detailed error messages
- **Error Handling**: MCP standard error codes with actionable remediation steps
- **Documentation**: JSDoc comments for all exported classes and functions
- **Testing Infrastructure**:
  - Vitest-based unit tests with 90%+ code coverage
  - Contract tests for MCP protocol compliance
  - Integration tests for full server lifecycle
  - Performance benchmarks for data generation throughput

#### Performance & Scale

- Generate 1,000+ records per second for basic data types
- Support for datasets up to 10,000 records
- Memory-efficient operation (<100MB for standard operations)
- Handle 10 concurrent client connections without degradation
- Response times: <100ms for small requests (≤100 records), <1s for medium (≤1000), <10s for large (≤10000)

#### Configuration & Build

- Vite-based build system for fast development and optimized production bundles
- ESLint + Prettier integration for code quality and formatting
- Husky git hooks for pre-commit linting and testing
- Cross-platform support (macOS, Linux, Windows)
- Node.js 18+ compatibility

### Technical Details

#### Tools Provided

1. **generate-person**
   - Parameters: `count`, `locale`, `seed`, `includeAddress`, `includePhone`, `includeDateOfBirth`
   - Returns: Array of person objects with unique IDs, names, emails, and optional fields
   - Performance: 1000+ records in <2 seconds

2. **generate-company**
   - Parameters: `count`, `locale`, `seed`, `includeAddress`, `includeWebsite`, `includeFoundedYear`, `includeEmployeeCount`
   - Returns: Array of company objects with unique IDs, names, industries, and optional fields
   - Performance: 1000+ records in <2 seconds

3. **generate-dataset**
   - Parameters: `schema` (entities, relationships), `locale`, `seed`
   - Returns: Structured dataset with multiple entity types maintaining referential integrity
   - Supports: Circular dependency detection, nullable foreign keys, custom field selection
   - Performance: Complex datasets with 10,000+ records in <10 seconds

4. **generate-custom**
   - Parameters: `count`, `patterns` (field definitions), `locale`, `seed`
   - Supports: regex, enum, format, and range pattern types
   - Returns: Array of custom objects matching specified patterns
   - Use cases: Product codes, status values, formatted references, numeric ranges

#### Dependencies

- `@modelcontextprotocol/sdk` ^0.5.0: MCP protocol implementation
- `@faker-js/faker` ^8.4.1: Core data generation library
- `zod` ^3.22.4: Runtime type validation
- `zod-to-json-schema` ^3.22.4: JSON Schema generation for MCP tool declarations
- `randexp` ^0.5.3: Regular expression-based random string generation

#### Architecture

- **Modular Design**: Separation of MCP protocol layer, data generation logic, and utilities
- **Generator Pattern**: Abstract `BaseGenerator` class with specialized implementations
- **Type Safety**: Comprehensive TypeScript types for all data structures
- **Seed Management**: Deterministic seed generation for reproducible data
- **Locale Support**: Configurable faker locales for internationalized data

### Documentation

- Comprehensive README with installation instructions and usage examples
- MCP tool contracts documentation with JSON schemas and example requests/responses
- Quickstart guide for common integration scenarios
- Specification document with user stories, requirements, and success criteria
- Implementation plan with technical architecture and project structure

### Known Limitations

- Maximum 10,000 records per request (memory constraints)
- Supported locales limited to: en, fr, de, es, ja
- No streaming support for large datasets (MCP protocol limitation)
- Concurrent connections limited to 10 for optimal performance

[1.0.0]: https://github.com/funsjanssen/faker-mcp/releases/tag/v1.0.0
