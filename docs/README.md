# Factory Control Center Docs

This folder is organized into a reusable rule and skill library.

## Top-level folders
- skills/
- rules/
- pick-a-pack/

## Key rule
Reuse existing classes before making new ones. If a new class is necessary, it must live in the owning component or page stylesheet instead of a shared or global CSS file.

## How to use this
Create a curated bundle by combining small files from the folders above that match the task.

## Canonical repo sources
All locations per PATHS.txt at the project root - the only path authority.
Everything moves eventually; only PATHS.txt knows where things are today.
- GLOBAL_TYPES - the house vocabulary
- HOUSE_CSS - grid.css and theme.css
- ATOMS - the atom library
- RULES_AND_SKILLS - this docs library

## Skills note
The runtime skills in chat are operational tools. These files are the reusable rule packs you can mix together for curated agent instruction.
