

## Problem Analysis

The "Popular nearby" trending section currently has small cards (180-200px width) with compact text and minimal padding, making it less prominent on the home feed.

## Proposed Solution

Make the trending section more prominent and visually appealing by:

### 1. **Increase Card Dimensions**
- Change `min-w-[180px] max-w-[200px]` to `min-w-[240px] max-w-[260px]`
- Increase vertical height by adding more padding

### 2. **Enhance Typography**
- Heading: `text-sm` → `text-base` or `text-lg`
- Category emoji: `text-xl` → `text-2xl` or `text-3xl`
- Title: `text-[13px]` → `text-[15px]` or `text-base`
- Location: `text-[11px]` → `text-[13px]`
- Joined badge: `text-[10px]` → `text-[11px]`

### 3. **Increase Spacing**
- Card padding: `p-3.5` → `p-4` or `p-5`
- Section margins: `mb-4` → `mb-6`
- Gap between cards: `gap-3` → `gap-4`
- Top padding: `pt-3` → `pt-4`

### 4. **Progress Bar Enhancement**
- Height: `h-1` → `h-1.5` or `h-2`
- Make it more visually prominent

### 5. **Optional Enhancements**
- Consider showing 4-5 items instead of 3
- Add subtle animations on card hover
- Increase border radius for modern look: `rounded-2xl` → `rounded-3xl`

## Files to Modify

- **src/pages/HomePage.tsx** (lines 114-159)
  - Update trending section container spacing
  - Update heading typography
  - Update card dimensions and internal spacing
  - Update all text sizes within cards
  - Update progress bar dimensions

## Implementation Notes

- Maintain the horizontal scroll behavior for mobile-first design
- Keep the glassmorphism effects and gradient backgrounds
- Preserve tap-scale interaction
- Ensure cards don't become too large for smaller mobile screens

