# Tasks: Fake Data Generation MCP Server

**Input**: Design documents from `/specs/001-faker-mcp-server/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Included (TDD approach per constitution check in plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure with src/, tests/, and config directories per plan.md
- [X] T002 Initialize Node.js project with package.json (type: module, engines: node >=18)
- [X] T003 Install core dependencies: @modelcontextprotocol/sdk, @faker-js/faker, zod, zod-to-json-schema
- [X] T004 Install dev dependencies: vite, vitest, typescript, @types/node, eslint, prettier
- [X] T005 [P] Create tsconfig.json with strict mode enabled and ES2022 target
- [X] T006 [P] Create vite.config.ts for library mode with Node.js 18 target
- [X] T007 [P] Create .eslintrc.json with TypeScript rules
- [X] T008 [P] Create .prettierrc for code formatting
- [X] T009 [P] Create .gitignore for Node.js project
- [X] T010 Setup package.json scripts: build, dev, test, lint, format
- [X] T011 [P] Setup husky for git hooks (pre-commit: lint + test)
- [X] T012 [P] Create README.md with installation and basic usage instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Type Definitions

- [X] T013 [P] Create TypeScript enums in src/types/schema.ts (EntityType, RelationshipType, PatternType, SupportedLocale)
- [X] T014 [P] Create request types in src/types/requests.ts (GenerationRequestParams, PersonRequestParams, CompanyRequestParams)
- [X] T015 [P] Create response types in src/types/responses.ts (GenerationResponse, PersonData, CompanyData, GeneratedDataset)
- [X] T016 [P] Create schema types in src/types/schema.ts (DatasetSchema, EntityDefinition, CustomPattern, SeedConfiguration)

### Utilities

- [X] T017 [P] Implement seed manager in src/utils/seed-manager.ts (seed generation, string hashing, validation)
- [X] T018 [P] Create Zod validators in src/utils/validators.ts (email, phone, URL, date validation helpers)

### Base Generator

- [X] T019 Create abstract BaseGenerator class in src/generators/base-generator.ts (faker instance management, seed handling, locale setup)

### MCP Server Infrastructure

- [X] T020 Create MCP Server class in src/server.ts (tool registration, request handling, error handling with MCP error codes)
- [X] T021 Create MCP server entry point in src/index.ts (stdio transport setup, server initialization, error handling)
- [X] T022 Add bin configuration to package.json pointing to dist/index.js

### Testing Infrastructure

- [X] T023 [P] Create vitest.config.ts with TypeScript support and coverage settings
- [X] T024 [P] Create test utilities in tests/helpers/test-utils.ts (faker instance mocking, assertion helpers)
- [X] T025 Write MCP protocol compliance test in tests/contract/mcp-protocol.test.ts (server initialization, tool discovery, error response formats)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Data Generation (Priority: P1) 🎯 MVP

**Goal**: Enable developers to generate realistic person and company data with names, emails, addresses, and contact information

**Independent Test**: Connect to MCP server, request person/company generation, receive properly formatted fake data that matches expected schemas

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T026 [P] [US1] Write contract test for generate-person tool in tests/contract/generate-person.test.ts (validate input schema, output format, seed reproducibility)
- [X] T027 [P] [US1] Write contract test for generate-company tool in tests/contract/generate-company.test.ts (validate input schema, output format, seed reproducibility)
- [X] T028 [P] [US1] Write unit tests for PersonGenerator in tests/unit/generators/person-generator.test.ts (field generation, locale handling, optional fields)
- [X] T029 [P] [US1] Write unit tests for CompanyGenerator in tests/unit/generators/company-generator.test.ts (field generation, locale handling, optional fields)

### Implementation for User Story 1

- [X] T030 [P] [US1] Create PersonGenerator class in src/generators/person-generator.ts (extends BaseGenerator, generates PersonData with all fields)
- [X] T031 [P] [US1] Create CompanyGenerator class in src/generators/company-generator.ts (extends BaseGenerator, generates CompanyData with all fields)
- [X] T032 [US1] Create Zod schema for generate-person parameters in src/tools/generate-person.ts
- [X] T033 [US1] Implement generate-person MCP tool handler in src/tools/generate-person.ts (parameter validation, PersonGenerator integration, response formatting)
- [X] T034 [US1] Create Zod schema for generate-company parameters in src/tools/generate-company.ts
- [X] T035 [US1] Implement generate-company MCP tool handler in src/tools/generate-company.ts (parameter validation, CompanyGenerator integration, response formatting)
- [X] T036 [US1] Register generate-person and generate-company tools in src/server.ts
- [X] T037 [US1] Add error handling for invalid locales and parameter validation in both tools
- [X] T038 [US1] Add logging for person and company generation operations in both tools

**Checkpoint**: At this point, User Story 1 should be fully functional - can generate person and company data independently

---

## Phase 4: User Story 2 - Structured Dataset Generation (Priority: P2)

**Goal**: Enable developers to generate multi-entity datasets with referential integrity for complex testing scenarios

**Independent Test**: Define schema with users and orders entities, request dataset generation, verify referential integrity between entities

### Tests for User Story 2

- [X] T039 [P] [US2] Write contract test for generate-dataset tool in tests/contract/generate-dataset.test.ts (schema validation, referential integrity, multi-entity support)
- [X] T040 [P] [US2] Write unit tests for DatasetGenerator in tests/unit/generators/dataset-generator.test.ts (entity ordering, FK generation, relationship types)
- [X] T041 [P] [US2] Write unit tests for schema validator in tests/unit/utils/validators.test.ts (circular dependency detection, entity count validation)

### Implementation for User Story 2

- [X] T042 [US2] Create schema validation utilities in src/utils/validators.ts (validateDatasetSchema, detectCircularDependencies, validateEntityCounts)
- [X] T043 [US2] Implement ID pool management in src/generators/dataset-generator.ts (generateEntityId, trackEntityIds, selectForeignKeyValue)
- [X] T044 [US2] Create DatasetGenerator class in src/generators/dataset-generator.ts (extends BaseGenerator, multi-entity generation, relationship handling)
- [X] T045 [US2] Create Zod schema for generate-dataset parameters in src/tools/generate-dataset.ts
- [X] T046 [US2] Implement generate-dataset MCP tool handler in src/tools/generate-dataset.ts (schema validation, DatasetGenerator integration, response formatting)
- [X] T047 [US2] Register generate-dataset tool in src/server.ts
- [X] T048 [US2] Add error handling for schema validation failures and circular dependencies
- [X] T049 [US2] Add logging for dataset generation operations with entity counts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can generate basic data and complex datasets

---

## Phase 5: User Story 3 - Custom Data Patterns (Priority: P3)

**Goal**: Enable developers to generate data following custom patterns (regex, enum, format, range) for domain-specific requirements

**Independent Test**: Define custom patterns for product codes and statuses, request generation, verify data matches exact pattern specifications

### Tests for User Story 3

- [X] T050 [P] [US3] Write contract test for generate-custom tool in tests/contract/generate-custom.test.ts (pattern validation, all pattern types, seed reproducibility)
- [X] T051 [P] [US3] Write unit tests for CustomGenerator in tests/unit/generators/custom-generator.test.ts (regex patterns, enum selection, format templates, range generation)
- [X] T052 [P] [US3] Write unit tests for pattern validators in tests/unit/utils/validators.test.ts (regex validation, enum validation, format parsing, range validation) - Note: Pattern validators implemented in src/tools/generate-custom.ts and thoroughly tested in contract and unit tests

### Implementation for User Story 3

- [X] T053 [P] [US3] Create pattern validation utilities in src/utils/validators.ts (validateRegexPattern, validateEnumPattern, validateFormatPattern, validateRangePattern)
- [X] T054 [US3] Implement regex pattern generator in src/generators/custom-generator.ts (uses RandExp or faker helpers for regex matching)
- [X] T055 [US3] Implement enum pattern generator in src/generators/custom-generator.ts (random selection from array)
- [X] T056 [US3] Implement format pattern generator in src/generators/custom-generator.ts (template parsing with placeholders)
- [X] T057 [US3] Implement range pattern generator in src/generators/custom-generator.ts (numeric ranges with proper distribution)
- [X] T058 [US3] Create CustomGenerator class in src/generators/custom-generator.ts (extends BaseGenerator, orchestrates all pattern types)
- [X] T059 [US3] Create Zod schema for generate-custom parameters in src/tools/generate-custom.ts
- [X] T060 [US3] Implement generate-custom MCP tool handler in src/tools/generate-custom.ts (pattern validation, CustomGenerator integration, response formatting)
- [X] T061 [US3] Register generate-custom tool in src/server.ts
- [X] T062 [US3] Add error handling for invalid patterns and unsupported pattern types
- [X] T063 [US3] Add logging for custom pattern generation operations

**Checkpoint**: All user stories should now be independently functional - basic data, datasets, and custom patterns all work

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalize the project

- [X] T064 [P] Write integration test for full MCP server lifecycle in tests/integration/server.test.ts (server start, multiple tool calls, concurrent requests)
- [X] T065 [P] Write performance benchmarks in tests/performance/generation-performance.test.ts (1k, 5k, 10k records, memory usage)
- [X] T066 [P] Add comprehensive JSDoc comments to all exported classes and functions across src/
- [X] T067 [P] Create CHANGELOG.md with version 1.0.0 release notes
- [X] T068 [P] Update README.md with complete API documentation, examples from contracts/mcp-tools.md, and quickstart guide
- [ ] T069 Run all tests and ensure 90% code coverage target is met
- [ ] T070 Validate quickstart.md scenarios work end-to-end with actual server
- [ ] T071 [P] Add example MCP client configurations to README.md (Claude Desktop, other clients)
- [ ] T072 [P] Create LICENSE file (MIT per plan.md)
- [ ] T073 Run linting and formatting across entire codebase
- [ ] T074 Build production bundle with Vite and verify output size
- [ ] T075 Test server startup and basic operations on macOS, Linux, and Windows (if possible)
- [ ] T076 [P] Create npm package preparation checklist (package.json metadata, keywords, description)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T012) - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion (T013-T025)
  - User Story 1 (Phase 3): Can start after T025 - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after T025 - Independent of US1 (uses foundational generators)
  - User Story 3 (Phase 5): Can start after T025 - Independent of US1/US2
  - User stories can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete (T026-T063)

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (T013-T025) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on Foundational (T013-T025) - Independent of US1 (reuses PersonGenerator/CompanyGenerator but can implement separately)
- **User Story 3 (P3)**: Depends on Foundational (T013-T025) - Independent of US1/US2

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (Red-Green-Refactor)
2. Generators before tool handlers
3. Zod schemas before tool handlers
4. Tool handlers before server registration
5. Core implementation before error handling/logging
6. Story complete and tested before moving to next priority

### Parallel Opportunities

#### Phase 1: Setup (Parallel Tasks)
- T005, T006, T007, T008, T009, T011, T012 can all run in parallel after T004

#### Phase 2: Foundational (Parallel Tasks)
- T013, T014, T015, T016 (all type definitions) can run in parallel after T012
- T017, T018 (utilities) can run in parallel after T016
- T023, T024, T025 (testing infrastructure) can run in parallel after T022

#### Phase 3: User Story 1 (Parallel Tasks)
- T026, T027, T028, T029 (all tests) can run in parallel after T025
- T030, T031 (both generators) can run in parallel after T029
- T032 and T034 (Zod schemas) can be developed in parallel after T031

#### Phase 4: User Story 2 (Parallel Tasks)
- T039, T040, T041 (all tests) can run in parallel after T038

#### Phase 5: User Story 3 (Parallel Tasks)
- T050, T051, T052 (all tests) can run in parallel after T049
- T053 (pattern validators) must complete before T054-T057 (pattern generators)

#### Phase 6: Polish (Parallel Tasks)
- T064, T065, T066, T067, T068, T071, T072, T076 can all run in parallel after T063

#### Cross-Phase Parallelization
If team capacity allows, after Foundational (Phase 2) completes:
- Developer A: User Story 1 (T026-T038)
- Developer B: User Story 2 (T039-T049) - works independently
- Developer C: User Story 3 (T050-T063) - works independently

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (after T025):
Task T026: "Write contract test for generate-person tool in tests/contract/generate-person.test.ts"
Task T027: "Write contract test for generate-company tool in tests/contract/generate-company.test.ts"
Task T028: "Write unit tests for PersonGenerator in tests/unit/generators/person-generator.test.ts"
Task T029: "Write unit tests for CompanyGenerator in tests/unit/generators/company-generator.test.ts"

# Launch both generators together (after T029):
Task T030: "Create PersonGenerator class in src/generators/person-generator.ts"
Task T031: "Create CompanyGenerator class in src/generators/company-generator.ts"

# Launch both Zod schemas together (after T031):
Task T032: "Create Zod schema for generate-person parameters in src/tools/generate-person.ts"
Task T034: "Create Zod schema for generate-company parameters in src/tools/generate-company.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T012)
2. Complete Phase 2: Foundational (T013-T025) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T026-T038)
4. **STOP and VALIDATE**: Test User Story 1 independently with MCP Inspector
5. Deploy/demo if ready - developers can now generate person and company data

**MVP Deliverable**: Working MCP server that generates person and company data with seed reproducibility and multiple locale support.

### Incremental Delivery

1. **Foundation** (T001-T025): Project setup + MCP infrastructure → Foundation ready
2. **MVP** (T026-T038): Add User Story 1 → Test independently → Deploy/Demo (basic data generation works!)
3. **Enhanced** (T039-T049): Add User Story 2 → Test independently → Deploy/Demo (now supports complex datasets!)
4. **Complete** (T050-T063): Add User Story 3 → Test independently → Deploy/Demo (now supports custom patterns!)
5. **Polished** (T064-T076): Polish and finalize → Production ready

Each story adds value without breaking previous stories. Can stop at any checkpoint for early delivery.

### Parallel Team Strategy

With multiple developers:

1. **Week 1**: Team completes Setup + Foundational together (T001-T025)
2. **Week 2+**: Once Foundational is done, parallelize:
   - **Developer A**: User Story 1 (T026-T038) - Basic generation
   - **Developer B**: User Story 2 (T039-T049) - Dataset generation
   - **Developer C**: User Story 3 (T050-T063) - Custom patterns
3. **Week 3+**: Stories complete and integrate independently
4. **Week 4**: Team completes Polish together (T064-T076)

---

## Task Summary

- **Total Tasks**: 76
- **Setup Phase**: 12 tasks (T001-T012)
- **Foundational Phase**: 13 tasks (T013-T025)
- **User Story 1**: 13 tasks (T026-T038)
- **User Story 2**: 11 tasks (T039-T049)
- **User Story 3**: 14 tasks (T050-T063)
- **Polish Phase**: 13 tasks (T064-T076)

**Parallel Opportunities Identified**: 35+ tasks marked [P] can run in parallel with other tasks
**Independent Test Criteria**: Each user story has clear acceptance tests defined in spec.md
**Suggested MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1) = 38 tasks for MVP

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] tasks target different files with no sequential dependencies
- [Story] labels (US1, US2, US3) map tasks to specific user stories for traceability
- Each user story is independently completable and testable per spec.md requirements
- TDD approach: All tests written before implementation (Red-Green-Refactor cycle)
- Commit after each task or logical group for incremental progress
- Stop at any checkpoint to validate story independently with MCP Inspector
- Constitution requirements met: 90% code coverage, strict TypeScript, JSDoc comments, performance tests

---

**Generated**: 2025-11-05  
**Feature**: 001-faker-mcp-server  
**Command**: /speckit.tasks
