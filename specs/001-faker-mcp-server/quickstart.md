# Quickstart Guide: Faker MCP Server

**Version**: 1.0.0  
**Last Updated**: 2025-11-05

## Introduction

The Faker MCP Server is a Model Context Protocol (MCP) server that provides fake/mock data generation capabilities using the Faker.js library. It's designed for developers who need realistic test data for database seeding, API testing, demo applications, and development environments.

**Key Features**:
- Generate realistic person, company, and custom data
- Create structured datasets with referential integrity
- Support for multiple locales (English, French, German, Spanish, Japanese)
- Seed-based reproducible data generation
- High performance (1000+ records/second)
- Strict MCP protocol compliance for seamless integration

---

## Installation

### Prerequisites
- Node.js 18+ installed on your system
- An MCP-compatible client (e.g., Claude Desktop, Cline, or any MCP client)

### Install via npm

```bash
npm install -g faker-mcp-server
```

### Verify Installation

```bash
faker-mcp-server --version
```

Expected output: `faker-mcp-server version 1.0.0`

---

## Configuration

### Claude Desktop Setup

1. Open Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the Faker MCP server to the `mcpServers` section:

```json
{
  "mcpServers": {
    "faker": {
      "command": "npx",
      "args": ["faker-mcp-server"]
    }
  }
}
```

3. Restart Claude Desktop

4. Verify the server is connected by asking Claude: "What MCP servers are available?"

### Other MCP Clients

For other MCP clients, configure according to their documentation using:
- **Command**: `npx faker-mcp-server` (or full path to installed binary)
- **Transport**: stdio (standard input/output)

---

## Quick Examples

### Example 1: Generate 10 Person Records

**Prompt to send to your MCP client**:
```
Generate 10 fake person records with names, emails, and addresses
```

**What happens**:
- MCP client calls `generate-person` tool with `count: 10`
- Server generates 10 realistic person records
- Returns data with names, emails, phone numbers, and complete addresses

**Sample Output**:
```json
[
  {
    "id": "person_12345_0",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "address": {
      "street": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701",
      "country": "United States"
    }
  },
  ...
]
```

---

### Example 2: Generate Companies with Seed for Reproducibility

**Prompt**:
```
Generate 5 company records with seed 54321 so I can reproduce this exact data later
```

**What happens**:
- MCP client calls `generate-company` tool with `count: 5, seed: 54321`
- Server generates companies using the specified seed
- Same seed will always produce identical data

**Usage**: Perfect for creating consistent test fixtures that can be regenerated exactly.

---

### Example 3: Generate Dataset with Related Entities

**Prompt**:
```
Generate a dataset with 20 users and 100 orders, where each order references a user
```

**What happens**:
- MCP client calls `generate-dataset` tool with schema defining users and orders
- Server generates users first, then orders with valid user ID references
- Maintains referential integrity across all records

**Sample Schema** (auto-constructed by MCP client):
```json
{
  "entities": {
    "users": {
      "count": 20,
      "type": "person",
      "fields": ["id", "fullName", "email"]
    },
    "orders": {
      "count": 100,
      "type": "custom",
      "fields": ["id", "userId", "productName", "price", "orderDate"],
      "relationships": {
        "userId": {
          "references": "users",
          "type": "one-to-many"
        }
      }
    }
  }
}
```

---

### Example 4: Generate Custom Pattern Data

**Prompt**:
```
Generate 50 product records with codes matching pattern PRD-####-XX where # is a digit and X is an uppercase letter
```

**What happens**:
- MCP client calls `generate-custom` tool with regex pattern
- Server generates records matching the exact pattern
- Returns structured data with pattern-compliant values

---

## Available Tools

### 1. generate-person
Generates person data (names, emails, phones, addresses)

**Common Parameters**:
- `count`: Number of records (1-10,000)
- `locale`: Data locale (`en`, `fr`, `de`, `es`, `ja`)
- `seed`: Optional seed for reproducibility
- `includeAddress`: Include address (default: true)
- `includePhone`: Include phone number (default: true)

### 2. generate-company
Generates company data (names, industries, contact info)

**Common Parameters**:
- `count`: Number of records (1-10,000)
- `locale`: Data locale
- `seed`: Optional seed
- `includeAddress`: Include address (default: true)
- `includeWebsite`: Include website URL (default: true)

### 3. generate-dataset
Generates multi-entity datasets with relationships

**Common Parameters**:
- `schema`: Dataset schema (entities and relationships)
- `locale`: Data locale
- `seed`: Optional seed

### 4. generate-custom
Generates data matching custom patterns

**Common Parameters**:
- `count`: Number of records (1-10,000)
- `patterns`: Map of field names to patterns (regex, enum, format, range)
- `locale`: Data locale
- `seed`: Optional seed

