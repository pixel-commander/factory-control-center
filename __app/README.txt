Notes for vite.config.ts
- resolve.alias maps @components, @atoms, @dashboards to the __shared
  folders at the project root. These are the same targets as the paths
  entries in tsconfig.app.json - the two must be kept in sync.
- server.fs.allow includes '..' because the aliased folders live outside
  the app root; without it the dev server refuses to serve files from
  [PROJECT_ROOT]\__shared.

Notes for tsconfig.app.json
- paths mirrors the vite aliases so TypeScript resolves the same imports
  the bundler does.
- the react / react/jsx-runtime / react-dom paths entries exist because
  shared code outside __app (e.g. __shared\chrome) cannot walk up to
  __app\node_modules on its own; these pin type resolution to this app's
  installed packages. resolve.dedupe in vite.config.ts is the bundler-side
  half of the same fix - keep both together.
- include lists ../__shared and ../RAB.types.ts so shared code belongs to
  this TypeScript project: the editor assigns files to a project by walking
  up to the nearest tsconfig that includes them, and without this the
  __shared files sit in an orphan project where react is unresolvable and
  quick-fixes (add missing imports) find no candidates.

Installing
- pnpm's content-addressable store lives at N:\pnpm-store (the user's
  deliberate machine-level setup). Because N: is a different drive, pnpm
  copies package files into node_modules here rather than linking, so the
  app's installed packages live entirely inside __app.
