# Design System Document: The Editorial E-Commerce Framework

## 1. Overview & Creative North Star: "The Digital Curator"

This design system is built upon the "Digital Curator" North Star. Unlike standard e-commerce platforms that prioritize density and loud promotional tactics, this system treats the interface as a high-end fashion gallery. It is designed to feel intentional, quiet, and profoundly premium.

To elevate the visual style of the reference, we are moving away from the "web-template" feel by embracing **intentional asymmetry** and **breathable negative space**. Instead of rigid, boxed-in grids, layouts should feel like a curated editorial spread in a luxury magazine. We utilize large-scale typography and overlapping elements to break the horizontal plane, ensuring that the interface never feels static. The focus is always on the product imagery; the UI is merely the elegant frame that holds it.

---

## 2. Colors: Sophisticated Tonality

The palette is a study in neutrals, designed to provide a high-contrast backdrop that allows product colors to vibrate.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly against a `background` section. The human eye should perceive the change in depth through tonal shifts, not structural lines.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper.
- **Surface (f9f9f9):** The base canvas.
- **Surface-Container-Lowest (ffffff):** Used for elevated cards or high-priority product highlights to create a "pop."
- **Surface-Container-High (e4e9ea):** Used for secondary utility areas like filters or sidebars to push them visually "behind" the main content.

### Glass & Gradient Rule
To move beyond a flat, digital look, utilize **Glassmorphism** for floating elements (e.g., sticky navigation bars or quick-view modals). Use `surface` colors with a 70-80% opacity and a `backdrop-blur` of 20px. 
- **Signature Polish:** For primary CTA backgrounds, apply a subtle linear gradient from `primary` (#5f5e5e) to `primary-dim` (#535252). This adds "soul" and depth that a flat hex code cannot achieve.

---

## 3. Typography: The Editorial Voice

Hierarchy is established through a dramatic scale contrast between the Serif and Sans-Serif families.

- **Display & Headline (Noto Serif):** Used for storytelling, collection titles, and hero statements. The serif represents heritage and luxury. Use `display-lg` (3.5rem) for main collection headers to create an authoritative, editorial feel.
- **Title & Body (Manrope):** A clean, modern Sans-Serif used for product names, descriptions, and functional UI elements. It provides a contemporary counterpoint to the traditional serif.
- **Label (Manrope):** Used for micro-copy and metadata. Always use `label-md` or `label-sm` with increased letter-spacing (0.05em) for a sophisticated, technical look.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows and borders are replaced by **Tonal Layering** to convey hierarchy.

- **The Layering Principle:** Stack `surface-container` tiers to create natural lift. A product card using `surface-container-lowest` placed on a `surface` background creates a soft, tactile "rise" without needing a drop shadow.
- **Ambient Shadows:** If a floating element (like a shopping bag preview) requires a shadow, it must be an "Ambient Shadow." 
    - **Blur:** 40px – 60px.
    - **Opacity:** 4% – 8%.
    - **Color:** Use a tinted version of `on-surface` (#2d3435), never pure black.
- **The "Ghost Border" Fallback:** If a container must have a boundary for accessibility, use the `outline-variant` (#adb3b4) at 15% opacity. **100% opaque borders are strictly forbidden.**

---

## 5. Components

### Buttons
- **Primary:** Rectangle with `0px` radius. Background: `primary`. Text: `on-primary` (All Caps, `label-md`). 
- **Secondary (Ghost):** No background. `Ghost Border` (15% opacity `outline-variant`). Text: `on-surface`.
- **Interaction:** On hover, the primary button should shift to `primary-dim` with a subtle scale increase (1.02x).

### Product Cards
- **Structure:** Forbid divider lines. Use `surface-container-lowest` for the card background against a `surface` grid. 
- **Imagery:** Aspect ratio should be a consistent 4:5 for an elongated, fashion-forward feel. 
- **Pricing:** Use `body-md` in `on-surface-variant` for original prices and `on-tertiary-container` for the accent "Sale" price.

### Input Fields
- **Styling:** A single 1px line at the bottom using `outline-variant` (the only exception to the no-line rule). 
- **States:** On focus, the line transitions to `primary` (#5f5e5e) with the label floating above in `label-sm`.

### Contextual Navigation (Breadcrumbs & Filters)
- **Chips:** Selection chips should use `surface-container-highest` with `on-surface` text. No borders.
- **Lists:** Product lists must use vertical white space (32px - 48px) to separate items rather than horizontal rules.

---

## 6. Do's and Don'ts

### Do
- **Do** use generous white space. If you think there is enough space, add 20% more.
- **Do** use asymmetrical image placement to create visual interest in long-scroll pages.
- **Do** ensure all typography is legible, maintaining a high contrast between `on-surface` and `surface`.
- **Do** use the `tertiary` (#725b3b) color sparingly as a "whisper" of warmth in an otherwise cool palette.

### Don't
- **Don't** use rounded corners (`0px` radius is mandatory for all elements).
- **Don't** use standard "drop shadows" or heavy black borders.
- **Don't** crowd product images with too many badges (e.g., "New," "Sale," "Trending"). Use one subtle label at most.
- **Don't** use bright, saturated colors for functional states. Use the sophisticated muted tones provided in the palette (e.g., `error` #9f403d for alerts).