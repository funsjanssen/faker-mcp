# Faker MCP Server

A Model Context Protocol (MCP) server that provides fake/mock data generation capabilities using the Faker.js library. Generate realistic test data for database seeding, API testing, demo applications, and development environments.

## Features

- **Basic Data Generation**: Generate realistic person and company data with names, emails, addresses, and contact information
- **Structured Datasets**: Create multi-entity datasets with referential integrity for complex testing scenarios
- **Custom Patterns**: Generate data following custom patterns (regex, enum, format, range) for domain-specific requirements
- **Multi-locale Support**: Generate data in English, French, German, Spanish, and Japanese
- **Reproducible Data**: Seed-based generation for consistent test data
- **High Performance**: Generate 1000+ records per second
- **MCP Protocol Compliant**: Seamlessly integrates with MCP-compatible clients

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

## Quick Start

### Claude Desktop Setup

1. Open Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\\Claude\\claude_desktop_config.json`
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

## Available Tools

The Faker MCP Server provides four powerful tools for generating fake data:

### 1. generate-person

Generate realistic person data including names, emails, phone numbers, and addresses.

**Parameters**:
- `count` (number, optional): Number of person records to generate (1-10,000, default: 1)
- `locale` (string, optional): Locale for generated data - `en`, `fr`, `de`, `es`, `ja` (default: `en`)
- `seed` (number, optional): Seed for reproducible generation
- `includeAddress` (boolean, optional): Whether to include address information (default: `true`)
- `includePhone` (boolean, optional): Whether to include phone number (default: `true`)
- `includeDateOfBirth` (boolean, optional): Whether to include date of birth (default: `false`)

**Example Usage**:
```
Generate 10 fake person records with names, emails, and addresses
```

**Example Request** (MCP protocol):
```json
{
  "method": "tools/call",
  "params": {
    "name": "generate-person",
    "arguments": {
      "count": 5,
      "locale": "en",
      "seed": 12345,
      "includeAddress": true,
      "includePhone": true,
      "includeDateOfBirth": false
    }
  }
}
```

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
  }
]
```

---

### 2. generate-company

Generate realistic company data including names, industries, contact information, and addresses.

**Parameters**:
- `count` (number, optional): Number of company records to generate (1-10,000, default: 1)
- `locale` (string, optional): Locale for generated data - `en`, `fr`, `de`, `es`, `ja` (default: `en`)
- `seed` (number, optional): Seed for reproducible generation
- `includeAddress` (boolean, optional): Whether to include address information (default: `true`)
- `includeWebsite` (boolean, optional): Whether to include website URL (default: `true`)
- `includeFoundedYear` (boolean, optional): Whether to include founded year (default: `false`)
- `includeEmployeeCount` (boolean, optional): Whether to include employee count (default: `false`)

**Example Usage**:
```
Generate 5 company records with seed 54321 for reproducibility
```

**Example Request** (MCP protocol):
```json
{
  "method": "tools/call",
  "params": {
    "name": "generate-company",
    "arguments": {
      "count": 3,
      "locale": "en",
      "seed": 54321,
      "includeAddress": true,
      "includeWebsite": true,
      "includeFoundedYear": true,
      "includeEmployeeCount": true
    }
  }
}
```

**Sample Output**:
```json
[
  {
    "id": "company_54321_0",
    "name": "Acme Corporation",
    "industry": "Technology",
    "email": "contact@acme.example.com",
    "phone": "+1-555-111-2222",
    "website": "https://acme.example.com",
    "address": {
      "street": "100 Tech Blvd",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94105",
      "country": "United States"
    },
    "founded": 2010,
    "employeeCount": 250
  }
]
```

---

### 3. generate-dataset

Generate structured datasets with multiple entity types and referential integrity between them.

**Parameters**:
- `schema` (object, required): Dataset schema defining entities and relationships
  - `entities` (object): Map of entity names to entity definitions
    - `count` (number): Number of records to generate for this entity (1-10,000)
    - `type` (string): Entity type - `person`, `company`, or `custom`
    - `fields` (array, optional): List of fields to include (defaults to all)
    - `relationships` (object, optional): Foreign key relationships to other entities
      - `references` (string): Name of the parent entity
      - `type` (string): Relationship type - `one-to-many` or `many-to-many`
      - `nullable` (boolean, optional): Whether the foreign key can be null (default: `false`)
