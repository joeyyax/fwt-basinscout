<?php

namespace craft\contentmigrations;

use craft\db\Migration;
use craft\fields\Matrix;
use craft\models\EntryType;
use craft\models\FieldLayout;
use craft\models\FieldLayoutTab;
use craft\fieldlayoutelements\CustomField;
use craft\elements\Entry;
use craft\helpers\StringHelper;
use Craft;

class m02_create_basinscout_sections extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp(): bool
    {
        $fieldsService = Craft::$app->getFields();
        $entriesService = Craft::$app->getEntries();
        $projectConfig = Craft::$app->getProjectConfig();

        // Get required entry types (created in previous migration)
        $introPanelEntryType = $entriesService->getEntryTypeByHandle('introPanel');
        $mapPanelEntryType = $entriesService->getEntryTypeByHandle('mapPanel');
        $resultsPanelEntryType = $entriesService->getEntryTypeByHandle('resultsPanel');

        // Create Matrix field for intro panels
        echo "Creating introPanels Matrix field...\n";
        $introPanelsField = $fieldsService->getFieldByHandle('introPanels');
        if (!$introPanelsField) {
            $introPanelsField = $fieldsService->createField([
                'type' => Matrix::class,
                'name' => 'Intro Panels',
                'handle' => 'introPanels',
                'instructions' => 'Content panels for the introduction section',
            ]);

            // Set the matrix field settings
            $introPanelsField->minEntries = 1;
            $introPanelsField->maxEntries = null;
            $introPanelsField->setEntryTypes([$introPanelEntryType]);

            if (!$fieldsService->saveField($introPanelsField)) {
                echo "Failed to create introPanels Matrix field\n";
                return false;
            }
        }

        // Create Matrix field for map panels
        echo "Creating mapPanels Matrix field...\n";
        $mapPanelsField = $fieldsService->getFieldByHandle('mapPanels');
        if (!$mapPanelsField) {
            $mapPanelsField = $fieldsService->createField([
                'type' => Matrix::class,
                'name' => 'Map Panels',
                'handle' => 'mapPanels',
                'instructions' => 'Interactive map panels for the map section',
            ]);

            // Set the matrix field settings
            $mapPanelsField->minEntries = 1;
            $mapPanelsField->maxEntries = null;
            $mapPanelsField->setEntryTypes([$mapPanelEntryType]);

            if (!$fieldsService->saveField($mapPanelsField)) {
                echo "Failed to create mapPanels Matrix field\n";
                return false;
            }
        }

        // Create Matrix field for results panels
        echo "Creating resultsPanels Matrix field...\n";
        $resultsPanelsField = $fieldsService->getFieldByHandle('resultsPanels');
        if (!$resultsPanelsField) {
            $resultsPanelsField = $fieldsService->createField([
                'type' => Matrix::class,
                'name' => 'Results Panels',
                'handle' => 'resultsPanels',
                'instructions' => 'Content panels for the results section',
            ]);

            // Set the matrix field settings
            $resultsPanelsField->minEntries = 1;
            $resultsPanelsField->maxEntries = null;
            $resultsPanelsField->setEntryTypes([$resultsPanelEntryType]);

            if (!$fieldsService->saveField($resultsPanelsField)) {
                echo "Failed to create resultsPanels Matrix field\n";
                return false;
            }
        }

        // Create the main BasinScout entry type with organized tabs
        echo "Creating BasinScout entry type...\n";
        $basinScoutEntryType = $entriesService->getEntryTypeByHandle('basinScout');
        if (!$basinScoutEntryType) {
            $basinScoutEntryType = new EntryType([
                'name' => 'BasinScout',
                'handle' => 'basinScout',
                'hasTitleField' => true,
            ]);
        } else {
            echo "BasinScout entry type already exists, updating...\n";
        }

        $basinScoutFieldLayout = new FieldLayout();
        $basinScoutFieldLayout->type = Entry::class;

        // Header Tab
        $headerTab = new FieldLayoutTab([
            'name' => 'Header',
            'layout' => $basinScoutFieldLayout,
        ]);

        $headerLogoCustomField = new CustomField();
        $headerLogoCustomField->setFieldUid($fieldsService->getFieldByHandle('headerLogo')->uid);

        $headerLogoAltCustomField = new CustomField();
        $headerLogoAltCustomField->setFieldUid($fieldsService->getFieldByHandle('headerLogoAlt')->uid);

        $headerHomeUrlCustomField = new CustomField();
        $headerHomeUrlCustomField->setFieldUid($fieldsService->getFieldByHandle('headerHomeUrl')->uid);

        $headerCtaTextCustomField = new CustomField();
        $headerCtaTextCustomField->setFieldUid($fieldsService->getFieldByHandle('headerCtaText')->uid);

        $headerCtaUrlCustomField = new CustomField();
        $headerCtaUrlCustomField->setFieldUid($fieldsService->getFieldByHandle('headerCtaUrl')->uid);

        $headerTab->setElements([
            $headerLogoCustomField,
            $headerLogoAltCustomField,
            $headerHomeUrlCustomField,
            $headerCtaTextCustomField,
            $headerCtaUrlCustomField,
        ]);

        // Intro Tab
        $introTab = new FieldLayoutTab([
            'name' => 'Intro',
            'layout' => $basinScoutFieldLayout,
        ]);

        $introTitleCustomField = new CustomField();
        $introTitleCustomField->setFieldUid($fieldsService->getFieldByHandle('introTitle')->uid);

        $introBackgroundImageCustomField = new CustomField();
        $introBackgroundImageCustomField->setFieldUid($fieldsService->getFieldByHandle('introBackgroundImage')->uid);

        $introPanelsCustomField = new CustomField();
        $introPanelsCustomField->setFieldUid($introPanelsField->uid);

        $introTab->setElements([
            $introTitleCustomField,
            $introBackgroundImageCustomField,
            $introPanelsCustomField,
        ]);

        // Map Tab
        $mapTab = new FieldLayoutTab([
            'name' => 'Map',
            'layout' => $basinScoutFieldLayout,
        ]);

        $mapTitleCustomField = new CustomField();
        $mapTitleCustomField->setFieldUid($fieldsService->getFieldByHandle('mapTitle')->uid);

        $mapBackgroundImageCustomField = new CustomField();
        $mapBackgroundImageCustomField->setFieldUid($fieldsService->getFieldByHandle('mapBackgroundImage')->uid);

        $mapPanelsCustomField = new CustomField();
        $mapPanelsCustomField->setFieldUid($mapPanelsField->uid);

        $mapTab->setElements([
            $mapTitleCustomField,
            $mapBackgroundImageCustomField,
            $mapPanelsCustomField,
        ]);

        // Results Tab
        $resultsTab = new FieldLayoutTab([
            'name' => 'Results',
            'layout' => $basinScoutFieldLayout,
        ]);

        $resultsTitleCustomField = new CustomField();
        $resultsTitleCustomField->setFieldUid($fieldsService->getFieldByHandle('resultsTitle')->uid);

        $resultsBackgroundImageCustomField = new CustomField();
        $resultsBackgroundImageCustomField->setFieldUid($fieldsService->getFieldByHandle('resultsBackgroundImage')->uid);

        $resultsPanelsCustomField = new CustomField();
        $resultsPanelsCustomField->setFieldUid($resultsPanelsField->uid);

        $resultsTab->setElements([
            $resultsTitleCustomField,
            $resultsBackgroundImageCustomField,
            $resultsPanelsCustomField,
        ]);

        // Set all tabs on the field layout
        $basinScoutFieldLayout->setTabs([
            $headerTab,
            $introTab,
            $mapTab,
            $resultsTab,
        ]);

        $basinScoutEntryType->setFieldLayout($basinScoutFieldLayout);

        if (!$entriesService->saveEntryType($basinScoutEntryType)) {
            echo "Failed to save BasinScout entry type\n";
            $errors = $basinScoutEntryType->getErrors();
            if (!empty($errors)) {
                echo "Entry type errors:\n";
                foreach ($errors as $field => $fieldErrors) {
                    foreach ($fieldErrors as $error) {
                        echo "  - {$field}: {$error}\n";
                    }
                }
            }
            return false;
        }

        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown(): bool
    {
        $fieldsService = Craft::$app->getFields();

        echo "Note: You may need to manually delete the BasinScout section if it was created.\n";

        // Delete Matrix fields
        $matrixFieldHandles = [
            'introPanels',
            'mapPanels',
            'resultsPanels',
        ];

        foreach ($matrixFieldHandles as $handle) {
            $field = $fieldsService->getFieldByHandle($handle);
            if ($field) {
                $fieldsService->deleteField($field);
            }
        }

        return true;
    }
}
