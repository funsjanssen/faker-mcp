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
import { generateDatasetTool, handleGenerateDataset } from './tools/generate-dataset.js';
import { generateCustomTool, handleGenerateCustom } from './tools/generate-custom.js';

async function main() {
  try {
    const server = new FakerMCPServer();

    // Register User Story 1 tools: generate-person and generate-company
    server.registerTool(generatePersonTool, handleGeneratePerson);
    server.registerTool(generateCompanyTool, handleGenerateCompany);

    // Register User Story 2 tool: generate-dataset
    server.registerTool(generateDatasetTool, async (args) => {
      await Promise.resolve();
      return handleGenerateDataset(args);
    });

    // Register User Story 3 tool: generate-custom
    server.registerTool(generateCustomTool, handleGenerateCustom);

    await server.start();

    // Server is now running and listening on stdio
    // No need to log anything as MCP uses stdio for communication
  } catch (error) {
    console.error('Failed to start Faker MCP server:', error);
    process.exit(1);
  }
}

void main();
