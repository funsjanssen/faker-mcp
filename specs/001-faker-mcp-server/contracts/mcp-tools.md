# MCP Tool Contracts

**Version**: 1.0.0  
**Date**: 2025-11-05  
**Protocol**: Model Context Protocol (MCP)

## Overview

This document defines all MCP tool contracts for the Faker MCP server. Each tool is defined with its JSON Schema for parameter validation and example requests/responses.

---

## Tool 1: generate-person

**Description**: Generates fake person data including names, emails, phone numbers, and addresses.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "number",
      "description": "Number of person records to generate",
      "minimum": 1,
      "maximum": 10000,
      "default": 1
    },
    "locale": {
      "type": "string",
      "description": "Locale for generated data",
      "enum": ["en", "fr", "de", "es", "ja"],
      "default": "en"
    },
    "seed": {
      "type": "number",
      "description": "Optional seed for reproducible generation",
      "minimum": 0
    },
    "includeAddress": {
      "type": "boolean",
      "description": "Whether to include address information",
      "default": true
    },
    "includePhone": {
      "type": "boolean",
      "description": "Whether to include phone number",
      "default": true
    },
    "includeDateOfBirth": {
      "type": "boolean",
      "description": "Whether to include date of birth",
      "default": false
    }
  },
  "required": []
}
```

**Example Request**:
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

**Example Response**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Generated 5 person records with seed 12345"
    },
    {
      "type": "resource",
      "resource": {
        "uri": "faker://persons/generated",
        "mimeType": "application/json",
        "text": "[{\"id\":\"person_12345_0\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"fullName\":\"John Doe\",\"email\":\"john.doe@example.com\",\"phone\":\"+1-555-123-4567\",\"address\":{\"street\":\"123 Main St\",\"city\":\"Springfield\",\"state\":\"IL\",\"postalCode\":\"62701\",\"country\":\"United States\"}},{\"id\":\"person_12345_1\",\"firstName\":\"Jane\",\"lastName\":\"Smith\",\"fullName\":\"Jane Smith\",\"email\":\"jane.smith@example.com\",\"phone\":\"+1-555-987-6543\",\"address\":{\"street\":\"456 Elm St\",\"city\":\"Portland\",\"state\":\"OR\",\"postalCode\":\"97201\",\"country\":\"United States\"}},{\"id\":\"person_12345_2\",\"firstName\":\"Bob\",\"lastName\":\"Johnson\",\"fullName\":\"Bob Johnson\",\"email\":\"bob.johnson@example.com\",\"phone\":\"+1-555-456-7890\",\"address\":{\"street\":\"789 Oak Ave\",\"city\":\"Austin\",\"state\":\"TX\",\"postalCode\":\"73301\",\"country\":\"United States\"}},{\"id\":\"person_12345_3\",\"firstName\":\"Alice\",\"lastName\":\"Williams\",\"fullName\":\"Alice Williams\",\"email\":\"alice.williams@example.com\",\"phone\":\"+1-555-321-0987\",\"address\":{\"street\":\"321 Pine Rd\",\"city\":\"Seattle\",\"state\":\"WA\",\"postalCode\":\"98101\",\"country\":\"United States\"}},{\"id\":\"person_12345_4\",\"firstName\":\"Charlie\",\"lastName\":\"Brown\",\"fullName\":\"Charlie Brown\",\"email\":\"charlie.brown@example.com\",\"phone\":\"+1-555-654-3210\",\"address\":{\"street\":\"654 Maple Dr\",\"city\":\"Denver\",\"state\":\"CO\",\"postalCode\":\"80201\",\"country\":\"United States\"}}]"
      }
    }
  ]
}
```

---

## Tool 2: generate-company

