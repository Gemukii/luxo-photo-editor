# LUXO

A browser-based photo editor for the user's own photos. It combines Lightroom-style manual editing with predefined looks (filters and LUTs) that give a quick result with no colour-grading knowledge.

## Language

Everything in this repository is in English: UI text, code, comments, commit messages, and documentation.

## Architecture decisions

Decisions are recorded in `docs/adr/`. Read `docs/adr/README.md` before changing the architecture.

Keep the ADRs current as part of the work, not as a separate task:

- **Before** a significant change (render pipeline, data model, storage, auth, file formats, or a dependency with architectural weight), check whether an ADR covers it. If the change contradicts an accepted ADR, say so before going ahead.
- **New decision:** write a new ADR from `docs/adr/template.md` and add it to the index.
- **Changed decision:** write a new ADR and mark the old one as superseded. Do not rewrite accepted ADRs.
- **Finished work:** tick the matching ADR action items, and update the architecture diagram and the table of planned features in `docs/adr/README.md`.
- **Proposed ADRs:** only the project owner can accept them. Do not change a status to `Accepted` on their behalf.

## Commands

- `npm run dev`: start the development server
- `npm run build`: build for production
- `npm test`: run the unit tests
- `npm run typecheck`: check types
