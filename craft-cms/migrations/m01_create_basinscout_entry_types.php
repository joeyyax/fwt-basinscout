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

class m01_create_basinscout_entry_types extends Migration
{
    /**
     * Helper function to create or update an entry type
     */
    private function createOrUpdateEntryType($entriesService, $handle, $name, $hasTitleField = false)
    {
        $entryType = $entriesService->getEntryTypeByHandle($handle);
        if (!$entryType) {
            $entryType = new EntryType([
                'name' => $name,
                'handle' => $handle,
                'hasTitleField' => $hasTitleField,
            ]);
        } else {
            // Update existing entry type
            $entryType->name = $name;
            $entryType->hasTitleField = $hasTitleField;
        }

        return $entryType;
    }

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
            echo "Matrix field '{$config['handle']}' already exists, skipping
";
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

        // Get required fields (created in previous migration)
        $panelBackgroundImageField = $fieldsService->getFieldByHandle('panelBackgroundImage');
        $panelTitleField = $fieldsService->getFieldByHandle('panelTitle');
        $sectionPretitleField = $fieldsService->getFieldByHandle('sectionPretitle');
        $sectionTitleField = $fieldsService->getFieldByHandle('sectionTitle');
        $sectionStatsField = $fieldsService->getFieldByHandle('sectionStats');
        $sectionBodyField = $fieldsService->getFieldByHandle('sectionContent');
        $mapMediaField = $fieldsService->getFieldByHandle('mapImage');
        $mapMarkersField = $fieldsService->getFieldByHandle('mapMarkers');
        $mapStatsField = $fieldsService->getFieldByHandle('mapStats');

        // Create Entry Types

        // Content Section Entry Type (for intro and results panels)
        $contentSectionEntryType = $this->createOrUpdateEntryType(
            $entriesService,
            'contentSection',
            'Content Section',
            false
        );

        $contentSectionFieldLayout = new FieldLayout();
        $contentSectionFieldLayout->type = Entry::class;

        $contentSectionTab = new FieldLayoutTab([
            'name' => 'Content',
            'layout' => $contentSectionFieldLayout,
        ]);

        // Create CustomField elements for content sections
        $sectionPretitleCustomField = new CustomField();
        $sectionPretitleCustomField->setFieldUid($sectionPretitleField->uid);

        $sectionTitleCustomField = new CustomField();
        $sectionTitleCustomField->setFieldUid($sectionTitleField->uid);

        $sectionStatsCustomField = new CustomField();
        $sectionStatsCustomField->setFieldUid($sectionStatsField->uid);

        $sectionBodyCustomField = new CustomField();
        $sectionBodyCustomField->setFieldUid($sectionBodyField->uid);

        $contentSectionTab->setElements([
            $sectionPretitleCustomField,
            $sectionTitleCustomField,
            $sectionStatsCustomField,
            $sectionBodyCustomField,
        ]);

        $contentSectionFieldLayout->setTabs([$contentSectionTab]);
        $contentSectionEntryType->setFieldLayout($contentSectionFieldLayout);
        $entriesService->saveEntryType($contentSectionEntryType);

        // Map Content Section Entry Type (for map panels - simpler structure)
        $mapContentSectionEntryType = $this->createOrUpdateEntryType(
            $entriesService,
            'mapContentSection',
            'Map Content Section',
            false
        );

        $mapContentSectionFieldLayout = new FieldLayout();
        $mapContentSectionFieldLayout->type = Entry::class;

        $mapContentSectionTab = new FieldLayoutTab([
            'name' => 'Content',
            'layout' => $mapContentSectionFieldLayout,
        ]);

        // Create CustomField elements for map content sections (no stats)
        $mapSectionPretitleCustomField = new CustomField();
        $mapSectionPretitleCustomField->setFieldUid($sectionPretitleField->uid);

        $mapSectionTitleCustomField = new CustomField();
        $mapSectionTitleCustomField->setFieldUid($sectionTitleField->uid);

        $mapSectionBodyCustomField = new CustomField();
        $mapSectionBodyCustomField->setFieldUid($sectionBodyField->uid);

        $mapContentSectionTab->setElements([
            $mapSectionPretitleCustomField,
            $mapSectionTitleCustomField,
            $mapSectionBodyCustomField,
        ]);

        $mapContentSectionFieldLayout->setTabs([$mapContentSectionTab]);
        $mapContentSectionEntryType->setFieldLayout($mapContentSectionFieldLayout);
        $entriesService->saveEntryType($mapContentSectionEntryType);

        // Create Matrix field for content sections within intro panel
        $introContentSectionsField = $this->createOrUpdateMatrixField($fieldsService, [
            'type' => Matrix::class,
            'name' => 'Sections',
            'handle' => 'introContentSections',
            'instructions' => 'Repeatable content sections for this intro panel',
            'settings' => [
                'minEntries' => 1,
                'maxEntries' => null,
                'entryTypes' => [$contentSectionEntryType->uid],
            ],
        ]);

        // Intro Panel Entry Type
        $introPanelEntryType = $this->createOrUpdateEntryType(
            $entriesService,
            'introPanel',
            'Intro Panel',
            false
        );

