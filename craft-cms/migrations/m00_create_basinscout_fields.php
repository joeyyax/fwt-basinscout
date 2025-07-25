<?php

use craft\db\Migration;
use craft\fields\Assets;
use craft\fields\PlainText;
use craft\fields\Table;
use craft\fields\Textarea;
use craft\fields\Matrix;
use craft\ckeditor\Field as CKEditor;

/**
 * m00_create_basinscout_fields migration.
 */
class m00_create_basinscout_fields extends Migration
{
    /**
     * Helper function to create fields only if they don't already exist
     */
    private function createOrUpdateField($fieldsService, $handle, $config)
    {
        $field = $fieldsService->getFieldByHandle($handle);
        if ($field) {
            echo "Field '$handle' already exists, skipping\n";
            return;
        }

        // Remove groupId from config if present (it's not a valid constructor parameter)
        unset($config['groupId']);

        // Create the field
        $field = $fieldsService->createField($config);

        // Save the field - it will be assigned to the default group automatically
        if (!$fieldsService->saveField($field)) {
            $errors = $field->getErrors();
            $errorMessage = "Failed to save field '$handle'";
            if (!empty($errors)) {
                $errorMessage .= ": " . json_encode($errors);
            }
            throw new \Exception($errorMessage);
        }

        echo "Created field '$handle'\n";
    }

    /**
     * @inheritdoc
     */
    public function safeUp(): bool
    {
        $fieldsService = \Craft::$app->getFields();

        echo "Creating BasinScout fields...\n";

        // Common Panel Fields (used by all panels)
        $this->createOrUpdateField($fieldsService, 'panelBackgroundImage', [
            'type' => Assets::class,
            'name' => 'Panel Background Image',
            'handle' => 'panelBackgroundImage',
            'instructions' => 'Background image for this panel',
            'settings' => [
                'allowedKinds' => ['image'],
                'limit' => 1,
            ],
        ]);

        $this->createOrUpdateField($fieldsService, 'panelTitle', [
            'type' => PlainText::class,
            'name' => 'Panel Title',
            'handle' => 'panelTitle',
            'instructions' => 'Title for this panel',
            'settings' => [
                'placeholder' => 'Enter panel title',
                'charLimit' => 255,
            ],
        ]);

        // Fields for Content Sections (used in intro and results panels)
        $this->createOrUpdateField($fieldsService, 'sectionPretitle', [
            'type' => PlainText::class,
            'name' => 'Section Pretitle',
            'handle' => 'sectionPretitle',
            'instructions' => 'Optional pretitle for this content section',
        ]);

        $this->createOrUpdateField($fieldsService, 'sectionTitle', [
            'type' => PlainText::class,
            'name' => 'Section Title',
            'handle' => 'sectionTitle',
            'instructions' => 'Title for this content section',
        ]);

        $this->createOrUpdateField($fieldsService, 'sectionContent', [
            'type' => CKEditor::class,
            'name' => 'Section Content',
            'handle' => 'sectionContent',
            'instructions' => 'Main content for this section',
        ]);

        // Map panel specific fields
        $this->createOrUpdateField($fieldsService, 'mapImage', [
            'type' => Assets::class,
            'name' => 'Map Image',
            'handle' => 'mapImage',
            'instructions' => 'Interactive map image for this stage',
            'settings' => [
                'allowedKinds' => ['image'],
                'limit' => 1,
            ],
        ]);

        $this->createOrUpdateField($fieldsService, 'mapMarkers', [
            'type' => Table::class,
            'name' => 'Map Markers',
            'handle' => 'mapMarkers',
            'instructions' => 'Interactive markers for the map',
            'settings' => [
                'columns' => [
                    'type' => [
                        'heading' => 'Type',
                        'handle' => 'type',
                        'type' => 'select',
                        'options' => [
                            ['label' => 'Square', 'value' => 'square'],
                            ['label' => 'Circle', 'value' => 'circle'],
                        ],
                    ],
                    'x' => [
                        'heading' => 'X',
                        'handle' => 'x',
                        'type' => 'number'
                    ],
                    'y' => [
                        'heading' => 'Y',
                        'handle' => 'y',
                        'type' => 'number'
                    ],
                ],
            ],
        ]);

        // Map Stats fields (for Matrix field)
        $this->createOrUpdateField($fieldsService, 'statImage', [
            'type' => Assets::class,
            'name' => 'Stat Image',
            'handle' => 'statImage',
            'instructions' => 'Statistical image',
            'settings' => [
                'allowedKinds' => ['image'],
                'limit' => 1,
            ],
        ]);

        $this->createOrUpdateField($fieldsService, 'statAlt', [
            'type' => PlainText::class,
            'name' => 'Stat Alt Text',
            'handle' => 'statAlt',
            'instructions' => 'Alternative text for the statistical image',
        ]);

        // Note: mapStats Matrix field will be created in the entry types migration
        // since it depends on the mapStat entry type

        $this->createOrUpdateField($fieldsService, 'statsData', [
            'type' => Table::class,
            'name' => 'Stats Data',
            'handle' => 'statsData',
            'instructions' => 'Statistical data for this panel',
            'settings' => [
                'columns' => [
                    'category' => [
                        'heading' => 'Category',
                        'handle' => 'category',
                        'type' => 'singleline'
                    ],
                    'value' => [
                        'heading' => 'Value',
                        'handle' => 'value',
                        'type' => 'singleline'
                    ],
                    'unit' => [
                        'heading' => 'Unit',
                        'handle' => 'unit',
                        'type' => 'singleline'
                    ],
                    'description' => [
                        'heading' => 'Description',
                        'handle' => 'description',
                        'type' => 'multiline'
                    ],
                ],
            ],
        ]);

        // Panel content and navigation fields
        $this->createOrUpdateField($fieldsService, 'panelContent', [
            'type' => CKEditor::class,
            'name' => 'Panel Content',
            'handle' => 'panelContent',
            'instructions' => 'Main content for this panel',
        ]);

        $this->createOrUpdateField($fieldsService, 'sectionStats', [
            'type' => Table::class,
            'name' => 'Section Statistics',
            'handle' => 'sectionStats',
            'instructions' => 'Statistics for this content section',
            'settings' => [
                'columns' => [
                    'statType' => [
                        'heading' => 'Stat Type',
                        'handle' => 'statType',
                        'type' => 'select',
                        'options' => [
                            ['label' => 'Standard', 'value' => 'standard'],
                            ['label' => 'Donut', 'value' => 'donut'],
                        ],
                    ],
                    'value' => [
                        'heading' => 'Value',
                        'handle' => 'value',
                        'type' => 'singleline',
                    ],
                    'label' => [
                        'heading' => 'Label',
                        'handle' => 'label',
                        'type' => 'multiline',
                    ],
                    'source' => [
                        'heading' => 'Source',
                        'handle' => 'source',
                        'type' => 'singleline',
                    ],
                ],
            ],
        ]);

        echo "All BasinScout fields created successfully!\n";
        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown(): bool
    {
        echo "m00_create_basinscout_fields cannot be reverted.\n";
        return false;
    }
}