- `locale` (string, optional): Locale for generated data - `en`, `fr`, `de`, `es`, `ja` (default: `en`)
- `seed` (number, optional): Seed for reproducible generation

**Example Usage**:
```
Generate a dataset with 20 users and 100 orders, where each order references a user
```

**Example Request** (MCP protocol):
```json
{
  "method": "tools/call",
  "params": {
    "name": "generate-dataset",
    "arguments": {
      "schema": {
        "entities": {
          "users": {
            "count": 10,
            "type": "person",
            "fields": ["id", "fullName", "email", "phone"]
          },
          "orders": {
            "count": 30,
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
      },
      "locale": "en",
      "seed": 99999
    }
  }
}
```

**Sample Output**:
```json
{
  "users": [
    {
      "id": "user_99999_0",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-100-0001"
    },
    {
      "id": "user_99999_1",
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1-555-100-0002"
    }
  ],
  "orders": [
    {
      "id": "order_99999_0",
      "userId": "user_99999_0",
      "productName": "Laptop",
      "price": 1299.99,
      "orderDate": "2024-03-15"
    },
    {
      "id": "order_99999_1",
      "userId": "user_99999_0",
      "productName": "Mouse",
      "price": 29.99,
      "orderDate": "2024-03-16"
    },
    {
      "id": "order_99999_2",
      "userId": "user_99999_1",
      "productName": "Keyboard",
      "price": 89.99,
      "orderDate": "2024-03-17"
    }
  ]
}
```

---

### 4. generate-custom

Generate data following custom patterns including regex patterns, enums, formats, and ranges.

**Parameters**:
- `count` (number, optional): Number of records to generate (1-10,000, default: 1)
- `patterns` (object, required): Map of field names to pattern definitions
  - `type` (string): Pattern type - `regex`, `enum`, `format`, or `range`
  - `value`: Pattern value (depends on pattern type):
    - `regex`: Regular expression string (e.g., `"PRD-[0-9]{4}-[A-Z]{2}"`)
    - `enum`: Array of string values to choose from (e.g., `["pending", "active", "completed"]`)
    - `format`: Template string with placeholders (e.g., `"REF-{{year}}-{{random:5}}"`)
    - `range`: Object with `min` and `max` numeric values (e.g., `{"min": 10, "max": 1000}`)
- `locale` (string, optional): Locale for generated data - affects format-based patterns (default: `en`)
- `seed` (number, optional): Seed for reproducible generation

**Example Usage**:
```
Generate 50 product records with codes matching pattern PRD-####-XX where # is a digit and X is an uppercase letter
```

**Example Request** (MCP protocol):
```json
{
  "method": "tools/call",
  "params": {
    "name": "generate-custom",
    "arguments": {
      "count": 5,
      "patterns": {
        "productCode": {
          "type": "regex",
          "value": "PRD-[0-9]{4}-[A-Z]{2}"
        },
        "status": {
          "type": "enum",
          "value": ["pending", "active", "completed", "cancelled"]
        },
        "price": {
          "type": "range",
          "value": { "min": 10, "max": 1000 }
        },
        "reference": {
          "type": "format",
          "value": "REF-{{year}}-{{random:5}}"
        }
      },
      "locale": "en",
      "seed": 11111
    }
  }
}
```

**Sample Output**:
```json
[
  {
    "id": "custom_11111_0",
    "productCode": "PRD-1234-AB",
    "status": "active",
    "price": 456.78,
    "reference": "REF-2024-A3B5C"
  },
  {
    "id": "custom_11111_1",
    "productCode": "PRD-5678-CD",
    "status": "pending",
    "price": 123.45,
    "reference": "REF-2024-D7E9F"
  }
]
```

---

## Common Use Cases

### Database Seeding

Generate realistic test data to populate development databases:

```
Generate a dataset with 100 users, 500 orders, and 1000 order items with proper relationships, using seed 100
```

