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

### 1. generate-person

Generate person data with names, emails, phones, and addresses.

**Example**:
```
Generate 10 fake person records with names, emails, and addresses
```

### 2. generate-company

Generate company data with names, industries, and contact information.

**Example**:
```
Generate 5 company records with seed 54321 for reproducibility
```

### 3. generate-dataset

Generate multi-entity datasets with referential integrity.

**Example**:
```
Generate a dataset with 20 users and 100 orders, where each order references a user
```

### 4. generate-custom

Generate data matching custom patterns (regex, enum, format, range).

**Example**:
```
Generate 50 product records with codes matching pattern PRD-####-XX
```

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

[Your Name]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
