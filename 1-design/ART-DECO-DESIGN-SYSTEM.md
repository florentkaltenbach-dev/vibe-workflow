# Art Deco Luxury Scrabble - Design System

## Design Philosophy

Art Deco represents the pinnacle of 1920s-1930s luxury, combining geometric precision with opulent materials. This design system transforms a classic word game into a premium, sophisticated experience that users would willingly pay for.

### Core Art Deco Principles Applied
1. **Geometric Patterns**: Sharp angles, symmetry, zigzags, chevrons
2. **Luxurious Materials**: Gold, black, cream, jewel tones (emerald, sapphire, ruby)
3. **Typography**: Bold geometric sans-serifs with elegant decorative elements
4. **Symmetry & Balance**: Perfect alignment and mathematical precision
5. **Ornamentation**: Subtle but sophisticated decorative elements
6. **Contrast**: High contrast between light and dark elements

---

## Color Palette

### Primary Colors
```css
--art-deco-black: #1a1a1a;           /* Deep black for backgrounds */
--art-deco-gold: #d4af37;            /* Rich gold for accents */
--art-deco-gold-light: #f4d03f;      /* Light gold for highlights */
--art-deco-gold-dark: #b8941e;       /* Dark gold for shadows */
--art-deco-cream: #f5f3e8;           /* Warm cream for surfaces */
--art-deco-cream-dark: #e8e5d5;      /* Darker cream for depth */
```

### Jewel Tone Accents
```css
--art-deco-emerald: #50c878;         /* Emerald green */
--art-deco-sapphire: #0f52ba;        /* Deep sapphire blue */
--art-deco-ruby: #9b111e;            /* Rich ruby red */
--art-deco-amethyst: #9966cc;        /* Purple amethyst */
```

### Metallic Effects
```css
--art-deco-bronze: #cd7f32;
--art-deco-silver: #c0c0c0;
--art-deco-copper: #b87333;
```

### Semantic Colors (Art Deco Styled)
```css
--color-success: #50c878;            /* Emerald */
--color-error: #9b111e;              /* Ruby */
--color-warning: #f4d03f;            /* Light gold */
--color-info: #0f52ba;               /* Sapphire */
```

---

## Typography

### Font Families

```css
/* Primary: Geometric Sans-Serif */
--font-primary: 'Futura', 'Century Gothic', 'Avenir', sans-serif;

/* Secondary: Art Deco Display */
--font-display: 'Playfair Display', 'Didot', 'Bodoni', serif;

/* Tertiary: Monospace for scores */
--font-mono: 'Courier New', 'Monaco', monospace;

/* Fallback system fonts if custom fonts unavailable */
--font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes & Scale
```css
--font-size-xs: 0.75rem;     /* 12px - small labels */
--font-size-sm: 0.875rem;    /* 14px - body small */
--font-size-base: 1rem;      /* 16px - body text */
--font-size-lg: 1.125rem;    /* 18px - large body */
--font-size-xl: 1.5rem;      /* 24px - headings */
--font-size-2xl: 2rem;       /* 32px - large headings */
--font-size-3xl: 3rem;       /* 48px - hero text */
--font-size-4xl: 4rem;       /* 64px - display */
```

### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-black: 900;
```

### Letter Spacing (Art Deco loves space)
```css
--letter-spacing-tight: -0.02em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.05em;
--letter-spacing-wider: 0.1em;
--letter-spacing-widest: 0.2em;
```

---

## Spacing System

Art Deco emphasizes geometric precision. Use multiples of 4px for perfect alignment.

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

---

## Borders & Radii

### Border Widths
```css
--border-thin: 1px;
--border-medium: 2px;
--border-thick: 3px;
--border-heavy: 5px;
```

### Border Radius (Subtle - Art Deco prefers sharp angles)
```css
--radius-none: 0;
--radius-sm: 2px;      /* Minimal rounding */
--radius-md: 4px;      /* Subtle rounding */
--radius-lg: 8px;      /* Cards and panels */
--radius-circle: 50%;  /* Perfect circles */
```

---

## Shadows & Depth

Art Deco uses strong contrasts and layering to create depth.

### Box Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.25);
--shadow-2xl: 0 20px 40px rgba(0, 0, 0, 0.3);

/* Gold glow for premium elements */
--shadow-gold: 0 0 20px rgba(212, 175, 55, 0.4);
--shadow-gold-intense: 0 0 40px rgba(212, 175, 55, 0.6);