---

## Common Use Cases

### Use Case 1: Database Seeding

**Scenario**: You need to populate a development database with realistic test data.

**Approach**:
1. Generate dataset with required entities and relationships
2. Use seed for consistent development environments across team
3. Export data to SQL INSERT statements (future feature) or process JSON output

**Example Prompt**:
```
Generate a dataset with 100 users, 500 orders, and 1000 order items with proper relationships, using seed 100
```

---

### Use Case 2: API Integration Testing

**Scenario**: Testing API endpoints that expect specific data structures.

**Approach**:
1. Define custom patterns matching your API schemas
2. Generate test payloads with realistic data
3. Use in automated test suites

**Example Prompt**:
```
Generate 20 user registration payloads with emails, passwords, and profile information
```

---

### Use Case 3: UI Demo Data

**Scenario**: Building demo/preview environments for clients.

**Approach**:
1. Generate realistic-looking data in client's locale
2. Use seed to keep demo data consistent
3. Create complete datasets with all related entities

**Example Prompt**:
```
Generate French locale data: 50 customers with addresses and 200 orders for a demo e-commerce site
```

---

### Use Case 4: Performance Testing

**Scenario**: Load testing APIs or databases with large volumes of data.

**Approach**:
1. Generate large batches (up to 10,000 records per request)
2. Use different seeds for variety across test runs
3. Monitor generation performance metrics

**Example Prompt**:
```
Generate 10000 person records for load testing my user import API
```

---

## Best Practices

### 1. Use Seeds for Reproducibility
Always specify a seed when you need consistent test data across environments or test runs.

```
Generate 100 users with seed 12345
```

### 2. Choose Appropriate Locales
Match the locale to your target market for realistic-looking data.

```
Generate 50 companies in German locale (de)
```

### 3. Batch Large Requests
For very large datasets, consider generating in batches to manage memory.

```
Generate 3000 records with seed 111 (first batch)
Generate 3000 records with seed 222 (second batch)
Generate 3000 records with seed 333 (third batch)
```

### 4. Define Relationships Carefully
When using datasets, ensure parent entities are generated before child entities.

```json
// Good: users before orders
{
  "entities": {
    "users": { "count": 10, "type": "person" },
    "orders": { 
      "count": 50, 
      "type": "custom",
      "relationships": { "userId": { "references": "users" } }
    }
  }
}
```

### 5. Validate Generated Data
Always validate that generated data meets your application's requirements (format, constraints, etc.).

---

## Troubleshooting

### Issue: "MCP server not found"

**Cause**: Server not properly installed or configured in MCP client.

**Solution**:
1. Verify installation: `npm list -g faker-mcp-server`
2. Check MCP client configuration file for correct command
3. Restart MCP client after configuration changes

---

### Issue: "Invalid locale error"

**Cause**: Requested locale not supported.

**Solution**: Use one of the supported locales: `en`, `fr`, `de`, `es`, `ja`

---

### Issue: "Request timeout for large datasets"

**Cause**: Generating >5000 records may take several seconds.

**Solution**: 
- Use smaller batch sizes
- Be patient (10,000 records typically takes <10 seconds)
- Check memory constraints if timeouts persist

---

### Issue: "Referential integrity errors in dataset"

**Cause**: Schema defines relationships in wrong order or circular dependencies.

**Solution**:
- Define parent entities before child entities
- Avoid circular references
- Validate schema before generation

---

## Performance Expectations

| Operation | Records | Expected Time | Memory Usage |
|-----------|---------|---------------|--------------|
| Generate Person | 100 | <100ms | <5MB |
| Generate Person | 1,000 | <1s | <50MB |
| Generate Person | 10,000 | <10s | <100MB |
| Generate Company | 100 | <100ms | <5MB |
| Generate Dataset | 1,000 total | <2s | <50MB |
| Generate Custom | 1,000 | <1s | <30MB |

*Actual performance may vary based on system resources and pattern complexity.*

---

## Next Steps

### Learn More
- Read the full [MCP Tools Contract](./contracts/mcp-tools.md) for detailed API documentation
- Review [Data Model](./data-model.md) for complete entity definitions
- Check [Implementation Plan](./plan.md) for architectural details

### Advanced Usage
- Custom pattern recipes (coming soon)
- Exporting to multiple formats (CSV, SQL, Parquet)
- Integration with CI/CD pipelines
- Extending with custom generators

### Get Help
- GitHub Issues: [Report bugs or request features]
- Documentation: [Full API reference]
- Community: [Discussions and examples]

---

## License

MIT License - See LICENSE file for details

---

**Quickstart Version**: 1.0.0  
**Last Updated**: 2025-11-05
