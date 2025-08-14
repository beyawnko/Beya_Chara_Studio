# Digital Tailor Integration Plan

This document tracks progress and remaining work for integrating the **Digital Tailor** garment fitting module into Beya Chara Studio.

## Current Status

- UI shell and store scaffolding for a "Digital Tailor" mode.
- Garment import pipeline wired into `useCharacterStore`.
- Basic pins/simulation state via `useTailorStore`.
- Stub cloth solver worker and Playwright smoke test for mode toggle.
- Addressed code review: consolidated kind mapping, routed garment uploads through `onFiles`, replaced global utility styles, and centralized error handling.
- Refactored `onFiles` in `useCharacterStore` to remove duplicated logic.
- Removed redundant type assertions in `useCharacterStore` for clearer inference.
- Simplified head/body assignment in `onFiles` with a computed key to avoid duplication.
- Corrected `pushError` helper typing to accept partial state updates.
- Reset variant-related state when loading new head or body bases to avoid stale morphs.
- Replaced inline spacing divs with semantic CSS classes.

## TODOs

- Interactive pin creation and visual markers in the viewport.
- Position-Based Dynamics cloth solver with body/self collisions.
- Garment export after drape with Z-up ×100 transform.
- Comprehensive unit tests for solver math and pinning.
- UX polish: numeric transform inputs, pin editing, help tooltips.

## Handoff Notes

- Extend `DigitalTailorPanel` with pin/transform controls.
- Implement worker messaging between `useTailorStore` and `cloth.worker.ts`.
- Add e2e scenario covering import → pin → simulate → export.
- Update documentation once features stabilize.
