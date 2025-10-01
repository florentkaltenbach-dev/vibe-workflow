# Art Deco Luxury Scrabble - Design Specification

## Design Philosophy

This design transforms the Scrabble game into a luxurious 1920s Art Deco experience, combining the geometric precision and opulent glamour of the era with modern web design principles. The aesthetic evokes the sophistication of the Jazz Age while maintaining excellent playability.

## Core Art Deco Principles Applied

1. **Geometric Precision**: Symmetry, clean lines, stepped patterns, chevrons
2. **Bold Contrast**: Rich darks against metallics and creams
3. **Luxurious Materials**: Gold accents, lacquered surfaces, glass-like effects
4. **Streamlined Elegance**: Sophisticated without being cluttered
5. **Opulent Details**: Subtle shimmer, elegant borders, refined typography

---

## Color Palette

### Primary Colors

```css
--deco-gold: #d4af37;           /* Primary metallic accent */
--deco-gold-dark: #b8941f;      /* Darker gold for depth */
--deco-gold-light: #f4d687;     /* Lighter gold for highlights */
--deco-black: #1a1a1a;          /* Deep black for contrast */
--deco-cream: #f5f5dc;          /* Warm cream base */
--deco-cream-dark: #e8e4c8;     /* Darker cream for variation */
```

### Jewel Tones (Premium Multipliers)

```css
--emerald: #2d5f4e;             /* Triple Word Score */
--ruby: #8b1e3f;                /* Triple Letter Score */
--sapphire: #1e3a5f;            /* Double Word Score */
--amber: #c17817;               /* Double Letter Score */
```

### Accent Colors

```css
--deco-bronze: #cd7f32;         /* Secondary metallic */
--deco-smoke: #2a2a2a;          /* Rich dark gray */
--deco-ivory: #fffff0;          /* Tile color */
--deco-shadow: rgba(0, 0, 0, 0.3); /* Elegant shadows */
```

---

## Typography System

### Font Families (Google Fonts)

**Primary Display Font**: `Limelight`
- Classic Art Deco geometric sans-serif
- High contrast, elegant letterforms
- Use for: Main headings, game title, player names

**Secondary Font**: `Montserrat`
- Modern geometric sans-serif with Art Deco roots
- Excellent readability
- Use for: Subheadings, buttons, scoreboard

**Body Font**: `Cinzel`
- Elegant serif with classical proportions
- Use for: Game log, descriptive text, notifications

**Fallback**: `serif` or `sans-serif` as appropriate

### Type Scale

```css
--font-size-hero: 3.5rem;       /* Main title */
--font-size-h1: 2.5rem;         /* Section headers */
--font-size-h2: 2rem;           /* Subsection headers */
--font-size-h3: 1.5rem;         /* Card titles */
--font-size-body: 1rem;         /* Body text */
--font-size-small: 0.875rem;    /* Secondary info */
--font-size-tiny: 0.75rem;      /* Tile points */
```

### Font Weights

- Display/Headings: 400 (Limelight is already bold by design)
- Subheadings: 600 (Montserrat Semi-Bold)
- Body: 400 (Cinzel Regular)
- Emphasis: 600 (Cinzel Semi-Bold)

---

## Geometric Patterns & Borders

### Chevron Pattern (Decorative Accent)
- Used in headers and section dividers
- Gold on dark backgrounds
- Creates visual hierarchy

### Stepped Borders (Classic Art Deco)
- Multi-layered borders on cards and panels
- Gold → Black → Cream layering
- Creates depth and luxury

### Sunburst Motif
- Subtle radial gradient on backgrounds
- Used sparingly for premium moments (game over, winner announcement)

---

## Layout & Spacing

### Grid System
- 12-column responsive grid
- Generous white space (40px gaps on desktop, 20px mobile)
- Golden ratio proportions where possible (1:1.618)

### Spacing Scale

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-xxl: 3rem;     /* 48px */
```

### Border Radius
- Cards/Panels: 8px (soft modern touch)
- Buttons: 4px (more angular, Art Deco feel)
- Tiles: 3px (subtle rounding)
- Modals: 12px (elegant large surfaces)

---

## Component Design Specifications

### 1. Background
- Deep gradient from black to smoke gray
- Subtle geometric noise texture
- Fixed attachment for parallax effect
- Optional: Animated chevron pattern overlay (low opacity)

### 2. Game Board
- Cream/ivory base squares
- Premium squares use jewel tones with gold borders
- Center star in gold
- Subtle inner shadow on each square
- Gold outline on entire board (4px stepped border)
- Floating shadow effect (elevation)

### 3. Tiles
- Ivory background with cream border
- Letter: Large, bold, black Montserrat
- Points: Small subscript in gold
- Subtle gradient for dimensionality
- Shadow on hover (lift effect)
- Smooth transition on placement

### 4. Tile Rack
- Dark background (deco-smoke) with gold accent border
- Leather-like texture (subtle gradient)
- Gold metal caps on corners
- Tiles float slightly above surface (shadow)

### 5. Buttons
- Primary (Submit): Gold background, black text, hover glow
- Secondary (Pass): Smoke background, cream text
- Tertiary (Exchange): Bronze background, ivory text
- Danger (Clear): Ruby background, ivory text
- All buttons: Uppercase text, letter-spacing, subtle shine effect

### 6. Scoreboard
- Black card with gold header border
- Player names in Limelight font
- Current player highlighted with gold glow
- Scores in large Montserrat numerals
- Stepped border decoration

### 7. Game Log
- Cream card with subtle shadow
- Each entry has left gold accent border
- Recent plays fade in with smooth animation
- Cinzel font for readability

### 8. Modals (Game Over, Notifications)
- Black background with gold stepped border
- Centered layout with generous padding
- Title in Limelight with gold underline accent
- Sunburst background pattern (very subtle)
- Winner name in gold with glow effect

### 9. Join/Lobby Screens
- Centered card on geometric background
- Gold title with decorative chevron underlines
- Input fields: Cream background, gold focus border
- Elegant transitions between screens

---

## Animation & Transitions

### Timing Functions
- Default: `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material Design)
- Elastic (premium actions): `cubic-bezier(0.68, -0.55, 0.265, 1.55)`
- Smooth fade: `ease-in-out`

