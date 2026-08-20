# Design System: Apollo.io

## 1. Visual Theme & Atmosphere

- Overall feeling: Bright, assertive, and modern with a high-energy SaaS sales posture. The brand uses a stark black-and-white foundation punctuated by a vivid neon yellow accent and a contrasting electric link color.
- Visual density: Medium-to-high. The homepage is content-rich, with stacked sections, comparison-style proof points, tabbed feature modules, testimonials, and trust badges.
- Brand posture: Confident, performance-driven, and enterprise-ready. Messaging emphasizes speed, automation, and revenue growth.
- Signature motifs: Neon yellow CTA blocks, black outlines on secondary actions, strong typography contrast, tabbed product storytelling, and proof-heavy social trust sections.

### Key Characteristics

- High-contrast minimalism with a neon accent
- Sales-optimization and growth-oriented messaging
- Structured, modular sections with repeated CTAs
- Trust-forward presentation using logos, metrics, and compliance badges

## 2. Color Palette & Roles

| Role | Semantic Name | Value | Usage |
| --- | --- | --- | --- |
| Primary action | Apollo Neon | #EBF212 | Primary CTA buttons, highlights, brand emphasis |
| Accent | Apollo Link Violet | #860DFF | Links, secondary emphasis, interactive text |
| Surface | Pure White | #FFFFFF | Page background and primary surfaces |
| Text | Apollo Black | #000000 | Headings, body text, button text |
| Border | Apollo Black Border | #000000 | Secondary button borders, outlines, separators |

### Primary

- #EBF212 as the core brand action color for primary buttons and emphasis
- #000000 as the grounding counterweight for typography and borders

### Interactive

- Links use #860DFF, giving interactions a distinct saturated contrast from the yellow CTA color
- Secondary buttons use black borders and transparent fill, creating a clear non-primary action

### Neutral Scale

- The evidence strongly suggests an intentionally limited neutral range centered on white, black, and near-black text
- Input text uses #1A1A1A, indicating a slightly softened body/input neutral
- No full gray scale was provided in branding data; avoid inventing one

### Surface & Overlay

- Background surface: #FFFFFF
- Input surface: transparent
- Overlay tokens were not explicitly observed; use sparingly unless supported by product evidence

### Theme Modes

The provided branding indicates a light-only scheme.

#### Light Mode

- Background: #FFFFFF
- Surface: #FFFFFF and transparent for inputs
- Text: #000000
- Accent: #EBF212
- Notes: High contrast, crisp, and minimal. Use dark text on light surfaces with neon yellow as the primary action color.

#### Dark Mode

- Background: Not evidenced
- Surface: Not evidenced
- Text: Not evidenced
- Accent: Not evidenced
- Notes: No dark mode evidence was provided in the source data.

### Shadows & Depth

- Observed components use no shadow for buttons and inputs
- Borders and contrast carry most of the separation instead of elevation
- Focus treatment was not explicitly observed; keep it visible and high-contrast if implemented, but do not invent a shadow language

## 3. Typography Rules

### Font Family

- Primary: Soehne
- Monospace: FoundersGroteskMono
- OpenType Features: Not specified in evidence
- Heading family: abcDiatype
- Display family: SeasonMix

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Hero headline | SeasonMix or abcDiatype | 80px | Inferred bold/semibold | Not specified | Not specified | Large, attention-grabbing homepage hero treatment |
| Section heading | abcDiatype | 80px for major sections; smaller in practice | Inferred bold/semibold | Not specified | Not specified | Used for major feature and value statements |
| Body | Soehne | 18px | Not specified | Not specified | Not specified | Primary reading text for descriptions and CTA support copy |
| Label / Eyebrow | Soehne or abcDiatype | Not specified | Medium/semibold inferred | Not specified | Not specified | Used for short section labels like “Sales Leaders,” “Founders,” etc. |
| Caption / Meta | Soehne | Not specified | Regular | Not specified | Not specified | Support text such as compliance labels, author names, and disclaimers |