**Description**: Generates fake company data including names, industries, contact information, and addresses.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "number",
      "description": "Number of company records to generate",
      "minimum": 1,
      "maximum": 10000,
      "default": 1
    },
    "locale": {
      "type": "string",
      "description": "Locale for generated data",
      "enum": ["en", "fr", "de", "es", "ja"],
      "default": "en"
    },
    "seed": {
      "type": "number",
      "description": "Optional seed for reproducible generation",
      "minimum": 0
    },
    "includeAddress": {
      "type": "boolean",
      "description": "Whether to include address information",
      "default": true
    },
    "includeWebsite": {
      "type": "boolean",
      "description": "Whether to include website URL",
      "default": true
    },
    "includeFoundedYear": {
      "type": "boolean",
      "description": "Whether to include founded year",
      "default": false
    },
    "includeEmployeeCount": {
      "type": "boolean",
      "description": "Whether to include employee count",
      "default": false
    }
  },
  "required": []
}
```

**Example Request**:
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

**Example Response**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Generated 3 company records with seed 54321"
    },
    {
      "type": "resource",
      "resource": {
        "uri": "faker://companies/generated",
        "mimeType": "application/json",
        "text": "[{\"id\":\"company_54321_0\",\"name\":\"Acme Corporation\",\"industry\":\"Technology\",\"email\":\"contact@acme.example.com\",\"phone\":\"+1-555-111-2222\",\"website\":\"https://acme.example.com\",\"address\":{\"street\":\"100 Tech Blvd\",\"city\":\"San Francisco\",\"state\":\"CA\",\"postalCode\":\"94105\",\"country\":\"United States\"},\"founded\":2010,\"employeeCount\":250},{\"id\":\"company_54321_1\",\"name\":\"Global Industries Inc\",\"industry\":\"Manufacturing\",\"email\":\"info@globalind.example.com\",\"phone\":\"+1-555-222-3333\",\"website\":\"https://globalind.example.com\",\"address\":{\"street\":\"200 Industrial Way\",\"city\":\"Detroit\",\"state\":\"MI\",\"postalCode\":\"48201\",\"country\":\"United States\"},\"founded\":1995,\"employeeCount\":1500},{\"id\":\"company_54321_2\",\"name\":\"Innovative Solutions LLC\",\"industry\":\"Consulting\",\"email\":\"hello@innsol.example.com\",\"phone\":\"+1-555-333-4444\",\"website\":\"https://innsol.example.com\",\"address\":{\"street\":\"300 Business Park\",\"city\":\"Boston\",\"state\":\"MA\",\"postalCode\":\"02101\",\"country\":\"United States\"},\"founded\":2018,\"employeeCount\":75}]"
      }
    }
  ]
}
```

---

## Tool 3: generate-dataset

**Description**: Generates structured datasets with multiple entity types and referential integrity between them.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "schema": {
      "type": "object",
      "description": "Dataset schema defining entities and relationships",
      "properties": {
        "entities": {
          "type": "object",
          "description": "Map of entity names to entity definitions",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "count": {
                "type": "number",
                "description": "Number of records to generate for this entity",
                "minimum": 1,
                "maximum": 10000
              },
              "type": {
                "type": "string",
                "description": "Entity type",
                "enum": ["person", "company", "custom"]
              },
              "fields": {
                "type": "array",
                "description": "List of fields to include (optional, defaults to all)",
                "items": {
                  "type": "string"
                }
              },
              "relationships": {
                "type": "object",
                "description": "Foreign key relationships to other entities",
                "additionalProperties": {
                  "type": "object",
                  "properties": {
                    "references": {
                      "type": "string",
                      "description": "Name of the parent entity"
                    },
                    "type": {
                      "type": "string",
                      "description": "Relationship type",
                      "enum": ["one-to-many", "many-to-many"]
                    },
                    "nullable": {
                      "type": "boolean",
                      "description": "Whether the foreign key can be null",
                      "default": false
                    }
                  },
                  "required": ["references", "type"]
                }
              }
            },
            "required": ["count", "type"]
          }
        }
      },
      "required": ["entities"]
    },
    "locale": {
      "type": "string",
      "description": "Locale for generated data",
      "enum": ["en", "fr", "de", "es", "ja"],
      "default": "en"
    },
    "seed": {
      "type": "number",
      "description": "Optional seed for reproducible generation",
      "minimum": 0
    }
  },
  "required": ["schema"]
}
```

**Example Request**:
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

**Example Response**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Generated dataset with 2 entities: 10 users, 30 orders (seed: 99999)"
    },
    {
      "type": "resource",
      "resource": {
        "uri": "faker://dataset/generated",
        "mimeType": "application/json",
        "text": "{\"users\":[{\"id\":\"user_99999_0\",\"fullName\":\"John Doe\",\"email\":\"john.doe@example.com\",\"phone\":\"+1-555-100-0001\"},{\"id\":\"user_99999_1\",\"fullName\":\"Jane Smith\",\"email\":\"jane.smith@example.com\",\"phone\":\"+1-555-100-0002\"}],\"orders\":[{\"id\":\"order_99999_0\",\"userId\":\"user_99999_0\",\"productName\":\"Laptop\",\"price\":1299.99,\"orderDate\":\"2024-03-15\"},{\"id\":\"order_99999_1\",\"userId\":\"user_99999_0\",\"productName\":\"Mouse\",\"price\":29.99,\"orderDate\":\"2024-03-16\"},{\"id\":\"order_99999_2\",\"userId\":\"user_99999_1\",\"productName\":\"Keyboard\",\"price\":89.99,\"orderDate\":\"2024-03-17\"}]}"
      }
    }
  ]
}
```

