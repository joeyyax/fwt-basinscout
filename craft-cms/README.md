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
└── migrations/                      # Migration files
```

## Test Installation

This is mostly for testing the export functionality. It will create a new Craft CMS install using ddev, run the export and deploy the export.

```bash
pnpm craft-create
pnpm craft-deploy
```

If any changes were made to the source, you can re-run `pnpm craft-deploy` to update the craft install autoimatically.

Once testing is complete, you can destroy the test installation:

```bash
pnpm craft-destroy
```

## Production Installation

To integrate with an existing Craft CMS installation:

### 1. Install CKEditor Plugin if it doesn't already exist (Required)

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

### 2. Generate & Move Files

Note: This assumes you have a Craft CMS installation ready and the BasinScout Preact app is built and ready to export.

First, generate the export files:

```bash
# Build and export for Craft CMS
pnpm craft-export
```

Copy the exported files from `dist/craft-cms/` into your Craft CMS installation:

```bash
# Copy template
cp dist/craft-cms/templates/basinscout* /path/to/craft/templates/
# Copy assets
cp -r dist/craft-cms/web/basinscout-* /path/to/craft/web/
# Copy migrations (optional - for future CMS integration)
cp dist/craft-cms/migrations/*basinscout* /path/to/craft/migrations/
```

### 3. Run Migrations

```bash
php craft migrate/up
# Or if using DDEV
ddev exec php craft migrate/up
```

### 4. Setup the BasinScout Section

After running the migrations, you need to manually create a Single section in Craft CMS (I tried automating this but it was problematic. Fortunately it's a quick and simple process):

1. Go to **Settings > Sections** in the Craft CMS admin
2. Click **+ New section**
3. Choose **Single** as the section type
4. Configure the section:
   - **Name**: BasinScout
   - **Handle**: basinscout
   - **Entry Type**: BasinScout
   - **URI Format**: basinscout
   - **Template**: basinscout
5. Save the section

This will create all the BasinScout fields and sections in Craft CMS.

### 5. Configure GraphQL

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
// config/routes.php
return [
    // ... other routes
    'graphql' => 'graphql/api',
];
```

**Note**: If you're using a different GraphQL route, the production app will automatically use your CraftCMS base URL with whatever route you configure.

### 6. Ensure uploads are configured

There are file fields contained in the migration. It's likely these will need to be configured to match your craft install. These will mean touching each of those fields and ensuring they are set to the correct upload directory. You'll know it works if the upload fields appear as fields instead of errors.

### 7. Create BasinScout Entry

1. Go to **Entries** in your Craft control panel
2. The migration will have created a "BasinScout" section (Single type)
3. Edit the BasinScout entry - it will have tabs for Header, Intro, Map, and Results
4. Fill in the content fields in each tab as needed
5. Publish the entry

## Troubleshooting

**GraphQL connection issues**

- Verify the route configuration in `config/routes.php` includes `'graphql' => 'graphql/api'`
- Check that GraphQL is enabled in Craft CMS Settings → GraphQL
- Ensure the public GraphQL schema includes BasinScout and assets permissions
- Test GraphQL endpoint directly: `https://yoursite.com/graphql`

**Assets not loading**

- Verify the `/basinscout-assets/` and `/basinscout-img/` directories exist in your web directory
- Check file permissions on the assets
- Ensure the template paths are correct

**Template not found**

- Ensure `basinscout.twig` is in your templates directory
- Check template permissions
- Verify Craft template caching is cleared `php craft clear-caches/all` or `ddev exec php craft clear-caches/all`
