#!/usr/bin/env node

/**
 * Faker MCP Server Entry Point
 *
 * This is the main entry point for the Faker MCP server.
 * It initializes the server, registers all tools, and starts listening for MCP requests.
 */

import { FakerMCPServer } from './server.js';
import { generatePersonTool, handleGeneratePerson } from './tools/generate-person.js';
import { generateCompanyTool, handleGenerateCompany } from './tools/generate-company.js';

async function main() {
  try {
    const server = new FakerMCPServer();

    // Register User Story 1 tools: generate-person and generate-company
    server.registerTool(generatePersonTool, handleGeneratePerson);
    server.registerTool(generateCompanyTool, handleGenerateCompany);

    await server.start();

    // Server is now running and listening on stdio
    // No need to log anything as MCP uses stdio for communication
  } catch (error) {
    console.error('Failed to start Faker MCP server:', error);
    process.exit(1);
  }
}

void main();
