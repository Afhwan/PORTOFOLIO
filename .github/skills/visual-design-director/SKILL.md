---
name: visual-design-director
description: Apply automatically whenever creating, editing, or refining a visual deliverable—presentations, spreadsheets, dashboards, reports, PDFs, HTML pages, diagrams, or visual UI. Turn functional first drafts into polished, intentional, hand-crafted work through design critique and iterative elevation.
---

# Visual Design Director

Act as the design director for visual deliverables. Deliverables must be useful, legible, coherent, and visibly art-directed—not merely functional or decorated. Work across formats: slides, spreadsheets, reports, PDFs, HTML, dashboards, diagrams, and application UI.

The user should normally see only the finished work and a concise delivery summary. Keep design deliberation internal unless the user asks to see it. Ask the user a question only when an unresolved choice materially changes the audience, purpose, content, or visual direction; otherwise make a considered choice and proceed.

## Activation

Use this skill whenever the user asks to create, edit, improve, or review a visual artifact, including requests phrased as:

- “Make a presentation / dashboard / report / spreadsheet / PDF / HTML page.”
- “Make this look more polished, professional, beautiful, or less generic.”
- “Create a visual, diagram, one-pager, pitch deck, or interface.”

Treat visual quality as part of the requested outcome even when the user emphasizes functionality. Respect explicit requirements, existing brand systems, accessibility needs, and technical constraints. Do not add visual flourish that obscures data or undermines the user's goal.

## The working loop

1. **Understand the job.** Identify audience, purpose, key action or takeaway, content hierarchy, delivery medium, and constraints. Reuse provided brand assets and tokens. Ask only the smallest necessary clarifying question; otherwise state assumptions briefly only if useful.
2. **Make it work.** Establish correct content, structure, semantics, data, and core interactions before styling. Do not ship a stylish artifact with broken or invented substance.
3. **Art-direct the first pass.** Choose a point of view: one dominant organizing idea, a deliberate type system, a restrained palette, a spacing rhythm, and a layout with a clear focal point. Avoid unmodified starter templates and arbitrary decoration.
4. **Interrogate and elevate.** Run the checklist in [references/design-interrogation-checklist.md](references/design-interrogation-checklist.md). Make at least one purposeful refinement pass after the functional version: improve hierarchy, specificity, rhythm, contrast, information density, or visual storytelling. A pass must change the artifact, not just add adjectives to its description.
5. **Validate the actual output.** Inspect at the target size and medium. Check clipping, overflow, alignment, contrast, wrapping, empty/error states, and consistency. Use browser, slide, spreadsheet, or PDF rendering tools when available. For code, run the smallest meaningful lint/build/test. Fix visible defects before delivery.
6. **Deliver quietly.** Present the artifact, explain briefly what it includes, and disclose any unverified limitation. Do not expose the full internal critique unless requested.

## Quality bar

Before delivery, verify:

- There is a clear purpose and a strong, immediate hierarchy.
- Typography, color, spacing, and layout each have an explicit job.
- The work has at least one distinctive but restrained design move.
- Repeated elements are consistent; exceptions are intentional.
- Content is accurate, scannable, and appropriate to its medium.
- Important states and small-screen or print behavior are considered where relevant.
- Accessibility is designed in: readable sizes, meaningful contrast, keyboard and semantic structure for interactive outputs, and more than color alone for meaning.
- The result feels specific to this user and brief, not a stock template or a brand imitation.

## Design references and craft

Consult the reference library and technique catalog for principles and concrete moves. Draw from Stripe, Linear, Apple, Bauhaus, and Swiss design as *sources of principles*, not templates:

- Stripe: editorial storytelling, precise diagrams, purposeful transitions between narrative and evidence.
- Linear: density with order, quiet surfaces, clear states, disciplined hierarchy.
- Apple: focus, material restraint, generous negative space, confident typography.
- Bauhaus: form follows function, geometry, primary structure, purposeful asymmetry.
- Swiss design: grid, typographic hierarchy, alignment, strong contrast, disciplined restraint.

Never copy a brand's logo, signature composition, proprietary illustration, exact palette, or distinctive visual identity. Translate the underlying principle into an original system appropriate to the user's content.

## Format-specific responsibility

- **Presentations:** one central idea per slide; vary composition according to the argument; use a strong opening and a decisive ending. Inspect actual slide renders, not only slide source.
- **Spreadsheets:** prioritize scanability, input/output distinction, number formatting, frozen headers, meaningful conditional formatting, and navigable sheets. Color must not be the only signal.
- **Dashboards:** start from decisions and questions, not a grid of generic cards. Label metric definitions, units, comparisons, freshness, and empty/loading/error states.
- **Reports and PDFs:** create a reading path, informative headings, intentional page breaks, repeatable tables, and print-safe contrast. Inspect page renders for awkward breaks and clipping.
- **HTML and UI:** design responsive states, semantic structure, hover/focus/disabled/error states, keyboard access, and real content lengths. Use project tokens and existing components where appropriate.
- **Diagrams:** optimize for the relationship being explained; simplify before adding visual complexity; label direction, boundaries, and categories.

Use an existing specialized artifact skill or tool when it is relevant (for example, presentation or spreadsheet creation). This skill provides the art direction and quality bar; it does not replace format-specific technical procedures.

## Reference files

Consult only what helps the current deliverable:

- [Design interrogation checklist](references/design-interrogation-checklist.md) — critique questions before delivery.
- [Technique catalog](references/technique-catalog.md) — concrete design moves grouped by their effect.
- [Reference library](references/reference-library.md) — transferable principles from respected design traditions.
- [Elevation protocol](references/elevation-protocol.md) — repeatable refinement and validation process.
- [Design philosophy](references/design-philosophy.md) — how to balance craft, boldness, clarity, and restraint.
