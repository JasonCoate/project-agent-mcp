# Testing Guide

This document provides comprehensive information about testing the Project Agent MCP Server, including test organization, execution, and reporting.

## Test Directory Structure

The testing infrastructure is organized into the following directories:

```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for MCP server functionality
├── mcp-tools/      # Comprehensive MCP tool validation tests
├── results/        # Test execution results and artifacts
└── reports/        # Generated test reports and analysis
```

## Test Categories

### Unit Tests (`tests/unit/`)

- Individual component testing
- Database operation validation
- Utility function verification
- Schema validation tests

### Integration Tests (`tests/integration/`)

- End-to-end MCP server functionality
- Database integration testing
- Tool interaction validation
- Resource management testing

**Available Integration Tests:**

- `test-comprehensive.ts` - Complete server functionality validation
- `test-create-project.ts` - Project creation workflow testing
- `test-integration.ts` - Core integration scenarios
- `test-mcp.ts` - MCP protocol compliance testing

### MCP Tools Tests (`tests/mcp-tools/`)

- Comprehensive validation of all MCP tools
- JSON-RPC protocol testing
- Tool parameter validation
- Error handling verification

**Available MCP Tools Tests:**

- `test-all-tools-comprehensive.ts` - Complete MCP tool suite validation
- `test-all-tools-comprehensive.js` - Compiled version for direct execution

## Running Tests

### Prerequisites

1. **Build the MCP server** (required before running any tests):
   ```bash
   cd mcp-server
   npm run build
   ```

### Executing Tests

#### Quick Start - Run All Tests

```bash
# Run comprehensive MCP tools validation
npm test

# Run integration tests
npm run test:integration

# Run MCP server tests
npm run test:mcp-server
```

#### Individual Test Execution

**Integration Tests:**

```bash
# Run individual integration tests
cd tests/integration
npx ts-node test-comprehensive.ts
npx ts-node test-create-project.ts
npx ts-node test-integration.ts
npx ts-node test-mcp.ts
```

**MCP Tools Comprehensive Test:**

```bash
# Run the comprehensive MCP tools test
cd tests/mcp-tools
node test-all-tools-comprehensive.js
```

## Test Coverage

The comprehensive MCP tools test validates all 24 available tools across these categories:

### Project Management Tools (4 tools)

- `create_project` - Create new projects
- `get_project` - Retrieve project details
- `update_project` - Modify project information
- `list_projects` - List all projects

### Specification Management Tools (4 tools)

- `create_spec` - Create project specifications
- `get_spec` - Retrieve specifications
- `update_spec` - Modify specifications
- `list_specs` - List project specifications

### Task Management Tools (4 tools)

- `create_task` - Create project tasks
- `get_task` - Retrieve task details
- `update_task` - Modify task information
- `list_tasks` - List project tasks

### Memory Management Tools (4 tools)

- `store_memory` - Store contextual information
- `retrieve_memory` - Retrieve stored memories
- `search_memories` - Search memory content
- `list_memories` - List all memories

### Feature Workflow Tools (5 tools)

- `get_workflow_summary` - Get workflow status
- `update_task_with_sync` - Update tasks with synchronization
- `add_task_with_sync` - Add tasks with synchronization
- `generate_progress_summary` - Generate progress reports
- `create_checkpoint` - Create workflow checkpoints

### Context Management Tools (3 tools)

- `get_project_context` - Retrieve project context
- `add_context_note` - Add contextual notes
- `search_context` - Search context information

## Test Results and Reporting

### Results Storage

Test execution results are stored in `tests/results/` with the following structure:

- Execution logs
- Performance metrics
- Error reports
- Coverage data

### Report Generation

Test reports are generated in `tests/reports/` and include:

- Summary statistics
- Tool validation status
- Performance analysis
- Failure diagnostics

## Best Practices

### Test Development

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Tests should clean up any created resources
3. **Validation**: Verify both success and error scenarios
4. **Documentation**: Include clear descriptions of test purposes

### Test Execution

1. **Environment**: Ensure clean test environment before execution
2. **Dependencies**: Verify all dependencies are available
3. **Monitoring**: Monitor test execution for performance issues
4. **Reporting**: Generate comprehensive reports for analysis

### Continuous Integration

1. **Automation**: Integrate tests into CI/CD pipelines
2. **Coverage**: Maintain high test coverage across all components
3. **Performance**: Monitor test execution performance
4. **Alerts**: Set up alerts for test failures

## Troubleshooting

### Common Issues

#### MCP Server Connection

- Ensure server is running before executing tests
- Check server logs for startup errors
- Verify port availability and configuration

#### Database Issues

- Ensure database file permissions are correct
- Check for database lock conflicts
- Verify schema migrations are applied

#### Tool Validation Failures

- Check tool parameter schemas
- Verify JSON-RPC message formatting
- Review server error logs for details

### Debug Mode

Enable debug logging by setting environment variables:

```bash
export DEBUG=true
export LOG_LEVEL=debug
```

## Contributing

When adding new tests:

1. Place tests in appropriate subdirectories
2. Follow existing naming conventions
3. Include comprehensive documentation
4. Update this guide with new test information
5. Ensure tests pass in CI environment

## Related Documentation

- [Project Setup Guide](PROJECT_SETUP_GUIDE.md)
- [MCP Server README](../mcp-server/README.md)
- [Memory Management Guide](MEMORY_MANAGEMENT_GUIDE.md)
- [N8N Integration Guide](N8N_INTEGRATION_GUIDE.md)
