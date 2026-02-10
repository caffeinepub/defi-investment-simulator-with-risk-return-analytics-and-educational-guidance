# Specification

## Summary
**Goal:** Refresh the UI with a monochromatic subtle-glow theme, enhance the LP calculator with compounding options, and make Live Data mode work reliably with fallback to sample data.

**Planned changes:**
- Update the app-wide visual styling to a primarily monochromatic (neutral/grayscale) palette with a subtle, consistent glow treatment across components and states (cards, borders, focus rings, sliders, badges, tables), ensuring readability/contrast in supported modes.
- Add compounding support to the LP calculator fee APR earnings, including a user control for compounding behavior (none/simple vs periodic frequencies), and display compounded results in the LP output alongside existing results.
- Implement functional live market data fetching for the existing Aave and Compound adapters; remove the current Live Data hard error path, add clear English error messaging, and provide an automatic and/or obvious fallback to Sample Data when live fetching fails.

**User-visible outcome:** The app displays a cohesive monochrome glow theme, the LP calculator can show fee earnings with or without compounding (based on a selected frequency), and Live Data mode loads real Aave/Compound values when available while gracefully falling back to Sample Data with a clear message when it isn’t.
