#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('📦 BasinScout Craft CMS File Deployment Script');
console.log('==============================================\n');

// Get command line arguments
const targetDir = process.argv[2];

// Get the current directory and determine paths
const currentDir = process.cwd();
const basinscoutRoot = path.resolve(currentDir);
const craftInstallDir = targetDir
  ? path.resolve(targetDir)
  : path.resolve(basinscoutRoot, '../basinscout-craft');
const distCraftDir = path.resolve(currentDir, 'dist/craft-cms');
const migrationsSource = path.resolve(distCraftDir, 'migrations');
const templatesSource = path.resolve(distCraftDir, 'templates');
const webSource = path.resolve(distCraftDir, 'web');

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

function copyDirectory(source, destination, description) {
  console.log(`📂 ${description}...`);
  try {
    if (!fs.existsSync(source)) {
      console.log(
        `⚠️  Warning: Source directory ${source} does not exist, skipping\n`
      );
      return;
    }

    // Create destination directory if it doesn't exist
    const destParent = path.dirname(destination);
    if (!fs.existsSync(destParent)) {
      fs.mkdirSync(destParent, { recursive: true });
    }

    // Use cp command for recursive copy
    execSync(`cp -r "${source}" "${destination}"`, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Check if export files exist and are current
function checkExportFiles() {
  if (!fs.existsSync(distCraftDir)) {
    console.log('📦 Export files not found. Running export script...\n');
    runCommand(
      'npm run craft-export',
      'Exporting BasinScout to Craft CMS format',
      currentDir
    );
    return;
  }

  const templatesExists = fs.existsSync(templatesSource);
  const webExists = fs.existsSync(webSource);
  const migrationsExists = fs.existsSync(migrationsSource);

  if (!templatesExists || !webExists || !migrationsExists) {
    console.log('📦 Export files incomplete. Running export script...\n');
    runCommand(
      'npm run craft-export',
      'Exporting BasinScout to Craft CMS format',
      currentDir
    );
  } else {
    // Check if migration files are recent (within last day) to ensure fresh timestamps
    const migrationFiles = fs.readdirSync(migrationsSource);
    let needsRefresh = false;

    if (migrationFiles.length === 0) {
      needsRefresh = true;
    } else {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      needsRefresh = migrationFiles.every((file) => {
        const filePath = path.join(migrationsSource, file);
        const stats = fs.statSync(filePath);
        return stats.mtime.getTime() < oneDayAgo;
      });
    }

    if (needsRefresh) {
      console.log(
        '📦 Export files are outdated. Running export script for fresh timestamps...\n'
      );
      runCommand(
        'npm run craft-export',
        'Exporting BasinScout to Craft CMS format',
        currentDir
      );
    } else {
      console.log('✅ Export files found and current\n');
    }
  }
}

// Check if Craft environment exists
if (!fs.existsSync(craftInstallDir)) {
  console.error(`❌ Craft environment not found: ${craftInstallDir}`);
  console.error('Please create it first: npm run craft-create');
  process.exit(1);
}

console.log('🚀 Starting file deployment...\n');

// Step 1: Run fresh export
runCommand('pnpm craft-export', 'Running fresh BasinScout export', currentDir);

// Step 2: Delete existing BasinScout migrations
console.log('🧹 Deleting existing BasinScout migrations...');
const migrationsDir = path.join(craftInstallDir, 'migrations');
try {
  if (fs.existsSync(migrationsDir)) {
    const existingMigrations = fs.readdirSync(migrationsDir);
    const basinscoutMigrations = existingMigrations.filter(
      (file) => file.includes('basinscout') && file.endsWith('.php')
    );

    basinscoutMigrations.forEach((file) => {
      const filePath = path.join(migrationsDir, file);
      fs.unlinkSync(filePath);
      console.log(`   Deleted: ${file}`);
    });

    if (basinscoutMigrations.length > 0) {
      console.log(
        `✅ Deleted ${basinscoutMigrations.length} existing BasinScout migrations\n`
      );
    } else {
      console.log('✅ No existing BasinScout migrations to delete\n');
    }
  } else {
    console.log('✅ Migrations directory does not exist\n');
  }
} catch (error) {
  console.log(`⚠️  Warning: Could not delete migrations: ${error.message}\n`);
}

// Step 3: Copy contents of dist/craft-cms/migrations
console.log('📂 Copying migration files...');
try {
  if (!fs.existsSync(migrationsSource)) {
    console.log(
      `⚠️  Source migrations directory not found: ${migrationsSource}\n`
    );
  } else {
    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const migrationFiles = fs.readdirSync(migrationsSource);
    migrationFiles.forEach((file) => {
      const sourcePath = path.join(migrationsSource, file);
      const destPath = path.join(migrationsDir, file);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`   Copied: ${file}`);
    });

    console.log(`✅ Copied ${migrationFiles.length} migration files\n`);
  }
} catch (error) {
  console.error(`❌ Failed to copy migrations: ${error.message}\n`);
  process.exit(1);
}

// Step 4: Copy dist/craft-cms/templates/* to craftdir/templates/* (overwriting)
console.log('� Copying template files (overwriting)...');
try {
  if (!fs.existsSync(templatesSource)) {
    console.log(
      `⚠️  Source templates directory not found: ${templatesSource}\n`
    );
  } else {
    const templatesDestination = path.join(craftInstallDir, 'templates');

    // Ensure destination templates directory exists
    if (!fs.existsSync(templatesDestination)) {
      fs.mkdirSync(templatesDestination, { recursive: true });
    }

    const templateFiles = fs.readdirSync(templatesSource);
    templateFiles.forEach((file) => {
      const sourcePath = path.join(templatesSource, file);
      const destPath = path.join(templatesDestination, file);

      if (fs.statSync(sourcePath).isDirectory()) {
        // Recursively copy subdirectories (overwriting)
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true, force: true });
        }
        fs.cpSync(sourcePath, destPath, { recursive: true });
        console.log(`   Copied directory: ${file}`);
      } else {
        // Copy individual files (overwriting)
        fs.copyFileSync(sourcePath, destPath);
        console.log(`   Copied file: ${file}`);
      }
    });

    console.log(`✅ Copied ${templateFiles.length} template items\n`);
  }
} catch (error) {
  console.error(`❌ Failed to copy templates: ${error.message}\n`);
  process.exit(1);
}

