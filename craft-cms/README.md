# BasinScout Craft CMS Integration

This package contains all necessary files to integrate the BasinScout interactive Preact application into your Craft CMS project.

## Overview

The BasinScout export creates a self-contained package that runs the existing Preact application exactly as it does in development. No complex CMS integration required - copy the files and use the template.

## File Structure

The export creates this Craft CMS structure:

```
dist/craft-cms/
├── BASINSCOUT_README.md             # Installation and usage guide
├── templates/
│   └── basinscout.twig              # Self-contained template
├── web/
│   ├── basinscout-assets/           # CSS and JS files
│   └── basinscout-img/              # Image assets
└── migrations/                      # Future CMS integration
    └── m{YYMMDD}_{HHMMSS}_create_basinscout_fields.php
```

## Installation

### 1. Install Dependencies

From the BasinScout project directory:

```bash
# Install dependencies
pnpm install
# or
npm install
```

### 2. Generate Export

From the BasinScout project directory:

```bash
# Build and export for Craft CMS
pnpm run craft-export
# or
npm run craft-export
```

This creates the `dist/craft-cms/` directory with the proper Craft structure.

### 3. Copy Files to Craft CMS

Copy the exported files to your Craft CMS installation:

```bash
# Copy template
cp dist/craft-cms/templates/basinscout.twig /path/to/craft/templates/

# Copy assets
cp -r dist/craft-cms/web/basinscout-assets /path/to/craft/web/
cp -r dist/craft-cms/web/basinscout-img /path/to/craft/web/

# Copy migrations (optional - for future CMS integration)
cp dist/craft-cms/migrations/* /path/to/craft/migrations/
```

### 4. Install CKEditor Plugin (Required)

Install the CKEditor plugin for content management:

```bash
# Navigate to your Craft CMS directory
cd /path/to/craft

# Install CKEditor plugin
composer require craftcms/ckeditor

# Or if using DDEV
ddev composer require craftcms/ckeditor
```

Then enable the CKEditor plugin:

1. Go to **Settings → Plugins** in your Craft control panel
2. Find "CKEditor" and click **Install**

### 5. Run Migration (Required)

Run the migration to create the BasinScout field structure:

```bash
# Navigate to your Craft CMS directory
cd /path/to/craft

# Run the migration
./craft migrate/up

# Or if using DDEV
ddev exec php craft migrate/up
```

This will create all the BasinScout fields and sections in Craft CMS.

### 6. Configure GraphQL

Enable GraphQL in your Craft CMS installation and configure the route:

1. **Enable GraphQL**: Go to **Settings → GraphQL** in your Craft control panel and enable GraphQL if not already enabled.

2. **Configure Public Schema**: Ensure you have a public GraphQL schema configured:

   - Go to **Settings → GraphQL → Schemas**
   - Create or edit the "Public Schema"
   - Under **Scope**, enable access to:
     - **BasinScout entries** (read access)
     - **Assets** (read access)
   - Note: Edit permissions are not required - BasinScout only reads content

3. **Add GraphQL Route**: Add the GraphQL route configuration to your Craft CMS routes file (if not already present):

**In `/path/to/craft/config/routes.php`:**

```php
<?php
/**
 * Site URL Rules
 */

return [
    'graphql' => 'graphql/api',
];
```

**Note**: If you're using a different GraphQL route, the production app will automatically use your CraftCMS base URL with whatever route you configure.

### 7. Create BasinScout Entry

1. Go to **Entries** in your Craft control panel
2. The migration will have created a "BasinScout" section
3. Create a new entry in the BasinScout section
4. Fill in the content fields as needed
5. Publish the entry

## Troubleshooting

### Common Issues

**GraphQL connection issues**

- Verify the route configuration in `config/routes.php` includes `'graphql' => 'graphql/api'`
- Check that GraphQL is enabled in Craft CMS Settings → GraphQL
- Ensure the public GraphQL schema includes BasinScout section permissions
- Test GraphQL endpoint directly: `https://yoursite.com/graphql`

**Assets not loading**

- Verify the `/basinscout-assets/` and `/basinscout-img/` directories exist in your web directory
- Check file permissions on the assets
- Ensure the template paths are correct

**Template not found**

- Ensure `basinscout.twig` is in your templates directory
- Check template permissions
- Verify Craft template caching is cleared
