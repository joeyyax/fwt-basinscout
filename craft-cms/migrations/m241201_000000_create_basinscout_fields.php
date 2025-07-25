<?php

use craft\db\Migration;
use craft\fields\Assets;
use craft\fields\Checkboxes;
use craft\fields\Lightswitch;
use craft\fields\Matrix;
use craft\fields\PlainText;
use craft\fields\Redactor;
use craft\fields\Table;
use craft\models\MatrixBlockType;

/**
 * m241201_000000_create_basinscout_fields migration.
 */
class m241201_000000_create_basinscout_fields extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp(): bool
    {
        // Create field group for Basin Scout
        $this->insert('{{%fieldgroups}}', [
            'name' => 'Basin Scout',
            'uid' => 'basinscout-' . StringHelper::randomString(32),
            'dateCreated' => new \DateTime(),
            'dateUpdated' => new \DateTime(),
        ]);

        $fieldGroupId = $this->db->getLastInsertID();

        // 1. Page Title Field
        $this->createField([
            'groupId' => $fieldGroupId,
            'name' => 'Page Title',
            'handle' => 'pageTitle',
            'type' => PlainText::class,
            'instructions' => 'Main page title displayed in header',
            'required' => true,
        ]);

        // 2. Header Logo Field
        $this->createField([
            'groupId' => $fieldGroupId,
            'name' => 'Header Logo',
            'handle' => 'headerLogo',
            'type' => Assets::class,
            'instructions' => 'Logo displayed in header (SVG recommended)',
            'settings' => [
                'allowedKinds' => ['image'],
                'defaultUploadLocationSource' => 'volume:images',
                'singleUploadLocationSource' => 'volume:images',
                'limit' => 1,
            ],
        ]);

        // 3. Introduction Text Field
        $this->createField([
            'groupId' => $fieldGroupId,
            'name' => 'Introduction Text',
            'handle' => 'introText',
            'type' => Redactor::class,
            'instructions' => 'Introduction paragraph displayed in the first section',
            'required' => true,
        ]);

        // 4. Basin Scout Panels Matrix Field
        $this->createMatrixField([
            'groupId' => $fieldGroupId,
            'name' => 'Basin Scout Panels',
            'handle' => 'basinScoutPanels',
            'instructions' => 'Content panels that users navigate through',
            'blockTypes' => [
                [
                    'name' => 'Content Panel',
                    'handle' => 'contentPanel',
                    'fields' => [
                        [
                            'name' => 'Panel Title',
                            'handle' => 'panelTitle',
                            'type' => PlainText::class,
                            'required' => true,
                        ],
                        [
                            'name' => 'Panel Content',
                            'handle' => 'panelContent',
                            'type' => Redactor::class,
                            'required' => true,
                            'instructions' => 'Main content for this panel',
                        ],
                        [
                            'name' => 'Background Image',
                            'handle' => 'backgroundImage',
                            'type' => Assets::class,
                            'settings' => [
                                'allowedKinds' => ['image'],
                                'limit' => 1,
                            ],
                        ],
                        [
                            'name' => 'Stats Data',
                            'handle' => 'statsData',
                            'type' => Table::class,
                            'instructions' => 'Statistics displayed on this panel',
                            'settings' => [
                                'columns' => [
                                    'stat' => [
                                        'heading' => 'Statistic',
                                        'type' => 'singleline',
                                    ],
                                    'value' => [
                                        'heading' => 'Value',
                                        'type' => 'singleline',
                                    ],
                                    'label' => [
                                        'heading' => 'Label',
                                        'type' => 'singleline',
                                    ],
                                ],
                                'defaults' => [
                                    ['stat' => '', 'value' => '', 'label' => ''],
                                ],
                            ],
                        ],
                        [
                            'name' => 'Enable Stats Animation',
                            'handle' => 'enableStatsAnimation',
                            'type' => Lightswitch::class,
                            'instructions' => 'Enable animated counting for statistics',
                            'default' => true,
                        ],
                        [
                            'name' => 'Panel Order',
                            'handle' => 'panelOrder',
                            'type' => PlainText::class,
                            'instructions' => 'Numeric order for this panel (1, 2, 3, etc.)',
                            'required' => true,
                            'settings' => [
                                'placeholder' => '1',
                            ],
                        ],
                        [
                            'name' => 'Map Stage',
                            'handle' => 'mapStage',
                            'type' => PlainText::class,
                            'instructions' => 'Map stage number (1-9) for background visualization',
                            'settings' => [
                                'placeholder' => '1',
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        // 5. Navigation Settings Field
        $this->createField([
            'groupId' => $fieldGroupId,
            'name' => 'Navigation Settings',
            'handle' => 'navigationSettings',
            'type' => Checkboxes::class,
            'instructions' => 'Configure navigation behavior',
            'settings' => [
                'options' => [
                    ['label' => 'Enable Scroll Navigation', 'value' => 'enableScrollNav', 'default' => true],
                    ['label' => 'Show Progress Indicators', 'value' => 'showProgress', 'default' => true],
                    ['label' => 'Enable Touch Swipe', 'value' => 'enableSwipe', 'default' => true],
                    ['label' => 'Auto-play Mode', 'value' => 'autoPlay', 'default' => false],
                ],
            ],
        ]);

        // 6. Animation Settings Field
        $this->createField([
            'groupId' => $fieldGroupId,
            'name' => 'Animation Settings',
            'handle' => 'animationSettings',
            'type' => Table::class,
            'instructions' => 'Configure GSAP animation timings and effects',
            'settings' => [
                'columns' => [
                    'setting' => [
                        'heading' => 'Setting',
                        'type' => 'singleline',
                    ],
                    'value' => [
                        'heading' => 'Value',
                        'type' => 'singleline',
                    ],
                    'description' => [
                        'heading' => 'Description',
                        'type' => 'singleline',
                    ],
                ],
                'defaults' => [
                    ['setting' => 'panelTransitionDuration', 'value' => '1.2', 'description' => 'Duration for panel transitions (seconds)'],
                    ['setting' => 'statsAnimationDuration', 'value' => '2.0', 'description' => 'Duration for stats counting animation'],
                    ['setting' => 'scrollCooldown', 'value' => '1000', 'description' => 'Scroll cooldown period (milliseconds)'],
                    ['setting' => 'easeType', 'value' => 'power2.inOut', 'description' => 'GSAP easing function'],
                ],
            ],
        ]);

        // 7. SEO Meta Fields
        $this->createField([
            'groupId' => $fieldGroupId,
            'name' => 'Meta Description',
            'handle' => 'metaDescription',
            'type' => PlainText::class,
            'instructions' => 'Page description for search engines',
            'settings' => [
                'placeholder' => 'Interactive basin exploration tool...',
                'charLimit' => 160,
            ],
        ]);

        $this->createField([
            'groupId' => $fieldGroupId,
            'name' => 'Open Graph Image',
            'handle' => 'ogImage',
            'type' => Assets::class,
            'instructions' => 'Image for social media sharing',
            'settings' => [
                'allowedKinds' => ['image'],
                'limit' => 1,
            ],
        ]);

        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown(): bool
    {
        // Remove all Basin Scout fields
        $fieldGroup = (new Query())
            ->select(['id'])
            ->from('{{%fieldgroups}}')
            ->where(['name' => 'Basin Scout'])
            ->one();

        if ($fieldGroup) {
            // Delete all fields in this group
            $this->delete('{{%fields}}', ['groupId' => $fieldGroup['id']]);

            // Delete the field group
            $this->delete('{{%fieldgroups}}', ['id' => $fieldGroup['id']]);
        }

        return true;
    }

    /**
     * Create a standard field
     */
    private function createField(array $config): void
    {
        $fieldData = [
            'groupId' => $config['groupId'],
            'name' => $config['name'],
            'handle' => $config['handle'],
            'context' => 'global',
            'instructions' => $config['instructions'] ?? '',
            'required' => $config['required'] ?? false,
            'type' => $config['type'],
            'settings' => json_encode($config['settings'] ?? []),
            'uid' => $config['handle'] . '-' . StringHelper::randomString(32),
            'dateCreated' => new \DateTime(),
            'dateUpdated' => new \DateTime(),
        ];

        $this->insert('{{%fields}}', $fieldData);
    }

    /**
     * Create a Matrix field with block types
     */
    private function createMatrixField(array $config): void
    {
        // Create the main Matrix field
        $matrixFieldData = [
            'groupId' => $config['groupId'],
            'name' => $config['name'],
            'handle' => $config['handle'],
            'context' => 'global',
            'instructions' => $config['instructions'] ?? '',
            'type' => Matrix::class,
            'settings' => json_encode([
                'minBlocks' => 1,
                'maxBlocks' => null,
            ]),
            'uid' => $config['handle'] . '-' . StringHelper::randomString(32),
            'dateCreated' => new \DateTime(),
            'dateUpdated' => new \DateTime(),
        ];

        $this->insert('{{%fields}}', $matrixFieldData);
        $matrixFieldId = $this->db->getLastInsertID();

        // Create block types for the Matrix field
        foreach ($config['blockTypes'] as $blockType) {
            $blockTypeData = [
                'fieldId' => $matrixFieldId,
                'name' => $blockType['name'],
                'handle' => $blockType['handle'],
                'sortOrder' => 1,
                'uid' => $blockType['handle'] . '-' . StringHelper::randomString(32),
                'dateCreated' => new \DateTime(),
                'dateUpdated' => new \DateTime(),
            ];

            $this->insert('{{%matrixblocktypes}}', $blockTypeData);
            $blockTypeId = $this->db->getLastInsertID();

            // Create fields for this block type
            foreach ($blockType['fields'] as $field) {
                $blockFieldData = [
                    'groupId' => null,
                    'name' => $field['name'],
                    'handle' => $field['handle'],
                    'context' => "matrixBlockType:{$blockTypeId}",
                    'instructions' => $field['instructions'] ?? '',
                    'required' => $field['required'] ?? false,
                    'type' => $field['type'],
                    'settings' => json_encode($field['settings'] ?? []),
                    'uid' => $field['handle'] . '-' . StringHelper::randomString(32),
                    'dateCreated' => new \DateTime(),
                    'dateUpdated' => new \DateTime(),
                ];

                $this->insert('{{%fields}}', $blockFieldData);
            }
        }
    }
}
