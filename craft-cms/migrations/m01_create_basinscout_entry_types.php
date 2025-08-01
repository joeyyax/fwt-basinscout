<?php

namespace craft\contentmigrations;

use craft\db\Migration;
use craft\fields\Matrix;
use craft\fields\Assets;
use craft\fields\PlainText;
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
        $mapMediaField = $fieldsService->getFieldByHandle('mapMedia');
        $mapMarkersField = $fieldsService->getFieldByHandle('mapMarkers');

        // Create fields for the map stat entry type
        echo "Creating fields for map stats...\n";
        $mapStatImageField = $fieldsService->getFieldByHandle('statImage');
        if (!$mapStatImageField) {
            $mapStatImageField = $fieldsService->createField([
                'type' => Assets::class,
                'name' => 'Stat Image',
                'handle' => 'statImage',
                'instructions' => 'Statistical image',
                'settings' => [
                    'allowedKinds' => ['image'],
                    'limit' => 1,
                ],
            ]);

            if (!$fieldsService->saveField($mapStatImageField)) {
                echo "Failed to create statImage field\n";
                return false;
            }
        }

        $mapStatAltField = $fieldsService->getFieldByHandle('statAlt');
        if (!$mapStatAltField) {
            $mapStatAltField = $fieldsService->createField([
                'type' => PlainText::class,
                'name' => 'Stat Alt Text',
                'handle' => 'statAlt',
                'instructions' => 'Alternative text for the statistical image',
            ]);

            if (!$fieldsService->saveField($mapStatAltField)) {
                echo "Failed to create statAlt field\n";
                return false;
            }
        }

        // Create the entry type for map stats
        echo "Creating mapStat entry type...\n";
        $mapStatEntryType = $entriesService->getEntryTypeByHandle('mapStat');
        if (!$mapStatEntryType) {
            $mapStatEntryType = new EntryType([
                'name' => 'Map Stat',
                'handle' => 'mapStat',
                'hasTitleField' => false,
            ]);

            $mapStatFieldLayout = new FieldLayout();
            $mapStatFieldLayout->type = Entry::class;

            $mapStatTab = new FieldLayoutTab([
                'name' => 'Content',
                'layout' => $mapStatFieldLayout,
            ]);

            // Create CustomField elements
            $statImageCustomField = new CustomField();
            $statImageCustomField->setFieldUid($mapStatImageField->uid);

            $statAltCustomField = new CustomField();
            $statAltCustomField->setFieldUid($mapStatAltField->uid);

            $mapStatTab->setElements([
                $statImageCustomField,
                $statAltCustomField,
            ]);

            $mapStatFieldLayout->setTabs([$mapStatTab]);
            $mapStatEntryType->setFieldLayout($mapStatFieldLayout);

            if (!$entriesService->saveEntryType($mapStatEntryType)) {
                echo "Failed to save mapStat entry type\n";
                return false;
            }
        }

        // Create the Matrix field for map stats
        echo "Creating mapStats Matrix field...\n";
        $mapStatsField = $fieldsService->getFieldByHandle('mapStats');
        if (!$mapStatsField) {
            $mapStatsField = $fieldsService->createField([
                'type' => Matrix::class,
                'name' => 'Map Stats',
                'handle' => 'mapStats',
                'instructions' => 'Statistical images for this map panel (up to 6)',
            ]);

            // Set the matrix field settings
            $mapStatsField->minEntries = null;
            $mapStatsField->maxEntries = 6;
            $mapStatsField->setEntryTypes([$mapStatEntryType]);

            if (!$fieldsService->saveField($mapStatsField)) {
                echo "Failed to create mapStats Matrix field\n";
                return false;
            }
        }

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
        echo "Creating introContentSections Matrix field...\n";
        $introContentSectionsField = $fieldsService->getFieldByHandle('introContentSections');
        if (!$introContentSectionsField) {
            $introContentSectionsField = $fieldsService->createField([
                'type' => Matrix::class,
                'name' => 'Sections',
                'handle' => 'introContentSections',
                'instructions' => 'Repeatable content sections for this intro panel',
            ]);

            // Set the matrix field settings
            $introContentSectionsField->minEntries = 1;
            $introContentSectionsField->maxEntries = null;
            $introContentSectionsField->setEntryTypes([$contentSectionEntryType]);

            if (!$fieldsService->saveField($introContentSectionsField)) {
                echo "Failed to create introContentSections Matrix field\n";
                return false;
            }
        }

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
        echo "Creating mapContentSections Matrix field...\n";
        $mapContentSectionsField = $fieldsService->getFieldByHandle('mapContentSections');
        if (!$mapContentSectionsField) {
            $mapContentSectionsField = $fieldsService->createField([
                'type' => Matrix::class,
                'name' => 'Sections',
                'handle' => 'mapContentSections',
                'instructions' => 'Repeatable content sections for this map panel',
            ]);

            // Set the matrix field settings
            $mapContentSectionsField->minEntries = 1;
            $mapContentSectionsField->maxEntries = null;
            $mapContentSectionsField->setEntryTypes([$mapContentSectionEntryType]);

            if (!$fieldsService->saveField($mapContentSectionsField)) {
                echo "Failed to create mapContentSections Matrix field\n";
                return false;
            }
        }

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
        echo "Creating resultsContentSections Matrix field...\n";
        $resultsContentSectionsField = $fieldsService->getFieldByHandle('resultsContentSections');
        if (!$resultsContentSectionsField) {
            $resultsContentSectionsField = $fieldsService->createField([
                'type' => Matrix::class,
                'name' => 'Sections',
                'handle' => 'resultsContentSections',
                'instructions' => 'Repeatable content sections for this results panel',
            ]);

            // Set the matrix field settings
            $resultsContentSectionsField->minEntries = 1;
            $resultsContentSectionsField->maxEntries = null;
            $resultsContentSectionsField->setEntryTypes([$contentSectionEntryType]);

            if (!$fieldsService->saveField($resultsContentSectionsField)) {
                echo "Failed to create resultsContentSections Matrix field\n";
                return false;
            }
        }

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
