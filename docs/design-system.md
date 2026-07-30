
## Version 1.0

---

# 1. Brand Identity

### Brand Personality

The platform should feel:

- Trustworthy
    
- Educational
    
- Modern
    
- Clean
    
- Calm
    
- Warm
    
- Respectful of Afghan culture
    

It should **not** feel:

- Corporate
    
- Governmental
    
- Old-fashioned
    
- Overly colorful
    
- Heavy
    
- Decorative
    

The culture should be reflected through the content, imagery, and subtle accents—not by overwhelming ornamentation.

---

# 2. Color System

## Primary

|Name|Value|Usage|
|---|---|---|
|Primary|`#0F766E`|Main buttons, links, active states|
|Primary Hover|`#115E59`|Hover states|
|Primary Light|`#CCFBF1`|Selected items, badges, backgrounds|

---

## Secondary

|Name|Value|Usage|
|---|---|---|
|Terracotta|`#C65D3A`|Highlights, featured content|

---

## Accent

|Name|Value|Usage|
|---|---|---|
|Gold|`#D6A84B`|Important badges, featured labels|

---

## Neutral Colors

|Name|Value|
|---|---|
|Background|`#FAF8F3`|
|Card|`#FFFFFF`|
|Main Text|`#1F2937`|
|Muted Text|`#6B7280`|
|Border|`#E5E1D8`|

---

## Semantic Colors

These are not part of the branding but communicate status.

|Purpose|Color|
|---|---|
|Success|`#2E7D32`|
|Warning|`#B7791F`|
|Error|`#B42318`|
|Info|`#2563EB`|

---

# 3. Color Usage

Approximately:

```text
70% Background / White

20% Primary

7% Terracotta

3% Gold
```

Gold should never dominate the interface.

---

# 4. Typography

## Font Family

Primary font

```text
Estedad
```

Fallback

```text
Estedad,
Vazirmatn,
Tahoma,
sans-serif
```

---

# 5. Font Scale

## Display

```text
40px
```

Only for Hero section.

Weight

```text
700
```

---

## Page Title

Examples

- Dashboard
    
- Search Results
    
- Cultural Entry
    

```text
36px
Weight: 700
Line height: 1.3
```

---

## Section Title

Examples

- Featured Entries
    
- Browse by Province
    

```text
28px
Weight: 700
```

---

## Card Title

```text
20px
Weight: 600
```

---

## Body

```text
16px
Weight: 400
Line height: 1.9
```

For article pages, I'd actually recommend a slightly larger body size:

```text
18px
```

This will make long Persian cultural articles much more comfortable to read.

---

## Small Text

```text
14px
Weight: 400
```

Examples:

- Dates
    
- Category names
    
- Metadata
    

---

## Labels

```text
15px
Weight: 500
```

Used in forms.

---

## Buttons

```text
15px
Weight: 600
```

---

# 6. Font Weights

```text
400 Regular

500 Medium

600 SemiBold

700 Bold
```

Avoid using many different weights.

---

# 7. Spacing System

We should use an **8-point grid**.

```text
4

8

12

16

24

32

40

48

64

80

96
```

Every component should use these values.

---

# 8. Border Radius

|Component|Radius|
|---|---|
|Inputs|8px|
|Buttons|8px|
|Cards|12px|
|Dialogs|16px|
|Images|12px|
|Search Bar|9999px (pill shape)|

---

# 9. Shadows

We should keep shadows subtle.

Cards

```css
0 2px 10px rgba(0,0,0,.05)
```

Dialogs

```css
0 12px 30px rgba(0,0,0,.12)
```

Buttons should rely more on color than heavy shadows.

---

# 10. Icons

Library

```text
Lucide React
```

Style

- Outline icons
    
- 1.5–2px stroke
    
- Rounded
    
- Minimal
    

Avoid filled icons.

---

# 11. Buttons

### Primary

Background

```text
Primary
```

Text

```text
White
```

---

### Secondary

White background

Primary border

Primary text

---

### Ghost

Transparent

Used in navigation.

---

### Destructive

Red

Used only for delete actions.

---

# 12. Cards

Cards are one of the most important components.

They should have:

- White background
    
- 12px radius
    
- Soft shadow
    
- 24px padding
    
- Border
    

Cards should "float" slightly above the warm ivory background.

---

# 13. Forms

Inputs

Height

```text
44px
```

Large textareas

Minimum

```text
160px
```

Labels above inputs.

Errors below inputs.

---

# 14. Layout

Desktop Container

```text
1280px
```

Content Width

```text
1200px
```

Article Width

```text
760px
```

This is important.

Long cultural articles should **NOT** stretch across the entire screen.

A width of around **760px** greatly improves readability.

---

# 15. Grid

Desktop

```text
12 columns
```

Tablet

```text
8 columns
```

Mobile

```text
4 columns
```

---

# 16. Animation

Very subtle.

Duration

```text
200ms
```

Hover

```text
Scale 1.02
```

Cards

```text
TranslateY(-2px)
```

Nothing flashy.

---

# 17. Images

Corners

```text
12px
```

Use the same ratio within a section (for example, 16:9 for featured content cards) to keep layouts consistent.

---

# 18. Design Principles

Every screen should follow these principles:

1. Content first.
    
2. Plenty of white space.
    
3. Clear visual hierarchy.
    
4. Consistent spacing.
    
5. Minimal decoration.
    
6. Accessibility by default.
    
7. Responsive from the beginning.
    
8. Cultural identity through imagery and color accents—not excessive ornamentation.
    