// Step 5: Recursively copy dist/craft-cms/web (overwriting matching dirs)
console.log('🌐 Copying web assets (overwriting)...');
try {
  if (!fs.existsSync(webSource)) {
    console.log(`⚠️  Source web directory not found: ${webSource}\n`);
  } else {
    const webDestination = path.join(craftInstallDir, 'web');

    // Ensure destination web directory exists
    if (!fs.existsSync(webDestination)) {
      fs.mkdirSync(webDestination, { recursive: true });
    }

    const webItems = fs.readdirSync(webSource);
    webItems.forEach((item) => {
      const sourcePath = path.join(webSource, item);
      const destPath = path.join(webDestination, item);

      if (fs.statSync(sourcePath).isDirectory()) {
        // Remove existing directory if it exists, then copy
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true, force: true });
        }
        fs.cpSync(sourcePath, destPath, { recursive: true });
        console.log(`   Copied directory: ${item}`);
      } else {
        // Copy individual files (overwriting)
        fs.copyFileSync(sourcePath, destPath);
        console.log(`   Copied file: ${item}`);
      }
    });

    console.log(`✅ Copied ${webItems.length} web items\n`);
  }
} catch (error) {
  console.error(`❌ Failed to copy web assets: ${error.message}\n`);
  process.exit(1);
}

// Step 3: Configure GraphQL route
console.log('🔧 Configuring GraphQL route...');
const routesConfigPath = path.join(craftInstallDir, 'config/routes.php');

try {
  let routesConfig;

  if (fs.existsSync(routesConfigPath)) {
    // Read existing routes file
    routesConfig = fs.readFileSync(routesConfigPath, 'utf8');

    // Check if graphql route already exists
    if (routesConfig.includes("'graphql'")) {
      console.log('✅ GraphQL route already configured\n');
    } else {
      // Find the return array and add graphql route
      if (routesConfig.includes('return [')) {
        // Add to existing return array
        routesConfig = routesConfig.replace(
          /return\s*\[\s*\n?/,
          "return [\n    'graphql' => 'graphql/api',\n"
        );
      } else if (routesConfig.includes('return [];')) {
        // Replace empty return array
        routesConfig = routesConfig.replace(
          'return [];',
          "return [\n    'graphql' => 'graphql/api',\n];"
        );
      } else {
        // Fallback: append to end of file before closing ?>
        routesConfig = routesConfig.replace(
          /(\?\>\s*)?$/,
          "\n// Added by BasinScout deployment\n\$routes['graphql'] = 'graphql/api';\n"
        );
      }

      fs.writeFileSync(routesConfigPath, routesConfig);
      console.log('✅ GraphQL route added to existing configuration\n');
    }
  } else {
    // Create new routes file
    routesConfig = `<?php
/**
 * Site URL Rules
 */

return [
    'graphql' => 'graphql/api',
];
`;
    fs.writeFileSync(routesConfigPath, routesConfig);
    console.log('✅ GraphQL route configuration created\n');
  }
} catch (error) {
  console.error(`❌ Failed to configure GraphQL route: ${error.message}`);
}

// Step 4: Run migrations with debugging
console.log('🔧 Running migrations...');
try {
  runCommand(
    'ddev craft migrate/history',
    'Checking migration history',
    craftInstallDir
  );

  console.log('📋 Listing available migrations...');
  runCommand('ls -la migrations/', 'Showing migration files', craftInstallDir);

  runCommand(
    'ddev craft migrate/up --interactive=0',
    'Running BasinScout migrations',
    craftInstallDir
  );
} catch (error) {
  console.log('⚠️  Migration command failed. Trying alternative approach...');
  console.log(
    'You may need to run migrations manually in the Craft CMS admin panel.'
  );
}

// Final instructions
console.log('🎉 Deployment Complete!');