### API Integration Testing

Create test payloads with realistic data structures:

```
Generate 20 user registration payloads with emails, passwords, and profile information
```

### UI Demo Data

Build demo environments with locale-specific data:

```
Generate French locale data: 50 customers with addresses and 200 orders for a demo e-commerce site
```

### Performance Testing

Generate large volumes of data for load testing:

```
Generate 10000 person records for load testing my user import API
```

---

## Best Practices

### 1. Use Seeds for Reproducibility

Always specify a seed when you need consistent test data across environments:

```
Generate 100 users with seed 12345
```

### 2. Choose Appropriate Locales

Match the locale to your target market for realistic data:

```
Generate 50 companies in German locale (de)
```

### 3. Batch Large Requests

For very large datasets, consider generating in batches:

```
Generate 3000 records with seed 111 (first batch)
Generate 3000 records with seed 222 (second batch)
Generate 3000 records with seed 333 (third batch)
```

### 4. Define Relationships Carefully

Ensure parent entities are generated before child entities:

```json
{
  "entities": {
    "users": { "count": 10, "type": "person" },
    "orders": { 
      "count": 50, 
      "type": "custom",
      "relationships": { 
        "userId": { "references": "users", "type": "one-to-many" } 
      }
    }
  }
}
```

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

*Performance may vary based on system resources and pattern complexity.*

---

## Error Handling

The server follows MCP standard error response format. Common errors include:

**Invalid Parameters** (code: -32602):
```json
{
  "error": {
    "code": -32602,
    "message": "Invalid count parameter: must be between 1 and 10000",
    "data": {
      "received": 50000,
      "max": 10000
    }
  }
}
```

**Unsupported Locale** (code: -32001):
```json
{
  "error": {
    "code": -32001,
    "message": "Unsupported locale: zh. Supported locales: en, fr, de, es, ja",
    "data": {
      "received": "zh",
      "supported": ["en", "fr", "de", "es", "ja"]
    }
  }
}
```

**Schema Validation Error** (code: -32602):
```json
{
  "error": {
    "code": -32602,
    "message": "Invalid schema: circular dependency detected in relationships",
    "data": {
      "cycle": ["orders", "items", "orders"]
    }
  }
}
```

---

## MCP Client Configurations

### Claude Desktop

Add to `claude_desktop_config.json`:

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

### Cline (VS Code Extension)

Add to MCP settings in VS Code:

```json
{
  "mcpServers": {
    "faker": {
      "command": "npx",
      "args": ["faker-mcp-server"],
      "transport": "stdio"
    }
  }
}
```

### Custom MCP Client

For any MCP-compatible client, use:
- **Command**: `npx faker-mcp-server` (or full path to installed binary)
- **Transport**: stdio (standard input/output)
- **Protocol**: MCP (Model Context Protocol)

Example configuration:
```json
{
  "command": "/path/to/node_modules/.bin/faker-mcp-server",
  "args": [],
  "transport": "stdio",
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Troubleshooting

### "MCP server not found"

**Cause**: Server not properly installed or configured.

**Solution**:
1. Verify installation: `npm list -g faker-mcp-server`
2. Check MCP client configuration file for correct command
3. Restart MCP client after configuration changes

### "Invalid locale error"

**Cause**: Requested locale not supported.

**Solution**: Use one of the supported locales: `en`, `fr`, `de`, `es`, `ja`

### "Request timeout for large datasets"

**Cause**: Generating >5000 records may take several seconds.

**Solution**: 
- Use smaller batch sizes
- Be patient (10,000 records typically takes <10 seconds)
- Check memory constraints if timeouts persist

### "Referential integrity errors in dataset"

**Cause**: Schema defines relationships in wrong order or circular dependencies.

**Solution**:
- Define parent entities before child entities
- Avoid circular references
- Validate schema before generation

---

## Development

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd faker-mcp

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Scripts

- `npm run build` - Build the project for production
- `npm run dev` - Build in watch mode for development
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint the code
- `npm run lint:fix` - Lint and fix issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Type-check without emitting

## License

MIT

## Author

Funs Janssen

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
