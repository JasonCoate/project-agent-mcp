import * as fs from 'fs';
import * as path from 'path';

// Test environment setup utility
export function setupTestEnvironment() {
  // Ensure test database directory exists
  const testDbDir = path.join(__dirname, '../mcp-server/data');
  if (!fs.existsSync(testDbDir)) {
    fs.mkdirSync(testDbDir, { recursive: true });
  }

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = path.join(testDbDir, 'test-project-agent.db');

  console.log('🧪 Test environment initialized');
}

// Test environment cleanup utility
export function cleanupTestEnvironment() {
  // Clean up test database
  const testDbPath = process.env.DATABASE_PATH;
  if (testDbPath && fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  console.log('🧹 Test environment cleaned up');
}

// Default test configuration
export const TEST_CONFIG = {
  timeout: 30000,
  retries: 2,
  verbose: true,
};
