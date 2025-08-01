#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🗑️  BasinScout Craft CMS Environment Destruction Script');
console.log('=====================================================\n');

// Get command line arguments
const targetDir = process.argv[2];

// Get the current directory and determine paths
const currentDir = process.cwd();
const basinscoutRoot = path.resolve(currentDir);
const craftInstallDir = targetDir
  ? path.resolve(targetDir)
  : path.resolve(basinscoutRoot, '../basinscout-craft');

console.log(`📍 Current directory: ${currentDir}`);
console.log(`📍 BasinScout root: ${basinscoutRoot}`);
console.log(`📍 Craft install target: ${craftInstallDir}`);
if (targetDir) {
  console.log(`📍 Using custom target directory: ${targetDir}`);
}
console.log();

function runCommand(
  command,
  description,
  workingDir = null,
  exitOnError = false
) {
  console.log(`🔧 ${description}...`);
  try {
    const options = { stdio: 'inherit' };
    if (workingDir) {
      options.cwd = workingDir;
    }
    execSync(command, options);
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(`Command: ${command}`);
    console.error(`Error: ${error.message}\n`);
    if (exitOnError) {
      process.exit(1);
    }
    return false;
  }
}

// Check if target directory exists
if (!fs.existsSync(craftInstallDir)) {
  console.log(`ℹ️  Target directory does not exist: ${craftInstallDir}`);
  console.log('Nothing to destroy.\n');
  process.exit(0);
}

console.log('🚀 Destroying Craft CMS environment...\n');

// Step 1: Stop and remove DDEV project
console.log('🛑 Stopping DDEV services...');
runCommand('ddev stop', 'Stopping DDEV services', craftInstallDir);
runCommand(
  'ddev delete --omit-snapshot',
  'Removing DDEV project',
  craftInstallDir
);

// Step 2: Remove the entire directory
console.log('🗂️  Removing project directory...');
try {
  execSync(`rm -rf "${craftInstallDir}"`, { stdio: 'inherit' });
  console.log('✅ Project directory removed\n');
} catch (error) {
  console.error(`❌ Failed to remove directory: ${error.message}`);
}

// Final message
console.log('🎉 Environment Destruction Complete!');
console.log('===================================\n');
console.log('The Craft CMS environment has been completely removed.');
console.log('');
console.log('To create a new environment:');
console.log('  npm run craft-create');
console.log('');
console.log('Goodbye! 👋');