        $introPanelFieldLayout = new FieldLayout();
        $introPanelFieldLayout->type = Entry::class;

        $introPanelTab = new FieldLayoutTab([
            'name' => 'Content',
            'layout' => $introPanelFieldLayout,
        ]);

        $introContentSectionsCustomField = new CustomField();
        $introContentSectionsCustomField->setFieldUid($introContentSectionsField->uid);

        $introPanelTab->setElements([
            $introContentSectionsCustomField,
        ]);

        $introPanelFieldLayout->setTabs([$introPanelTab]);
        $introPanelEntryType->setFieldLayout($introPanelFieldLayout);
        $entriesService->saveEntryType($introPanelEntryType);

        // Create Matrix field for content sections within map panel
        $mapContentSectionsField = $this->createOrUpdateMatrixField($fieldsService, [
            'type' => Matrix::class,
            'name' => 'Sections',
            'handle' => 'mapContentSections',
            'instructions' => 'Repeatable content sections for this map panel',
            'settings' => [
                'minEntries' => 1,
                'maxEntries' => null,
                'entryTypes' => [$mapContentSectionEntryType->uid],
            ],
        ]);

        // Map Panel Entry Type
        $mapPanelEntryType = new EntryType([
            'name' => 'Map Panel',
            'handle' => 'mapPanel',
            'hasTitleField' => false,
        ]);

        $mapPanelFieldLayout = new FieldLayout();
        $mapPanelFieldLayout->type = Entry::class;

        $mapPanelTab = new FieldLayoutTab([
            'name' => 'Content',
            'layout' => $mapPanelFieldLayout,
        ]);

        // Create CustomField elements for map panel
        $mapPanelTitleCustomField = new CustomField();
        $mapPanelTitleCustomField->setFieldUid($panelTitleField->uid);

        $mapMediaCustomField = new CustomField();
        $mapMediaCustomField->setFieldUid($mapMediaField->uid);

        $mapMarkersCustomField = new CustomField();
        $mapMarkersCustomField->setFieldUid($mapMarkersField->uid);

        $mapStatsCustomField = new CustomField();
        $mapStatsCustomField->setFieldUid($mapStatsField->uid);

        $mapContentSectionsCustomField = new CustomField();
        $mapContentSectionsCustomField->setFieldUid($mapContentSectionsField->uid);

        $mapPanelTab->setElements([
            $mapPanelTitleCustomField,
            $mapMediaCustomField,
            $mapMarkersCustomField,
            $mapStatsCustomField,
            $mapContentSectionsCustomField,
        ]);

        $mapPanelFieldLayout->setTabs([$mapPanelTab]);
        $mapPanelEntryType->setFieldLayout($mapPanelFieldLayout);
        $entriesService->saveEntryType($mapPanelEntryType);

        // Create Matrix field for content sections within results panel
        $resultsContentSectionsField = $this->createOrUpdateMatrixField($fieldsService, [
            'type' => Matrix::class,
            'name' => 'Sections',
            'handle' => 'resultsContentSections',
            'instructions' => 'Repeatable content sections for this results panel',
            'settings' => [
                'minEntries' => 1,
                'maxEntries' => null,
                'entryTypes' => [$contentSectionEntryType->uid],
            ],
        ]);

        // Results Panel Entry Type
        $resultsPanelEntryType = new EntryType([
            'name' => 'Results Panel',
            'handle' => 'resultsPanel',
            'hasTitleField' => false,
        ]);

        $resultsPanelFieldLayout = new FieldLayout();
        $resultsPanelFieldLayout->type = Entry::class;

        $resultsPanelTab = new FieldLayoutTab([
            'name' => 'Content',
            'layout' => $resultsPanelFieldLayout,
        ]);

        $resultsContentSectionsCustomField = new CustomField();
        $resultsContentSectionsCustomField->setFieldUid($resultsContentSectionsField->uid);

        $resultsPanelTab->setElements([
            $resultsContentSectionsCustomField,
        ]);

        $resultsPanelFieldLayout->setTabs([$resultsPanelTab]);
        $resultsPanelEntryType->setFieldLayout($resultsPanelFieldLayout);
        $entriesService->saveEntryType($resultsPanelEntryType);

        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown(): bool
    {
        $fieldsService = Craft::$app->getFields();
        $entriesService = Craft::$app->getEntries();

        // Delete Matrix fields (they reference entry types)
        $matrixFieldHandles = [
            'introContentSections',
            'resultsContentSections',
            'mapContentSections',
        ];

        foreach ($matrixFieldHandles as $handle) {
            $field = $fieldsService->getFieldByHandle($handle);
            if ($field) {
                $fieldsService->deleteField($field);
            }
        }

        // Delete entry types
        $entryTypeHandles = [
            'contentSection',
            'mapContentSection',
            'introPanel',
            'mapPanel',
            'resultsPanel',
        ];

        foreach ($entryTypeHandles as $handle) {
            $entryType = $entriesService->getEntryTypeByHandle($handle);
            if ($entryType) {
                $entriesService->deleteEntryType($entryType);
            }
        }

        return true;
    }
}
