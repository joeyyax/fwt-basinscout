#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  BasinScout Craft CMS Environment Creation Script');
console.log('==================================================\n');

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
  exitOnError = true
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

// Check if DDEV is installed
try {
  execSync('ddev version', { stdio: 'pipe' });
  console.log('✅ DDEV is installed\n');
} catch (error) {
  console.error('❌ DDEV is not installed or not in PATH');
  console.error('Please install DDEV first: https://ddev.com/get-started/');
  process.exit(1);
}

// Check if target directory already exists
if (fs.existsSync(craftInstallDir)) {
  console.error(`❌ Target directory already exists: ${craftInstallDir}`);
  console.error('Please remove it first or run: npm run craft-destroy');
  process.exit(1);
}

// Create the parent directory if it doesn't exist
const parentDir = path.dirname(craftInstallDir);
if (!fs.existsSync(parentDir)) {
  fs.mkdirSync(parentDir, { recursive: true });
}

console.log('🚀 Creating Craft CMS environment...\n');

// Step 1: Create the target directory
console.log('📁 Creating project directory...');
fs.mkdirSync(craftInstallDir, { recursive: true });
console.log('✅ Project directory created\n');

// Step 2: Initialize DDEV in the new project directory
runCommand(
  'ddev config --project-type=craftcms --docroot=web',
  'Configuring DDEV',
  craftInstallDir
);

// Step 3: Create Craft CMS project using DDEV composer
runCommand(
  'ddev composer create-project "craftcms/craft" .',
  'Creating Craft CMS project with DDEV Composer',
  craftInstallDir
);

// Step 4: Install CKEditor plugin
runCommand(
  'ddev composer require craftcms/ckeditor',
  'Installing CKEditor plugin',
  craftInstallDir
);

// Step 5: Attempt to install CKEditor plugin in Craft (graceful failure)
const pluginInstalled = runCommand(
  'ddev craft plugin/install ckeditor',
  'Installing CKEditor plugin in Craft',
  craftInstallDir,
  false // Don't exit on error
);

if (!pluginInstalled) {
  console.log('ℹ️  CKEditor plugin installation failed, but this is normal.');
  console.log(
    '   The plugin will be available to install via the Craft admin panel.\n'
  );
}

// Step 6: Launch the admin panel in browser
runCommand(
  'ddev launch /admin',
  'Opening Craft CMS admin panel in browser',
  craftInstallDir,
  false // Don't exit on error if browser launch fails
);

// Final instructions
console.log('🎉 Environment Creation Complete!');
console.log('================================\n');
console.log(`📍 Your Craft CMS environment is ready at: ${craftInstallDir}`);
console.log('');
console.log("🌐 If the admin panel didn't open, access it manually:");
console.log(`   cd "${craftInstallDir}"`);
console.log('   ddev launch /admin');
console.log('');
console.log('Happy crafting! 🚀');