### Principles

- Use large, bold display headings to communicate scale and confidence
- Keep body copy clean and readable, with restrained typography and short-to-medium line lengths
- Maintain strong hierarchy between promotional headlines, supporting detail, and proof points

## 4. Component Stylings

### Buttons and Links

- Primary CTA: Neon yellow fill (#EBF212) with black text, rounded corners, no shadow
- Secondary CTA: Transparent fill with black border and black text, rounded corners
- Text links: Violet (#860DFF) for link emphasis
- Hover and active feel: Not directly observed; likely minimal and crisp rather than soft or shadow-based

### Cards and Containers

- Surface style: Mostly flat white surfaces with minimal chrome
- Radius: 8px on buttons and likely standard UI containers
- Border: Black borders are used for secondary emphasis; inputs appear borderless or unframed in the evidence
- Shadow or elevation: None observed on buttons or inputs
- Internal spacing: Comfortable and modular, with repeated vertical rhythm between sections

### Inputs and Interactive Controls

- Input treatment: Transparent background, blackish text (#1A1A1A), no visible border, no shadow
- Focus behavior: Not explicitly documented; should preserve the minimal aesthetic while remaining accessible
- Selection states: Not evidenced

### Navigation

- Structure: Header navigation with logo linking home and prominent sign-up CTA
- Background treatment: Not specified, but likely white to match the overall page
- Link style: Clean, text-first navigation with strong hierarchy toward CTA
- Sticky or scroll behavior: Not evidenced

### Image Treatment

- Screenshot treatment: Product imagery appears as large embedded screenshots with clean framing
- Photography or illustration style: Mixed product screenshots and human testimonial portraits
- Border and radius treatment: Not explicitly documented; imagery appears integrated into clean modular sections

### Distinctive Components

- Tabbed feature rail for core product areas: Outbound, Inbound, Data Enrichment, Deal Execution
- Metrics-and-proof sections combining numbers, customer logos, and testimonials
- Compliance trust badge strip for security and privacy validation

## 5. Layout Principles

### Spacing System

- Base unit: 4px
- Repeated spacing values: 4, 8, 12, 16, 24, 32, 40, 48 are reasonable derivatives from the 4px base

### Grid & Container

- Grid logic: Modular content sections stacked vertically, with feature cards and proof blocks aligned in rows
- Max content width: Not explicitly provided
- Section spacing: Generous vertical spacing between major selling sections and repeated CTA blocks

### Whitespace Philosophy

- Whitespace philosophy: Spacious enough to support strong typography and many proof elements, but not overly sparse
- Alignment tendencies: Left-aligned content with structured, scan-friendly blocks
- Content width behavior: Headlines are large but body copy remains concise to preserve readability

### Border Radius Scale

- Micro: 0px for inputs
- Standard: 8px for buttons and likely common controls
- Large: Not explicitly evidenced
- Pill: Not evidenced

## 6. Depth & Elevation

| Level | Treatment | Use |
| --- | --- | --- |
| Flat | White backgrounds, no shadow | Main page surfaces and most controls |
| Ring | Black border or outline | Secondary buttons and outlined emphasis |
| Card | Minimal or no-shadow cards | Feature panels, testimonials, and content blocks if framed |
| Focus | High-contrast visible focus state recommended | Keyboard navigation and active controls |

### Depth Principles

- Surface hierarchy: Built primarily through typography, spacing, and border contrast rather than shadow
- Shadow language: Essentially absent in the evidence
- Blur, glass, or overlay behavior: Not evidenced
- When depth is used versus avoided: Depth is mostly avoided; clarity and contrast do the work

## 7. Do's and Don'ts

### Do

- Use neon yellow sparingly and intentionally for primary actions
- Keep layouts modular, readable, and proof-heavy
- Preserve the stark black/white contrast with minimal visual noise

### Don't

- Don’t introduce soft pastel UI colors that dilute the brand energy
- Don’t rely on heavy shadows or glassmorphism
- Don’t overcomplicate the layout with decorative motion or dense ornamentation

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
| --- | --- | --- |
| Mobile | Not specified | Stacks sections vertically; likely simplifies tab rails and CTA groups |
| Tablet | Not specified | Preserves modular sections while reducing horizontal density |
| Desktop | Not specified | Uses full feature storytelling, tabbed modules, and wider proof sections |

### Touch Targets

- Keep CTA buttons large and finger-friendly, especially on sign-up flows
- Preserve adequate spacing between adjacent actions like Google and Microsoft sign-up buttons

### Collapsing Strategy

- Desktop behavior: Feature tabs and testimonial sections can remain side-by-side or in multi-column arrangements
- Tablet behavior: Reduce columns and allow content to stack where needed
- Mobile behavior: Collapse tab sets, compact proof sections, and keep a single primary CTA prominent
- Breakpoint-driven component changes: Feature modules likely shift from multi-panel to stacked content
- Touch target and spacing adjustments: Maintain the generous spacing implied by the 4px-based system and strong CTA prominence

## 9. Agent Prompt Guide

### Quick Color Reference

- Primary CTA: #EBF212
- Background: #FFFFFF
- Heading text: #000000
- Body text: #000000 or #1A1A1A
- Border or ring: #000000
- Accent: #860DFF

### Quick Summary

Apollo.io uses a light, high-contrast SaaS design with a neon yellow primary CTA and black typography.
The brand feels modern, bold, and sales-performance oriented.
Typography is large and assertive, with 80px hero-scale headlines and 18px body text.
The UI prefers flat surfaces, black borders, and almost no shadow.
Layout is modular and proof-heavy, with repeated CTAs, feature tabs, testimonials, and compliance trust signals.
Use white space deliberately, but keep the page dense enough to communicate enterprise value quickly.
Avoid decorative complexity; the brand identity comes from contrast, clarity, and energy.

### Example Component Prompts

- Hero: Create a bold white hero section with an 80px headline, black supporting copy, and a neon yellow primary CTA paired with a black-outlined secondary button.
- Card: Design a flat white feature card with minimal chrome, strong typography, and tight but comfortable spacing.
- Navigation: Build a clean white header with the Apollo logo on the left and a neon yellow sign-up CTA on the right.
- Button or badge: Use an 8px-radius neon yellow button with black text and no shadow; badges should be simple, high-contrast, and compact.

### Ready-to-Use Prompt

Build a light-mode SaaS landing page for Apollo.io using a white background, black text, neon yellow primary CTAs (#EBF212), violet links (#860DFF), and flat surfaces with 8px radius controls. Keep the layout modular, high-contrast, and proof-heavy with large display headlines, concise body copy, feature tabs, testimonials, trust badges, and minimal shadow usage.

### Iteration Guide

1. Keep the palette extremely restrained: white, black, neon yellow, and violet only where needed.
2. Maintain strong typographic hierarchy with oversized headlines and concise supporting copy.
3. Prefer borders, spacing, and contrast over shadows or decorative effects.

## Optional Appendix: Interaction Patterns

- Scroll behavior: The page appears section-driven and vertically progressive, moving from hero to feature tabs to proof and trust sections.
- Hover behavior: Not explicitly observed; likely subtle and minimal.
- Click behavior: Primary user action is sign-up, with repeated opportunities throughout the page.
- Animation tone: Not evidenced; if used, it should feel crisp, fast, and product-led.

## Optional Appendix: Content & Messaging Patterns

- Headline pattern: Performance outcomes first, usually framed as speed, growth, or efficiency
- CTA language: “Sign up for free,” “Get started for free,” and “Learn more”
- Trust signal pattern: Customer logos, quantified results, testimonials, and compliance certifications
- Voice and tone: Confident, direct, and revenue-focused

## Optional Appendix: Observed Pages

- Homepage (`https://apollo.io/`): Core brand colors, typography, CTA styling, feature modules, testimonials, compliance badges, and the primary landing-page structure