### Durations
- Fast interactions: 150ms (hover, focus)
- Standard: 300ms (button clicks, tile placement)
- Slow reveals: 500ms (screen transitions, modals)

### Key Animations

**Tile Placement**
```
1. Scale from 0.8 to 1.0
2. Fade in opacity 0 to 1
3. Subtle rotation (-3deg to 0deg)
Duration: 300ms with elastic easing
```

**Button Hover**
```
1. Slight scale up (1.0 to 1.05)
2. Glow effect (box-shadow expansion)
3. Color shift (lighter shade)
Duration: 150ms
```

**Screen Transitions**
```
1. Fade out current screen (opacity 1 to 0, 300ms)
2. Slide in new screen (translateY 20px to 0, 500ms)
3. Stagger child elements (50ms delay each)
```

**Notification Toast**
```
1. Slide in from right (translateX 100% to 0)
2. Gentle bounce on entry
3. Auto-dismiss after 4s with fade
```

**Gold Shimmer Effect**
```
Subtle gradient animation across gold elements
Linear gradient moves left to right
Repeats every 3s
```

---

## Luxury Touches

### 1. Micro-interactions
- Tiles wiggle slightly on hover (1deg rotation)
- Buttons emit particle sparkles on click (optional)
- Score numbers count up with animation
- Premium squares pulse gently when empty

### 2. Sound Design Hooks
- Tile placement: Satisfying "click" with rich timbre
- Word submission: Elegant chime
- Score update: Ascending musical notes
- Game over: Fanfare with Art Deco flair

### 3. Visual Feedback
- Placement preview: Ghost tile with gold outline
- Invalid move: Gentle shake animation
- Success: Gold glow pulse
- Turn indicator: Smooth breathing animation

### 4. Progressive Enhancement
- Subtle parallax on background
- Gradient meshes on premium elements
- CSS filters for depth (blur, brightness)
- Backdrop blur on modals (glassmorphism)

---

## Donation Integration

### Placement
Bottom-right corner or footer of game screen

### Design
```html
<div class="donation-badge">
  <span class="badge-icon">💎</span>
  <span class="badge-text">Enjoying the luxury?</span>
  <a href="#donate" class="donate-link">Buy us a cocktail</a>
</div>
```

### Styling
- Small, elegant badge
- Gold accent with glass morphism effect
- Subtle hover animation (float up)
- Non-intrusive, optional dismissal
- Opens donation modal with Art Deco styling

### Copy Tone
- "Support the Art Deco experience"
- "Buy us a cocktail at the Gatsby party"
- "Keep the champagne flowing"
- Playful 1920s references

---

## Responsive Design

### Breakpoints

```css
--mobile: 320px - 767px
--tablet: 768px - 1023px
--desktop: 1024px - 1439px
--large: 1440px+
```

### Mobile Adaptations
- Stack layout (scoreboard → board → game log)
- Larger touch targets (min 44px)
- Simplified animations (reduce motion)
- Smaller board cells (28px instead of 35px)
- Condensed typography scale
- Hide decorative elements on very small screens

### Tablet Adaptations
- Two-column layout (board + sidebar)
- Medium board cells (32px)
- Full animations enabled
- Landscape optimization

---

## Accessibility Considerations

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Premium squares have sufficient contrast
- Focus indicators use high-contrast gold outline

### Interactive Elements
- Keyboard navigation support
- Focus visible on all interactive elements
- ARIA labels for screen readers
- Semantic HTML structure

### Motion
- Respect `prefers-reduced-motion` media query
- Disable decorative animations
- Keep functional transitions simple

---

## Technical Implementation Notes

### CSS Architecture
- CSS Custom Properties (variables) for theming
- Mobile-first responsive design
- Progressive enhancement approach
- Minimal external dependencies

### Performance
- Optimize animations (use `transform` and `opacity`)
- Hardware acceleration where appropriate
- Lazy-load decorative effects
- Efficient selectors

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Fallback fonts for unsupported custom fonts

---

## Design System Summary

This Art Deco Scrabble design creates a luxurious, sophisticated experience that honors the elegance of the 1920s while maintaining modern usability. The geometric precision, rich color palette, and premium touches transform a classic word game into a delightful visual experience worthy of voluntary donation.

**Key Differentiators:**
- Authentic Art Deco aesthetic (not just gold and black)
- Thoughtful micro-interactions
- Premium feel without sacrificing playability
- Responsive luxury across all devices
- Donation integration that feels natural, not forced

**Design Goal:** Make players feel like they're playing Scrabble in the Rainbow Room at Rockefeller Center during the Jazz Age.