---

## Tool 4: generate-custom

**Description**: Generates fake data following custom patterns, including regex patterns, enums, formats, and ranges.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "number",
      "description": "Number of records to generate",
      "minimum": 1,
      "maximum": 10000,
      "default": 1
    },
    "patterns": {
      "type": "object",
      "description": "Map of field names to pattern definitions",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "description": "Pattern type",
            "enum": ["regex", "enum", "format", "range"]
          },
          "value": {
            "description": "Pattern value (type depends on pattern type)",
            "oneOf": [
              { "type": "string" },
              { "type": "array", "items": { "type": "string" } },
              { "type": "object" }
            ]
          }
        },
        "required": ["type", "value"]
      }
    },
    "locale": {
      "type": "string",
      "description": "Locale for generated data (affects format-based patterns)",
      "enum": ["en", "fr", "de", "es", "ja"],
      "default": "en"
    },
    "seed": {
      "type": "number",
      "description": "Optional seed for reproducible generation",
      "minimum": 0
    }
  },
  "required": ["patterns"]
}
```

**Example Request**:
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

**Example Response**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Generated 5 custom records with seed 11111"
    },
    {
      "type": "resource",
      "resource": {
        "uri": "faker://custom/generated",
        "mimeType": "application/json",
        "text": "[{\"id\":\"custom_11111_0\",\"productCode\":\"PRD-1234-AB\",\"status\":\"active\",\"price\":456.78,\"reference\":\"REF-2024-A3B5C\"},{\"id\":\"custom_11111_1\",\"productCode\":\"PRD-5678-CD\",\"status\":\"pending\",\"price\":123.45,\"reference\":\"REF-2024-D7E9F\"},{\"id\":\"custom_11111_2\",\"productCode\":\"PRD-9012-EF\",\"status\":\"completed\",\"price\":789.12,\"reference\":\"REF-2024-G1H3I\"},{\"id\":\"custom_11111_3\",\"productCode\":\"PRD-3456-GH\",\"status\":\"active\",\"price\":234.56,\"reference\":\"REF-2024-J5K7L\"},{\"id\":\"custom_11111_4\",\"productCode\":\"PRD-7890-IJ\",\"status\":\"cancelled\",\"price\":567.89,\"reference\":\"REF-2024-M9N1O\"}]"
      }
    }
  ]
}
```

---

## Error Responses

All tools follow MCP standard error response format.

**Invalid Parameters Error**:
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

**Unsupported Locale Error**:
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

**Schema Validation Error**:
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

**Internal Error**:
```json
{
  "error": {
    "code": -32603,
    "message": "Data generation failed: unexpected error in faker library",
    "data": {
      "originalError": "Cannot read property 'name' of undefined"
    }
  }
}
```

---

## Server Capabilities

The server declares the following capabilities in its initialization response:

```json
{
  "capabilities": {
    "tools": {
      "listChanged": false
    }
  },
  "serverInfo": {
    "name": "faker-mcp-server",
    "version": "1.0.0"
  }
}
```

---

## Performance Guarantees

- **Small requests** (≤100 records): Response time <100ms
- **Medium requests** (101-1000 records): Response time <1000ms (1s)
- **Large requests** (1001-10000 records): Response time <10000ms (10s)
- **Memory usage**: <100MB for all request sizes up to 10,000 records
- **Concurrency**: Supports up to 10 concurrent requests without degradation

---

**Contract Version**: 1.0.0  
**MCP Protocol Version**: 2024-11-05  
**Last Updated**: 2025-11-05
