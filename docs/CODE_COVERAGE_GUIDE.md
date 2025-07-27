# Code Coverage Guide

This guide explains how to set up, run, and interpret code coverage for the Project Agent MCP Server.

## Overview

Code coverage measures how much of your code is executed during testing. This project uses Jest for testing and coverage reporting, integrated with GitHub Actions for continuous monitoring.

## Coverage Tools

### Jest Configuration

- **Location**: `jest.config.js`
- **Coverage Directory**: `coverage/`
- **Reporters**: Text, HTML, LCOV, JSON
- **Thresholds**: 70% for branches, functions, lines, and statements

### GitHub Integration

- **Codecov**: Uploads coverage reports and provides detailed analysis
- **Coveralls**: Alternative coverage service with GitHub integration
- **Coverage Badge**: Auto-generated badge showing current coverage percentage

## Running Coverage Locally

### Quick Start

```bash
# Run all tests with coverage
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

### Available Commands

```bash
# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:mcp-server
npm run test:mcp-tools

# Run all tests
npm run test:all
```

## Coverage Reports

### HTML Report

- **Location**: `coverage/lcov-report/index.html`
- **Features**: Interactive file browser, line-by-line coverage, branch coverage
- **Usage**: Open in browser for detailed analysis

### LCOV Report

- **Location**: `coverage/lcov.info`
- **Purpose**: Machine-readable format for CI/CD integration
- **Usage**: Uploaded to Codecov and Coveralls

### Terminal Output

```
----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files             |   85.23 |    78.45 |   82.67 |   84.91 |
mcp-server/src        |   87.12 |    80.23 |   85.45 |   86.78 |
 database.ts          |   92.45 |    85.67 |   90.12 |   91.23 | 45,67,89
 index.ts              |   78.23 |    72.45 |   76.89 |   77.56 | 12,34,56
tools/                 |   83.45 |    76.78 |   81.23 |   82.67 |
 project-manager.ts   |   89.67 |    82.34 |   87.45 |   88.23 | 23,45
----------------------|---------|----------|---------|---------|-------------------
```

## GitHub Integration

### Automatic Coverage Reporting

The CI/CD pipeline automatically:

1. Runs tests with coverage on every push/PR
2. Uploads coverage data to Codecov and Coveralls
3. Updates the coverage badge
4. Comments on PRs with coverage changes

### Setting Up Codecov

1. Visit [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Add your repository
4. Copy the upload token (if private repo)
5. Add `CODECOV_TOKEN` to GitHub Secrets

### Setting Up Coveralls

1. Visit [coveralls.io](https://coveralls.io)
2. Sign in with GitHub
3. Add your repository
4. Token is automatically provided via GitHub Actions

### Coverage Badge

Add to your README.md:

```markdown
[![Coverage Status](https://codecov.io/gh/username/project-agent/branch/main/graph/badge.svg)](https://codecov.io/gh/username/project-agent)
```

## Coverage Thresholds

### Current Thresholds

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

### Adjusting Thresholds

Edit `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 80,    // Increase to 80%
    functions: 80,
    lines: 80,
    statements: 80
  },
  // Per-file thresholds
  './mcp-server/src/database.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

## Best Practices

### Writing Testable Code

1. **Small Functions**: Easier to test and achieve high coverage
2. **Pure Functions**: Predictable inputs and outputs
3. **Dependency Injection**: Mock external dependencies
4. **Error Handling**: Test both success and failure paths

### Improving Coverage

1. **Identify Gaps**: Use HTML report to find untested code
2. **Edge Cases**: Test boundary conditions and error scenarios
3. **Branch Coverage**: Ensure all if/else paths are tested
4. **Integration Tests**: Test component interactions

### Coverage Anti-Patterns

1. **100% Coverage Goal**: Focus on meaningful tests, not just coverage
2. **Testing Implementation**: Test behavior, not internal details
3. **Ignoring Quality**: High coverage doesn't guarantee good tests
4. **Coverage Gaming**: Writing tests just to increase numbers

## Troubleshooting

### Common Issues

#### Coverage Not Generated

```bash
# Check Jest configuration
npm run test:coverage -- --verbose

# Verify file patterns
npm run test:coverage -- --collectCoverageFrom="mcp-server/src/**/*.ts"
```

#### GitHub Actions Failing

```bash
# Check workflow file
cat .github/workflows/ci.yml

# Verify secrets are set
# Go to GitHub repo → Settings → Secrets and variables → Actions
```

#### Coverage Reports Missing

```bash
# Ensure coverage directory exists
ls -la coverage/

# Check Jest output
npm run test:coverage 2>&1 | grep -i coverage
```

### Debug Commands

```bash
# Run Jest with debug info
npm run test:coverage -- --verbose --no-cache

# Check file matching
npm run test:coverage -- --listTests

# Validate Jest config
npx jest --showConfig
```

## Integration with IDEs

### VS Code

Install extensions:

- **Jest**: Automatic test running and coverage display
- **Coverage Gutters**: Inline coverage indicators
- **Test Explorer**: Visual test management

### Configuration

```json
// .vscode/settings.json
{
  "jest.autoRun": "watch",
  "coverage-gutters.coverageFileNames": [
    "lcov.info",
    "cov.xml",
    "coverage.xml",
    "jacoco.xml"
  ],
  "coverage-gutters.coverageBaseDir": "coverage"
}
```

## Monitoring and Alerts

### GitHub Status Checks

The CI pipeline will:

- ✅ Pass if coverage meets thresholds
- ❌ Fail if coverage drops below thresholds
- 📊 Show coverage changes in PR comments

### Codecov Features

- **Coverage Diff**: Shows coverage changes in PRs
- **Sunburst Chart**: Visual coverage breakdown
- **Trends**: Historical coverage tracking
- **Notifications**: Slack/email alerts for coverage changes

### Setting Up Alerts

1. Configure Codecov notifications in `codecov.yml`
2. Set up GitHub branch protection rules
3. Add coverage status checks to required checks

## Advanced Configuration

### Custom Coverage Scripts

```bash
# Coverage for specific directories
npm run test:coverage -- --testPathPattern=mcp-server

# Coverage with specific reporters
npm run test:coverage -- --coverageReporters=text,html,cobertura

# Coverage excluding test files
npm run test:coverage -- --collectCoverageFrom="!**/*.test.ts"
```

### Multiple Coverage Formats

```javascript
// jest.config.js
coverageReporters: [
  'text', // Terminal output
  'text-summary', // Brief summary
  'html', // Interactive HTML
  'lcov', // For CI/CD
  'json', // Machine readable
  'cobertura', // For some CI systems
  'clover', // XML format
];
```

## Resources

- [Jest Coverage Documentation](https://jestjs.io/docs/code-coverage)
- [Codecov Documentation](https://docs.codecov.io/)
- [Coveralls Documentation](https://docs.coveralls.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
