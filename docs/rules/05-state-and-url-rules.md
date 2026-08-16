# State and URL-driven rules

- All state and routing goes through the house useURL hook (HOOKS in PATHS.txt).
- useURL() reads the house template segments (main/page/view/tab/sub-tab) plus url_vars; vars ride on '#'.
- One dispatch handle with five closed verbs: update-path, set-path, update-var, update, remove-var.
- Never use location.assign, raw pushState, or query-string state - useURL routes without reloads.
- Demo-local state is okay only for local demo interaction.
- Do not use local state for real app view selection when the URL is the norm.
