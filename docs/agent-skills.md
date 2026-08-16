# Agent Skills

This file records how agent skills work in this environment. Locations per
PATHS.txt at the project root.

## Project skills
Project skills live in `.claude\skills` under the project root and load in
every session here:
- loop-through-items - the house pattern for rendering a list from an items
  array (one element per item, key from id, item_class attached, per-item
  values derived locally inside the map).

## Runtime skills
The chat runtime ships its own built-in skills (code review, running the
app, and similar). The roster varies by session and version - trust the
session's own skill listing, not a document.

## Notes
Skills are operational tools for the agent, not app code. They supplement
the house rules and never replace them - the rules live in RULES_AND_SKILLS
and the repo's source-of-truth files per PATHS.txt.
