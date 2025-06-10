/**
 * Test Runner Script
 * Comprehensive testing with coverage reporting
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 COMPREHENSIVE TEST SUITE');
console.log('===========================\n');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function runCommand(command, description) {
  console.log(`${colors.blue}▶ ${description}${colors.reset}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`${colors.green}✅ ${description} completed${colors.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ ${description} failed${colors.reset}`);
    console.log(`Error: ${error.message}\n`);
    return false;
  }
}

function createTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    tests: {
      unit: { status: 'pending', coverage: null },
      e2e: { status: 'pending', browsers: [] },
    },
    summary: {
      passed: 0,
      failed: 0,
      total: 0,
    },
  };

  // Save initial report
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  return report;
}

async function main() {
  const report = createTestReport();
  let allTestsPassed = true;

  // 1. Lint and format check
  console.log(`${colors.yellow}📋 Code Quality Checks${colors.reset}`);
  const lintPassed = runCommand('npm run lint', 'ESLint check');
  const formatPassed = runCommand(
    'npm run format:check',
    'Prettier format check'
  );

  if (!lintPassed || !formatPassed) {
    console.log(
      `${colors.red}❌ Code quality checks failed. Please fix issues first.${colors.reset}`
    );
    process.exit(1);
  }

  // 2. Unit Tests with Coverage
  console.log(`${colors.yellow}🔬 Unit Tests${colors.reset}`);
  const unitTestsPassed = runCommand(
    'npm run test:coverage',
    'Unit tests with coverage'
  );

  report.tests.unit.status = unitTestsPassed ? 'passed' : 'failed';
  if (!unitTestsPassed) allTestsPassed = false;

  // 3. Build Test
  console.log(`${colors.yellow}🏗️  Build Test${colors.reset}`);
  const buildPassed = runCommand('npm run build', 'Production build');

  if (!buildPassed) {
    console.log(
      `${colors.red}❌ Build failed. Cannot proceed with E2E tests.${colors.reset}`
    );
    allTestsPassed = false;
  } else {
    // 4. E2E Tests
    console.log(`${colors.yellow}🌐 End-to-End Tests${colors.reset}`);
    const e2ePassed = runCommand(
      'npm run test:e2e',
      'E2E tests across browsers'
    );

    report.tests.e2e.status = e2ePassed ? 'passed' : 'failed';
    if (!e2ePassed) allTestsPassed = false;
  }

  // Generate final report
  report.summary.total = Object.keys(report.tests).length;
  report.summary.passed = Object.values(report.tests).filter(
    (t) => t.status === 'passed'
  ).length;
  report.summary.failed = Object.values(report.tests).filter(
    (t) => t.status === 'failed'
  ).length;

  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));

  // Final summary
  console.log(`${colors.yellow}📊 Test Summary${colors.reset}`);
  console.log(`Total test suites: ${report.summary.total}`);
  console.log(`${colors.green}Passed: ${report.summary.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${report.summary.failed}${colors.reset}`);

  if (allTestsPassed) {
    console.log(
      `\n${colors.green}🎉 All tests passed! Ready for deployment.${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.red}❌ Some tests failed. Please review and fix issues.${colors.reset}`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Test runner failed:${colors.reset}`, error);
  process.exit(1);
});
