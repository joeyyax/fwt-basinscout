# BasinScout Content Entry Guide for Craft CMS

**Audience:** Authors adding or updating content.

For installation or admin-only setup, see [craft-cms/README.md](./README.md).

## What you will do

- Open the BasinScout entry in Craft CMS.
- Fill in four tabs: Header, Intro, Map, Results.
- Add panels and sections where asked. Panels are just groups of content that appear in order on the page.

### Key idea: Sections and panels

- There are three sections: Intro, Map, Results. Each section has its own Title and Background image at the top of the tab.
- Each section also has one or more panels. Panels are groups of content that appear in order.
- Inside Intro and Results panels, you add one or more content sections (also called content blocks). Each content section can include a pretitle, a title, optional stats, and rich text.
- Stats inside a content section are optional.
- Inside Map panels, you also add content sections (pretitle, title, rich text). Map panels can also include media, markers, and optional stat images.

## Before you start

- Make sure you can upload images (you should see an Upload button on image fields).
- Have your logo and a few map/illustration images ready.
- If something does not look right in the editor (for example, an error where an upload field should be), contact your site admin.

## How the page is organized (simple view)

- Header: Site logo and optional call-to-action button.
- Intro section: Title and Background at the top, then one or more panels. Each panel contains one or more content sections (pretitle, title, optional stats, body).
- Map section: Title and Background at the top. Each panel can have an optional Panel Title, media, optional markers, optional stat images, and content sections. If a Panel Title is filled, it replaces the Map Title while that panel is visible.
- Results section: Title and Background at the top, then one or more panels. Each panel contains one or more content sections (pretitle, title, optional stats, body).

## Helpful tips

- Keep titles short and clear (aim for one line).
- Use body text for details (2–6 sentences is a good length).
- Add alt text wherever you upload images to support accessibility.
- Ideal image size: use large, clear images, typically at least 1600 px wide. Keep files under 1 MB when possible.

## Header tab

### What it controls on the page

- Your organization logo (shown at the top).
- An optional button in the header.

### Fields (what to fill in)

