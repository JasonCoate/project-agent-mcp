# Project Agent Testing Suite

This directory contains the complete testing infrastructure for the Project Agent MCP Server.

## Quick Start

### Run All MCP Tools Test

```bash
cd mcp-tools
node test-all-tools-comprehensive.js
```

### Run Integration Tests

```bash
cd integration
npx ts-node test-comprehensive.ts
```

## Directory Structure

- **`unit/`** - Unit tests for individual components
- **`integration/`** - Integration tests for MCP server functionality
- **`mcp-tools/`** - Comprehensive MCP tool validation tests
- **`results/`** - Test execution results and artifacts
- **`reports/`** - Generated test reports and analysis

## Available Tests

### Integration Tests

- `test-comprehensive.ts` - Complete server functionality validation
- `test-create-project.ts` - Project creation workflow testing
- `test-integration.ts` - Core integration scenarios
- `test-mcp.ts` - MCP protocol compliance testing

### MCP Tools Tests

- `test-all-tools-comprehensive.ts/js` - Validates all 24 MCP tools

## Prerequisites

1. Build the MCP server:

   ```bash
   cd ../mcp-server
   npm run build
   ```

2. For integration tests, start the MCP server:
   ```bash
   cd ../mcp-server
   npm start
   ```

## Documentation

See [TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) for comprehensive testing documentation.