/* Inner shadows for depth */
--shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.2);
```

### Text Shadows (for elegance)
```css
--text-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--text-shadow-gold: 0 2px 8px rgba(212, 175, 55, 0.5);
```

---

## Gradients

Art Deco loves metallic gradients and sunburst patterns.

### Gold Gradients
```css
--gradient-gold: linear-gradient(135deg,
  var(--art-deco-gold-light) 0%,
  var(--art-deco-gold) 50%,
  var(--art-deco-gold-dark) 100%);

--gradient-gold-vertical: linear-gradient(180deg,
  var(--art-deco-gold-light) 0%,
  var(--art-deco-gold) 50%,
  var(--art-deco-gold-dark) 100%);

--gradient-gold-radial: radial-gradient(circle,
  var(--art-deco-gold-light) 0%,
  var(--art-deco-gold) 50%,
  var(--art-deco-gold-dark) 100%);
```

### Background Gradients
```css
--gradient-background: linear-gradient(135deg,
  var(--art-deco-black) 0%,
  #2a2a2a 50%,
  var(--art-deco-black) 100%);

--gradient-cream: linear-gradient(135deg,
  var(--art-deco-cream) 0%,
  var(--art-deco-cream-dark) 100%);
```

### Sunburst Pattern (Classic Art Deco)
```css
--gradient-sunburst: conic-gradient(from 0deg at 50% 50%,
  var(--art-deco-gold) 0deg,
  var(--art-deco-gold-light) 45deg,
  var(--art-deco-gold) 90deg,
  var(--art-deco-gold-dark) 135deg,
  var(--art-deco-gold) 180deg,
  var(--art-deco-gold-light) 225deg,
  var(--art-deco-gold) 270deg,
  var(--art-deco-gold-dark) 315deg,
  var(--art-deco-gold) 360deg);
```

---

## Animation & Motion

Art Deco motion is **elegant, deliberate, and sophisticated** - never bouncy or playful.

### Timing Functions
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-elegant: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-luxury: cubic-bezier(0.65, 0, 0.35, 1);
```

### Duration
```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
--duration-slowest: 1000ms;
```

### Keyframe Animations

#### Gold Shimmer (for premium elements)
```css
@keyframes goldShimmer {
  0%, 100% {
    background-position: 0% 50%;
    filter: brightness(1);
  }
  50% {
    background-position: 100% 50%;
    filter: brightness(1.2);
  }
}
```

#### Elegant Fade In
```css
@keyframes elegantFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Tile Placement Celebration
```css
@keyframes tilePlacement {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

#### Gold Pulse (for turn indicator)
```css
@keyframes goldPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.7);
  }
}
```

---

## Z-Index Layers

```css
--z-base: 0;
--z-board: 10;
--z-tiles: 20;
--z-rack: 30;
--z-header: 40;
--z-modal: 50;
--z-notification: 60;
--z-tooltip: 70;
```

---

## Breakpoints

```css
--breakpoint-mobile: 480px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;
--breakpoint-ultrawide: 1920px;
```

---

## Design Tokens Summary

All design tokens should be implemented as CSS custom properties in the root:

```css
:root {
  /* Colors */
  --art-deco-black: #1a1a1a;
  --art-deco-gold: #d4af37;
  /* ... (all colors above) */

  /* Typography */
  --font-primary: 'Futura', 'Century Gothic', 'Avenir', sans-serif;
  /* ... (all typography above) */

  /* Spacing, borders, shadows, etc. */
  /* ... (all other tokens) */
}
```

---

## Usage Guidelines for Implementation

1. **Always use CSS custom properties** - Never hardcode values
2. **Maintain geometric precision** - All spacing in multiples of 4px
3. **High contrast** - Ensure WCAG AA accessibility standards
4. **Elegant transitions** - Use luxury easing functions
5. **Gold sparingly** - Use as accent, not dominant color
6. **Sharp edges preferred** - Minimal border radius
7. **Symmetry is key** - Art Deco loves perfect balance

---

## Next Steps

See companion documents:
- `BOARD-DESIGN-SPEC.md` - Detailed board styling
- `ANIMATION-SPEC.md` - Complete animation system
- `IMPLEMENTATION-GUIDE.md` - CSS implementation instructions