- Header Logo: Upload one image. Optional but recommended.
- Header Logo Alt Text: A short description of the logo (for screen readers). Optional but recommended when a logo is set.
- Header Home URL: Where the logo link should go when clicked (for example, https://www.yoursite.com). Optional.
- Header CTA Text: Short call-to-action (for example, Get involved). Optional.
- Header CTA URL: Link for the call-to-action. Optional, but recommended if you set CTA Text.

### Example

- Header Logo: Your brand mark
- Header Logo Alt Text: The Freshwater Trust logo
- Header Home URL: https://www.thefreshwatertrust.org
- Header CTA Text: Get involved
- Header CTA URL: https://www.thefreshwatertrust.org/get-involved

## Intro tab

### What it controls on the page

- An introduction made of one or more panels.
- Each panel contains one or more short sections of text, with optional stats.

Note: Intro and Results work the same way. Fill the same types of fields in each.

### Must‑have

- At least one Intro Panel.
- Each panel must have at least one Section.

### Nice‑to‑have

- Intro Title at the top of the page.
- A background image for the intro.

### Fields at the top of the tab

- Intro Title: Optional. This is the title shown for the Intro section.
- Intro Background Image: Optional. Upload one image to show behind the Intro section.

### Add Intro Panels

- Click Add a panel (or the plus button).
- Inside each panel, add one or more Sections.

### For each Section, fill:

- Pretitle: Optional short line above the title (for example, Basin overview).
- Title: Optional section title.
- Statistics: Optional small table of stats. For each row:
  - Stat Type: choose Standard or Donut.
  - Value: the number or text to display (for example, 45 percent).
  - Label: short description (for example, Agricultural lands in study area).
  - Source: URL.
- Section Content: Optional rich text paragraph(s).

### Example Intro Panel

- Section 1
  - Pretitle: Basin overview
  - Title: A river system under pressure
  - Statistics:
    - Standard, 45 percent, Agricultural lands in study area, TFT 2024
    - Donut, 72 percent, Fields with upgrade potential, TFT 2024
  - Section Content: Short paragraph introducing the basin and the goals of this project.
- Section 2
  - Title: How BasinScout helps
  - Section Content: Explain the approach, with a sentence on how to explore the page.

## Map tab

### What it controls on the page

- One or more map-focused panels.
- Each panel can show an image or media, optional markers, optional stats images, and short text sections.

### Must‑have

- At least one Map Panel.
- Each panel must have at least one Section.

### Nice‑to‑have

- Map Title at the top of the tab.
- A background image for the map area.

### Fields at the top of the tab

- Map Title: Optional.
- Map Background Image: Optional. Upload one image.

Note: If you add a Panel Title inside a Map Panel, it will replace the Map Title while that panel is visible.

### Add Map Panels

- Click Add a panel.
- Inside each panel, fill:
  - Panel Title: Optional short title for the panel. If you fill this, it will replace the Map Title while this panel is visible.
  - Map Media: Optional but recommended. Upload images or short animations that show the state for this panel. This image appears to the left of the text.
  - Map Markers: Optional. Add rows to place simple shapes on the image:
    - Type: Square or Circle.
    - X: Left‑to‑right position. Use 0–100 (0 is left edge, 100 is right edge).
    - Y: Top‑to‑bottom position. Use 0–100 (0 is top, 100 is bottom).
    - Example: X 40, Y 55 places the marker 40 percent from the left and 55 percent down.
    - Tip: Getting the exact spot may take a little trial and error.
  - Map Stats: Optional. You can add up to 6 small stat images. Click New Entry in the Map Stats area for each image, then fill Image and Alt Text.
  - Content Sections: Required. Add one or more sections with:
    - Pretitle (optional)
    - Title (optional)
    - Body (optional rich text)

### Example Map Panel

- Panel Title: Base map overview
- Map Media: Upload an image showing the base map.
- Map Markers:
  - Square at X 25, Y 60
  - Circle at X 68, Y 42
- Map Stats:
  - Image: 4_Stats/TFT_4_Stat-1.png — Alt: Progress in pilot area
  - Image: 4_Stats/TFT_4_Stat-2.png — Alt: Fields upgraded since 2023
- Content Sections:
  - Title: Understanding the base map
  - Body: Describe what the user is seeing and how to interact with markers.

## Results tab

### What it controls on the page

- One or more panels for outcomes, stats, and next steps.

Note: Results works the same way as the Intro tab.

### Must‑have

- At least one Results Panel.
- Each panel must have at least one Section.

### Nice‑to‑have

- Results Title at the top of the tab.
- A background image for the results area.

### Fields at the top of the tab

- Results Title: Optional. This is the title shown for the Results section.
- Results Background Image: Optional. Upload one image to show behind the Results section.

### Add Results Panels

- Click Add a panel.
- Inside each panel, add one or more Sections with:
  - Pretitle (optional)
  - Title (optional)
  - Statistics (optional) — same fields as on the Intro tab.
  - Body (optional rich text)

### Example Results Panel

- Section 1
  - Title: Outcomes
  - Statistics:
    - Standard, 12, Miles of drains improved, BasinScout 2024
    - Donut, 38 percent, Fields improved, BasinScout 2024
  - Body: Summary of results achieved and suggested next steps.

## Publishing checklist

- Entry Title is filled (top of the screen).
- Intro tab: At least one Intro Panel, each with at least one Section.
- Map tab: At least one Map Panel, each with at least one Section.
- Results tab: At least one Results Panel, each with at least one Section.
- Any uploaded images appear correctly (no error messages in fields).

## Troubleshooting (who to contact and what to check)

- If you do not see an Upload button or you see an error where an image field should be, contact your site admin to check image upload settings. Admin instructions live in [craft-cms/README.md](craft-cms/README.md).
- If you cannot find the BasinScout entry, ask your site admin to confirm the section exists and that you have access.
- If stats or markers do not appear on the live page after publishing, verify that you saved changes and that images finished uploading.

## Best practices

- Keep panels focused; it is better to add another panel than to overload one.
- Use consistent units and labels in the Statistics table.
- Write alt text for all images to make content accessible.
