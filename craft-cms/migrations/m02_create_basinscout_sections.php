<?php

namespace craft\contentmigrations;

use craft\db\Migration;
use craft\fields\Matrix;
use craft\models\EntryType;
use craft\models\FieldLayout;
use craft\models\FieldLayoutTab;
use craft\fieldlayoutelements\CustomField;
use craft\elements\Entry;
use Craft;

class m02_create_basinscout_sections extends Migration
{
    /**
     * Helper function to create or update a matrix field
     */
    private function createOrUpdateMatrixField($fieldsService, $config)
    {
        $field = $fieldsService->getFieldByHandle($config['handle']);
        if (!$field) {
            // Create the field without settings first
            $fieldConfig = $config;
            unset($fieldConfig['settings']); // Remove settings for initial creation

            $field = $fieldsService->createField($fieldConfig);
            if (!$fieldsService->saveField($field)) {
                throw new \Exception("Failed to save matrix field '{$config['handle']}'");
            }

            // Now update the field with settings if provided
            if (isset($config['settings'])) {
                foreach ($config['settings'] as $key => $value) {
                    if ($key !== 'entryTypes') { // Skip entryTypes as it needs special handling
                        $field->$key = $value;
                    }
                }
                $fieldsService->saveField($field);
            }
        } else {
            echo "Matrix field '{$config['handle']}' already exists, skipping\n";
        }

        return $field;
    }

    /**
     * @inheritdoc
     */
    public function safeUp(): bool
    {
        $fieldsService = Craft::$app->getFields();
        $entriesService = Craft::$app->getEntries();

        // Get required entry types (created in previous migration)
        $introPanelEntryType = $entriesService->getEntryTypeByHandle('introPanel');
        $mapPanelEntryType = $entriesService->getEntryTypeByHandle('mapPanel');
        $resultsPanelEntryType = $entriesService->getEntryTypeByHandle('resultsPanel');

        // Create Matrix field for intro panels
        $introPanelsField = $this->createOrUpdateMatrixField($fieldsService, [
            'type' => Matrix::class,
            'name' => 'Panels',
            'handle' => 'introPanels',
            'instructions' => 'Repeatable panels for the introduction section',
            'settings' => [
                'minEntries' => 1,
                'maxEntries' => null,
                'entryTypes' => [$introPanelEntryType->uid],
            ],
        ]);

        // Create Matrix field for map panels
        $mapPanelsField = $this->createOrUpdateMatrixField($fieldsService, [
            'type' => Matrix::class,
            'name' => 'Panels',
            'handle' => 'mapPanels',
            'instructions' => 'Repeatable panels for the map section',
            'settings' => [
                'minEntries' => 1,
                'maxEntries' => null,
                'entryTypes' => [$mapPanelEntryType->uid],
            ],
        ]);

        // Create Matrix field for results panels
        $resultsPanelsField = $this->createOrUpdateMatrixField($fieldsService, [
            'type' => Matrix::class,
            'name' => 'Panels',
            'handle' => 'resultsPanels',
            'instructions' => 'Repeatable panels for the results section',
            'settings' => [
                'minEntries' => 1,
                'maxEntries' => null,
                'entryTypes' => [$resultsPanelEntryType->uid],
            ],
        ]);

        // Main BasinScout Entry Type
        $basinScoutEntryType = new EntryType([
            'name' => 'BasinScout',
            'handle' => 'basinScout',
            'hasTitleField' => true,
        ]);

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
        $introSectionTab = new FieldLayoutTab([
            'name' => 'Intro',
            'layout' => $basinScoutFieldLayout,
        ]);

        $introTitleCustomField = new CustomField();
        $introTitleCustomField->setFieldUid($fieldsService->getFieldByHandle('introTitle')->uid);

        $introBackgroundImageCustomField = new CustomField();
        $introBackgroundImageCustomField->setFieldUid($fieldsService->getFieldByHandle('introBackgroundImage')->uid);

        $introPanelsCustomField = new CustomField();
        $introPanelsCustomField->setFieldUid($introPanelsField->uid);

        $introSectionTab->setElements([
            $introTitleCustomField,
            $introBackgroundImageCustomField,
            $introPanelsCustomField,
        ]);

        // Map Tab
        $mapSectionTab = new FieldLayoutTab([
            'name' => 'Map',
            'layout' => $basinScoutFieldLayout,
        ]);

        $mapTitleCustomField = new CustomField();
        $mapTitleCustomField->setFieldUid($fieldsService->getFieldByHandle('mapTitle')->uid);

        $mapBackgroundImageCustomField = new CustomField();
        $mapBackgroundImageCustomField->setFieldUid($fieldsService->getFieldByHandle('mapBackgroundImage')->uid);

        $mapPanelsCustomField = new CustomField();
        $mapPanelsCustomField->setFieldUid($mapPanelsField->uid);

        $mapSectionTab->setElements([
            $mapTitleCustomField,
            $mapBackgroundImageCustomField,
            $mapPanelsCustomField,
        ]);

        // Results Tab
        $resultsSectionTab = new FieldLayoutTab([
            'name' => 'Results',
            'layout' => $basinScoutFieldLayout,
        ]);

        $resultsTitleCustomField = new CustomField();
        $resultsTitleCustomField->setFieldUid($fieldsService->getFieldByHandle('resultsTitle')->uid);

        $resultsBackgroundImageCustomField = new CustomField();
        $resultsBackgroundImageCustomField->setFieldUid($fieldsService->getFieldByHandle('resultsBackgroundImage')->uid);

        $resultsPanelsCustomField = new CustomField();
        $resultsPanelsCustomField->setFieldUid($resultsPanelsField->uid);

        $resultsSectionTab->setElements([
            $resultsTitleCustomField,
            $resultsBackgroundImageCustomField,
            $resultsPanelsCustomField,
        ]);

        $basinScoutFieldLayout->setTabs([
            $headerTab,
            $introSectionTab,
            $mapSectionTab,
            $resultsSectionTab,
        ]);

        $basinScoutEntryType->setFieldLayout($basinScoutFieldLayout);
        $entriesService->saveEntryType($basinScoutEntryType);

        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown(): bool
    {
        $fieldsService = Craft::$app->getFields();
        $entriesService = Craft::$app->getEntries();

        // Delete main entry type
        $basinScoutEntryType = $entriesService->getEntryTypeByHandle('basinScout');
        if ($basinScoutEntryType) {
            $entriesService->deleteEntryType($basinScoutEntryType);
        }

        // Delete Matrix fields for sections
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
