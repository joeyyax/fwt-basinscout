#!/usr/bin/env node

/**
 * BasinScout Craft CMS Export Script
 * Copies the built app and converts index.html to basinscout.twig
 */

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../../dist/html');
const outputDir = path.resolve(__dirname, '../../dist/craft-cms');

console.log('🚀 Exporting to Craft CMS...\n');

/**
 * Copy all built assets (CSS, JS, images) to separate web directories
 */
function copyAssets() {
  console.log(
    '📂 Copying built assets to web/basinscout-assets/ and web/basinscout-img/...'
  );

  // Create web directories for public assets
  const webAssetsDir = path.join(outputDir, 'web', 'basinscout-assets');
  const webImgDir = path.join(outputDir, 'web', 'basinscout-img');

  fs.mkdirSync(webAssetsDir, { recursive: true });
  fs.mkdirSync(webImgDir, { recursive: true });

  // Copy everything except index.html
  const items = fs.readdirSync(sourceDir);

  for (const item of items) {
    if (item === 'index.html') continue;

    const srcPath = path.join(sourceDir, item);

    if (item === 'img') {
      // Copy img directory to basinscout-img/
      const destPath = webImgDir;
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`  ✓ Copied: ${item} -> web/basinscout-img/`);
      }
    } else {
      // Copy other assets (CSS, JS, etc.) to basinscout-assets/
      const destPath = path.join(webAssetsDir, item);
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`  ✓ Copied: ${item} -> web/basinscout-assets/${item}`);
    }
  }
}

/**
 * Convert index.html to basinscout.twig and place in templates/
 */
function generateTwigTemplate() {
  console.log('📄 Converting index.html to basinscout.twig...');

  // Create templates directory
  const templatesDir = path.join(outputDir, 'templates');
  fs.mkdirSync(templatesDir, { recursive: true });

  const indexPath = path.join(sourceDir, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Update asset paths to use separate basinscout-assets/ and basinscout-img/ directories
  html = html.replace(/href="\/assets\//g, 'href="/basinscout-assets/assets/');
  html = html.replace(/src="\/assets\//g, 'src="/basinscout-assets/assets/');
  html = html.replace(/href="\/img\//g, 'href="/basinscout-img/');
  html = html.replace(/src="\/img\//g, 'src="/basinscout-img/');

  // Add GraphQL configuration script before closing head tag
  const graphqlConfig = `    <script>
      // BasinScout GraphQL Configuration
      window.BASINSCOUT_CONFIG = {
        graphqlEndpoint: '{{ craft.app.request.baseUrl }}/api/graphql',
        siteUrl: '{{ craft.app.request.baseUrl }}',
        isDev: {{ craft.app.env == 'dev' ? 'true' : 'false' }}
      };
    </script>`;

  html = html.replace('</head>', `${graphqlConfig}\n  </head>`);

  fs.writeFileSync(path.join(templatesDir, 'basinscout.twig'), html);
  console.log(
    '  ✓ Generated: templates/basinscout.twig (with updated asset paths and GraphQL config)'
  );
}

/**
 * Copy README as BASINSCOUT_README.md
 */
function copyReadme() {
  console.log('📖 Copying README...');

  const readmeSourcePath = path.resolve(__dirname, '../README.md');
  const readmeDestPath = path.join(outputDir, 'BASINSCOUT_README.md');

  if (fs.existsSync(readmeSourcePath)) {
    fs.copyFileSync(readmeSourcePath, readmeDestPath);
    console.log('  ✓ Copied: README.md -> BASINSCOUT_README.md');
  } else {
    console.log('  ⚠ No README.md found');
  }
}

/**
 * Copy migrations directory with dynamic timestamp
 */
function copyMigrations() {
  console.log('📄 Copying migrations...');

  const migrationsSourceDir = path.resolve(__dirname, '../migrations');
  const migrationsDestDir = path.join(outputDir, 'migrations');

  if (fs.existsSync(migrationsSourceDir)) {
    fs.mkdirSync(migrationsDestDir, { recursive: true });

    // Define the migration files in order with their proper names
    const migrationFiles = [
      'm00_create_basinscout_fields.php',
      'm01_create_basinscout_entry_types.php',
      'm02_create_basinscout_sections.php',
    ];

    // Generate timestamp for migration filenames
    const now = new Date();
    const yymmdd =
      now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const hhmmss =
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    migrationFiles.forEach((file) => {
      const sourcePath = path.join(migrationsSourceDir, file);

      if (fs.existsSync(sourcePath)) {
        // Extract the prefix and name from m00_name.php format
        const match = file.match(/^(m\d+)_(.+)\.php$/);
        if (match) {
          const [, prefix, name] = match;
          const newFileName = `m${yymmdd}_${hhmmss}_${prefix.slice(1)}_${name}.php`;
          const destPath = path.join(migrationsDestDir, newFileName);

          // Read the file content and update the class name
          let fileContent = fs.readFileSync(sourcePath, 'utf8');
          const originalClassName = file.replace('.php', '');
          const newClassName = `m${yymmdd}_${hhmmss}_${prefix.slice(1)}_${name}`;

          // Add namespace for Craft CMS content migrations (if not already present)
          if (!fileContent.includes('namespace craft\\contentmigrations;')) {
            fileContent = fileContent.replace(
              /^<\?php\s*$/m,
              `<?php

namespace craft\\contentmigrations;`
            );
          }

          // Replace the class name to match the new filename
          fileContent = fileContent.replace(
            `class ${originalClassName} extends Migration`,
            `class ${newClassName} extends Migration`
          );

          // Replace any comment references to the old class name
          fileContent = fileContent.replace(
            new RegExp(`\\* ${originalClassName} migration\\.`, 'g'),
            `* ${newClassName} migration.`
          );

          fs.writeFileSync(destPath, fileContent);
          console.log(`  ✓ Copied: ${file} -> ${newFileName}`);
        }
      } else {
        console.log(`  ⚠ Migration file not found: ${file}`);
      }
    });
  } else {
    console.log('  ⚠ No migrations directory found');
  }
}

// Run the export
try {
  // Clean output directory
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  // Copy all built assets
  copyAssets();

  // Copy migrations
  copyMigrations();

  // Copy README
  copyReadme();

  // Convert index.html to basinscout.twig
  generateTwigTemplate();

  console.log('\n✅ Export completed!');
  console.log(`📂 Output: ${outputDir}`);
  console.log('\nCraft CMS Structure:');
  console.log('  templates/basinscout.twig    - Your Craft template');
  console.log('  web/basinscout-assets/       - CSS and JS files');
  console.log('  web/basinscout-img/          - Image assets');
  console.log('  migrations/                  - Craft CMS field definitions');
  console.log('  BASINSCOUT_README.md         - Installation and usage guide');
  console.log('\nUsage:');
  console.log('  1. Copy templates/ to your Craft CMS templates directory');
  console.log('  2. Copy web/ contents to your Craft CMS web directory');
  console.log('  3. Copy migrations/ to your Craft CMS migrations directory');
  console.log('  4. Run migrations in Craft CMS to create fields');
  console.log('  5. Create a section/entry that uses the basinscout template');
  console.log('  6. See BASINSCOUT_README.md for detailed instructions');
} catch (error) {
  console.error('❌ Export failed:', error.message);
}
