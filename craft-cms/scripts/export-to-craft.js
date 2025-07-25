#!/usr/bin/env node

/**
 * Export to Craft CMS Script
 *
 * This script compiles and bundles the BasinScout project for Craft CMS integration.
 * It builds optimized assets and creates the necessary template structure.
 *
 * Usage: npm run export
 */

/* eslint-disable no-console */
/* global process */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

// Configuration
const CONFIG = {
  buildDir: path.join(projectRoot, 'dist', 'html'),
  exportDir: path.join(projectRoot, 'dist', 'craft-cms'),
  templateDir: path.join(projectRoot, 'dist', 'craft-cms', 'templates'),
  assetsDir: path.join(projectRoot, 'dist', 'craft-cms', 'web', 'assets'),
  migrationDir: path.join(projectRoot, 'dist', 'craft-cms', 'migrations'),
};

console.log('🚀 Starting BasinScout Craft CMS Export...\n');

/**
 * Clean and create export directories
 */
function setupDirectories() {
  console.log('📁 Setting up export directories...');

  // Remove existing export directory
  if (fs.existsSync(CONFIG.exportDir)) {
    fs.rmSync(CONFIG.exportDir, { recursive: true, force: true });
  }

  // Create directory structure
  fs.mkdirSync(CONFIG.exportDir, { recursive: true });
  fs.mkdirSync(CONFIG.templateDir, { recursive: true });
  fs.mkdirSync(CONFIG.assetsDir, { recursive: true });
  fs.mkdirSync(CONFIG.migrationDir, { recursive: true });

  console.log('✅ Directories created\n');
}

/**
 * Build the project using Vite
 */
