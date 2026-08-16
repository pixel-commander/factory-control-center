import type { IdeFileProps } from '../Ide.types'

export const IDE_REVIEW = `import { Shell } from "../../containers/Shell/Shell";
import type { UiProps } from "../../types/RAB.types";

/* Card is a Shell with a head. Two modes, nothing else. */

export interface CardProps extends UiProps {
  header?: React.ReactNode;
  can_scroll?: boolean;
}

const defaults = { mode: "panel", color: "secondary", can_scroll: false };

export const Card = (props: CardProps) => {
  const card_settings = { ...defaults, ...(props || {}) };
  const { mode, color, title, header, can_scroll, children, is_visible } = card_settings;

  if (is_visible === false) return null;

  return (
    <Shell mode={mode} color={color} className="ui-card">
      {title || header ? (
        <div className="ui-card__head">
          <span className="ui-card__title">{title}</span>
          <div data-area="side">{header}</div>
        </div>
      ) : null}
      <div className="ui-card__body" data-scroll={can_scroll ? "true" : undefined}>
        {children}
      </div>
    </Shell>
  );
};
`

export const IDE_FILES: IdeFileProps[] = [
  {
    id: 'f1',
    name: 'Card.tsx',
    path: 'src/components/Card/Card.tsx',
    text: `import { Shell } from "../../containers/Shell/Shell";
import type { UiProps } from "../../types/RAB.types";

/* Card is a Shell with a head. Two modes, nothing else. */

export interface CardProps extends UiProps {
  header?: React.ReactNode;
}

const defaults = { mode: "panel", color: "secondary" };

export const Card = (props: CardProps) => {
  const card_settings = { ...defaults, ...(props || {}) };
  const { mode, color, title, header, children, is_visible } = card_settings;

  if (is_visible === false) return null;

  return (
    <Shell mode={mode} color={color} className="ui-card">
      {title ? (
        <div className="ui-card__head">
          <span className="ui-card__title">{title}</span>
          {header}
        </div>
      ) : null}
      <div className="ui-card__body">{children}</div>
    </Shell>
  );
};
`,
  },
  {
    id: 'f2',
    name: 'useForm.ts',
    path: 'src/hooks/useForm.ts',
    text: `import { useRef, useState } from "react";

/* useForm — a plain <form> and the DOM as the value store. No state per field. */

export const useForm = ({ items, handleSubmit }) => {
  const ref = useRef(null);
  const [touched, setTouched] = useState(false);

  const read = () => {
    const out = {};
    new FormData(ref.current).forEach((value, key) => {
      out[key] = value;
    });
    return out;
  };

  const submit = (event) => {
    event.preventDefault();
    setTouched(true);
    handleSubmit?.(read());
  };

  return { ref, read, submit, is_touched: touched };
};
`,
  },
  {
    id: 'f3',
    name: 'theme.json',
    path: 'src/themes/theme.json',
    text: `{
  "id": "glass",
  "label": "GLASS",
  "tokens": {
    "surface-main": "rgba(255,255,255,.055)",
    "border-color-main": "rgba(255,255,255,.16)",
    "radius-base": ".5rem"
  },
  "modifiers": ["blur", "sheen", "specular-edge"],
  "is_saved": true
}
`,
  },
  {
    id: 'f4',
    name: 'row.css',
    path: 'src/components/Row/row.css',
    text: `/* Row — one line of a list. The grid collapses when a cell has no words. */
.ui-row{display:grid;grid-template-columns:max-content minmax(0,1fr) max-content;
  align-items:center;gap:var(--pad-sm);padding:var(--pad-xs) var(--pad-sm);
  border-radius:var(--radius-base);background:var(--surface-main);cursor:pointer}
.ui-row:hover{background:var(--surface-light)}
.ui-row[data-selected="true"]{box-shadow:inset 2px 0 0 rgb(var(--a))}
`,
  },
  {
    id: 'f5',
    name: 'README.md',
    path: 'README.md',
    text: `# RaBIT UI

The kit, the widgets, the dashboards.

## Rules

- One container per surface: **Shell** wears the look, everything else wears Shell.
- \`grid side-l\` names the columns. No component declares its own tracks.
- Tokens only: no literal colour, space or radius outside \`theme.css\`.

> A theme is a change of colour and material, not a change of rhythm.

1. Read the house keys
2. Reuse the leaf
3. Add nothing new

See [the styleguide](preview/Harness.html) for every component.
`,
  },
  {
    id: 'f6',
    name: 'notes.txt',
    path: 'notes.txt',
    text: `Riser access is through the loading bay, not the lobby.
Ask for Marcus at the desk. The freight lift needs a key after 6.

Voss can hold the board refit until the 22nd, wants the deposit this week.
`,
  },
  {
    id: 'f7',
    name: 'BROKEN.tsx',
    path: 'src/components/Broken/BROKEN.tsx',
    text: `export const Broken = (props) => {
  const { title, children } = props;

  return (
    <div className="ui-broken">
      <span>{title}
      <div className="ui-broken__body">{children}</div>
    </div>
  );
`,
  },
]