function buildProject() {
  console.log('🔨 Building project with Vite...');

  try {
    execSync('pnpm run build', {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    console.log('✅ Build completed\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}

/**
 * Copy and transform the main HTML template
 */
function createCraftTemplate() {
  console.log('📝 Creating Craft template...');

  const htmlPath = path.join(CONFIG.buildDir, 'index.html');

  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Built HTML file not found');
    throw new Error('Built HTML file not found');
  }

  let html = fs.readFileSync(htmlPath, 'utf8');

  // Transform HTML for Craft CMS
  html = transformHtmlForCraft(html);

  // Write the Craft template
  const templatePath = path.join(CONFIG.templateDir, 'basinscout.twig');
  fs.writeFileSync(templatePath, html);

  console.log('✅ Craft template created: templates/basinscout.twig\n');
}

/**
 * Transform HTML content for Craft CMS
 */
function transformHtmlForCraft(html) {
  // Add Craft header
  let craftHtml = `{#
/**
 * BasinScout Template
 *
 * This template displays the interactive BasinScout experience.
 * Generated from the standalone build on ${new Date().toISOString()}
 *
 * Required Fields:
 * - introTitle (Plain Text)
 * - introBody (Rich Text)
 * - introStats (Matrix)
 * - introBg (Asset)
 * - panels (Matrix)
 * - resultsTitle (Plain Text)
 * - resultsBody (Rich Text)
 * - resultsBg (Asset)
 * - settings (Global)
 */
#}

{% extends "_layout" %}

{% block content %}
`;

  // Replace static content with Craft field references
  html = html
    // Replace intro section title
    .replace(
      /<h1[^>]*id="section-1-title"[^>]*>.*?<\/h1>/s,
      '<h1 id="section-1-title">{{ entry.introTitle }}</h1>'
    )
    // Replace intro section body
    .replace(
      /<h2>Turning Data into Action and Action into Sustainability<\/h2>/,
      '{{ entry.introBody|raw }}'
    )
    // Replace static stats with dynamic ones
    .replace(
      /<div class="stats-container"[^>]*>.*?<\/div>/s,
      generateStatsTemplate()
    )
    // Replace panel content
    .replace(
      /<div class="panels-container"[^>]*>.*?<\/div>/s,
      generatePanelsTemplate()
    )
    // Replace results section
    .replace(
      /<section[^>]*id="results"[^>]*>.*?<\/section>/s,
      generateResultsTemplate()
    )
    // Replace background images with Craft assets
    .replace(
      /data-background="\/img\/bg\/([^"]+)"/g,
      'data-background="{{ entry.introBg.one().url ?? \'/img/bg/$1\' }}"'
    )
    // Replace static settings with Craft globals
    .replace(
      /data-scroll-prompt-delay="[^"]*"/g,
      'data-scroll-prompt-delay="{{ settings.scrollPromptDelay ?? 3 }}"'
    );

  craftHtml += html;
  craftHtml += '\n{% endblock %}';

  return craftHtml;
}

/**
 * Generate Craft template for stats section
 */
function generateStatsTemplate() {
  return `<div class="stats-container">
  {% for stat in entry.introStats.all() %}
    <div class="stat-item" data-value="{{ stat.value }}" data-label="{{ stat.label }}">
      {% if stat.showDonut %}
        <div class="donut-chart" data-percentage="{{ stat.value }}"></div>
      {% endif %}
      <div class="stat-content">
        <div class="stat-number">{{ stat.value }}%</div>
        <div class="stat-label">{{ stat.label }}</div>
        {% if stat.description %}
          <div class="stat-description">{{ stat.description }}</div>
        {% endif %}
      </div>
    </div>
  {% endfor %}
</div>`;
}

/**
 * Generate Craft template for panels section
 */
function generatePanelsTemplate() {
  return `<div class="panels-container" data-panel-border="true">
  {% for panel in entry.panels.all() %}
    <div class="panel"{% if panel.title %} data-title="{{ panel.title }}"{% endif %}>
      <div class="prose">
        {{ panel.copy|raw }}

        {% if panel.stats|length %}
          <div class="panel-stats">
            {% for stat in panel.stats.all() %}
              <div class="stat-item">
                <img src="{{ stat.image.one().url }}" alt="{{ stat.label }}" />
                <span>{{ stat.label }}</span>
              </div>
            {% endfor %}
          </div>
        {% endif %}

        {% if panel.mapImage %}
          <div class="map-container">
            <img src="{{ panel.mapImage.one().url }}" alt="Map for {{ panel.title }}" />
            {% if panel.markers|length %}
              {% for marker in panel.markers.all() %}
                <div class="marker"
                     data-type="{{ marker.type }}"
                     style="left: {{ marker.x }}%; top: {{ marker.y }}%;">
                  {{ marker.label }}
                </div>
              {% endfor %}
            {% endif %}
          </div>
        {% endif %}
      </div>
    </div>
  {% endfor %}
</div>`;
}

/**
 * Generate Craft template for results section
 */
function generateResultsTemplate() {
  return `<section id="results" class="section section-results"
         data-background="{{ entry.resultsBg.one().url ?? '/img/bg/default-results.jpg' }}"
         data-background-scale="1.2 1.0"
         data-background-opacity="0 0.8"
         aria-labelledby="results-title">
  <div class="container">
    <div class="title-wrapper">
      <h1 id="results-title">{{ entry.resultsTitle }}</h1>
    </div>
    <div class="content-wrapper">
      <div class="prose">
        {{ entry.resultsBody|raw }}
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Copy built assets to export directory
 */
function copyAssets() {
  console.log('📦 Copying built assets...');

  const assetsSource = path.join(CONFIG.buildDir, 'assets');

  if (fs.existsSync(assetsSource)) {
    fs.cpSync(assetsSource, CONFIG.assetsDir, { recursive: true });
    console.log('✅ Assets copied\n');
  } else {
    console.log('⚠️  No assets directory found in build\n');
  }

  // Copy images
  const imagesSource = path.join(projectRoot, 'public', 'img');
  const imagesTarget = path.join(CONFIG.exportDir, 'web', 'img');

  if (fs.existsSync(imagesSource)) {
    fs.cpSync(imagesSource, imagesTarget, { recursive: true });
    console.log('✅ Images copied\n');
  }
}

/**
 * Create Craft CMS migration file
 */
function createMigration() {
  console.log('🗄️  Creating Craft migration...');

  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
  const migrationContent = generateMigrationContent();
  const migrationPath = path.join(
    CONFIG.migrationDir,
    `m${timestamp}_basinscout_fields.php`
  );

  fs.writeFileSync(migrationPath, migrationContent);

  console.log('✅ Migration created\n');
}

/**
 * Generate Craft CMS migration content
 */
function generateMigrationContent() {
  return `<?php

namespace craft\\migrations;

use Craft;
use craft\\db\\Migration;
use craft\\fields\\Assets;
use craft\\fields\\Matrix;
use craft\\fields\\Number;
use craft\\fields\\PlainText;
use craft\\fields\\Redactor;
use craft\\fields\\Lightswitch;

/**
 * BasinScout Fields Migration
 *
 * Creates all necessary fields for the BasinScout CMS integration.
 * Generated on ${new Date().toISOString()}
 */
class m${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14)}_basinscout_fields extends Migration
{
    public function safeUp()
    {
        // Create field group
        $fieldsService = Craft::$app->getFields();
        $group = $fieldsService->createGroup([
            'name' => 'BasinScout'
        ]);

        // Intro Title Field
        $fieldsService->createField([
            'type' => PlainText::class,
            'name' => 'Intro Title',
            'handle' => 'introTitle',
            'groupId' => $group->id,
            'settings' => [
                'placeholder' => 'BasinScout®',
                'charLimit' => 100
            ]
        ]);

        // Intro Body Field
        $fieldsService->createField([
            'type' => Redactor::class,
            'name' => 'Intro Body',
            'handle' => 'introBody',
            'groupId' => $group->id,
            'settings' => [
                'redactorConfig' => 'Simple.json'
            ]
        ]);

        // Stats Matrix Field
        $statsMatrix = $fieldsService->createField([
            'type' => Matrix::class,
            'name' => 'Intro Stats',
            'handle' => 'introStats',
            'groupId' => $group->id
        ]);

        // Add stats block type
        $fieldsService->createMatrixBlockType([
            'fieldId' => $statsMatrix->id,
            'name' => 'Stat',
            'handle' => 'stat',
            'fields' => [
                [
                    'type' => Number::class,
                    'name' => 'Value',
                    'handle' => 'value',
                    'settings' => ['min' => 0, 'max' => 100]
                ],
                [
                    'type' => PlainText::class,
                    'name' => 'Label',
                    'handle' => 'label'
                ],
                [
                    'type' => PlainText::class,
                    'name' => 'Description',
                    'handle' => 'description'
                ],
                [
                    'type' => Lightswitch::class,
                    'name' => 'Show Donut',
                    'handle' => 'showDonut',
                    'settings' => ['default' => true]
                ]
            ]
        ]);

        // Background Image Field
        $fieldsService->createField([
            'type' => Assets::class,
            'name' => 'Intro Background',
            'handle' => 'introBg',
            'groupId' => $group->id,
            'settings' => [
                'useSingleFolder' => true,
                'defaultUploadLocationSource' => 'folder:backgrounds',
                'limit' => 1,
                'allowedKinds' => ['image']
            ]
        ]);

        // Panels Matrix Field
        $panelsMatrix = $fieldsService->createField([
            'type' => Matrix::class,
            'name' => 'Panels',
            'handle' => 'panels',
            'groupId' => $group->id
        ]);

        // Add panel block type
        $fieldsService->createMatrixBlockType([
            'fieldId' => $panelsMatrix->id,
            'name' => 'Panel',
            'handle' => 'panel',
            'fields' => [
                [
                    'type' => PlainText::class,
                    'name' => 'Title',
                    'handle' => 'title'
                ],
                [
                    'type' => Redactor::class,
                    'name' => 'Copy',
                    'handle' => 'copy'
                ],
                [
                    'type' => Assets::class,
                    'name' => 'Map Image',
                    'handle' => 'mapImage',
                    'settings' => ['limit' => 1, 'allowedKinds' => ['image']]
                ]
            ]
        ]);

        // Results Title Field
        $fieldsService->createField([
            'type' => PlainText::class,
            'name' => 'Results Title',
            'handle' => 'resultsTitle',
            'groupId' => $group->id
        ]);

        // Results Body Field
        $fieldsService->createField([
            'type' => Redactor::class,
            'name' => 'Results Body',
            'handle' => 'resultsBody',
            'groupId' => $group->id
        ]);

        // Results Background Field
        $fieldsService->createField([
            'type' => Assets::class,
            'name' => 'Results Background',
            'handle' => 'resultsBg',
            'groupId' => $group->id,
            'settings' => [
                'limit' => 1,
                'allowedKinds' => ['image']
            ]
        ]);

        return true;
    }

    public function safeDown()
    {
        // Remove all BasinScout fields
        $fieldsService = Craft::$app->getFields();
        $group = $fieldsService->getGroupByName('BasinScout');

        if ($group) {
            $fields = $fieldsService->getFieldsByGroupId($group->id);
            foreach ($fields as $field) {
                $fieldsService->deleteField($field);
            }
            $fieldsService->deleteGroup($group);
        }

        return true;
    }
}`;
}

/**
 * Create documentation files
 */
function createDocumentation() {
  console.log('📖 Creating documentation...');

  // Copy README from craft-cms directory
  const craftCmsReadmePath = path.join(projectRoot, 'craft-cms', 'README.md');
  const exportReadmePath = path.join(CONFIG.exportDir, 'README.md');

  if (fs.existsSync(craftCmsReadmePath)) {
    fs.copyFileSync(craftCmsReadmePath, exportReadmePath);
  } else {
    console.warn('⚠️ craft-cms/README.md not found, skipping README copy');
  }

  // Create package info
  const packageInfo = {
    name: 'basinscout-craft-export',
    version: '1.0.0',
    description: 'BasinScout Craft CMS Integration Export',
    generated: new Date().toISOString(),
    requirements: {
      craftcms: '^4.0',
      php: '^8.0',
    },
  };

  fs.writeFileSync(
    path.join(CONFIG.exportDir, 'package.json'),
    JSON.stringify(packageInfo, null, 2)
  );

  console.log('✅ Documentation created\n');
}

/**
 * Main export function
 */
function main() {
  try {
    setupDirectories();
    buildProject();
    createCraftTemplate();
    copyAssets();
    createMigration();
    createDocumentation();

    console.log('🎉 BasinScout Craft CMS export completed successfully!');
    console.log(`📁 Export location: ${CONFIG.exportDir}`);
    console.log('\nNext steps:');
    console.log('1. Copy files to your Craft CMS project');
    console.log('2. Run the migration to create fields');
    console.log('3. Create content and test the integration');
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run the export
main();
