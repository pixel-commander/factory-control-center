import { useState, useEffect, useCallback } from 'react';

// useURL -- name the URL path segments, read them back as an object, and drive
// the address bar through ONE dispatch handle. Client-side routing, no library.
// THE APP SERVES THE URL, NOT THE BROWSER: handle() uses history.pushState so the
// page never reloads; the app re-renders off state and routes itself.
//
// LINEAGE: the brain's canonical hook (brain/web/react/hooks/useURL). Carried over
// with two things the dashboard copy was missing -- see README.txt:
//   1. the DEFAULT template (his 2026-07-09) so useURL() takes NO argument
//   2. a hashchange listener, because vars ride on '#' here
//
//   const [{ main, page, view, tab, url_vars }, handle] = useURL()
//
//   URL  /dashboard/reports/billing#id=234
//        main=dashboard  page=reports  view=billing  url_vars={ id: '234' }
//
//   handle('update-path', { view: 'settings' })  -> /dashboard/reports/settings#id=234
//   handle('set-path',    { view: 'settings' })  -> /dashboard/reports/settings
//   handle('update-var',  { id: 'cats' })        -> /dashboard/reports/billing#id=cats
//   handle('remove-var',  { id: '' })            -> /dashboard/reports/billing
//
// `url_vars` is a RESERVED key -- it always holds the vars, never a path segment.

// THE ONLY FIVE VERBS -- and this is a CLOSED SET, on purpose.
//
// It used to read `string | 'update-path' | ...`, and that bare `string`
// SWALLOWED the literals: TypeScript collapses the union back to plain string,
// so every typo compiled, no autocomplete appeared, and a made-up verb hit
// `default` and silently returned the current state -- the URL did not change
// and NOTHING errored. That silence is the most expensive bug this hook has
// (LOSSES.txt, "the expensive one" -- carried in from the brain, already paid
// for once).
//
// TWO HOLES, TWO FIXES, because a type is not a runtime guard:
//   1. HERE -- drop `string`, so 'update-paths' is a red squiggle before it ever
//      runs, and the four are offered by autocomplete.
//   2. IN THE SWITCH -- `default` now says so out loud. Types vanish at build;
//      a verb arriving from a db row, a config value, or plain JS still reaches
//      `default` at runtime, and it must never be silent again.
//
// ADDING ONE COSTS FOUR EDITS, and all four are required or the set lies: this
// union, the switch, the `default` message that lists the verbs, and the usage
// block at the top. A verb the error message does not name is a verb nobody
// finds when they typo it.
type HandleType = 'update-path' | 'set-path' | 'update-var' | 'update' | 'remove-var';
type UrlVars = Record<string, string>;

interface UrlState {
  [key: string]: string | UrlVars;
  url_vars: UrlVars;
}

// THE HOUSE URL SHAPE (his 2026-07-09). Five named segments, coarse -> fine.
// main/page feed app-routing; view/tab/sub-tab route WITHIN a page. Every
// component calls useURL() with no arg, so the segment names line up everywhere
// and there is nothing to guess.
export const DEFAULT_TEMPLATE = 'main/page/view/tab/sub-tab';

// everything after the first ? # or $ counts as vars; = splits each pair
const VAR_DELIMS = /[?#$]/;

const templateKeys = (template: string): string[] => template.split('/').filter(Boolean);

const parsePaths = (template: string, pathname: string): Record<string, string> => {
  const segments = (pathname || '').split('/').filter(Boolean);
  const out: Record<string, string> = {};
  templateKeys(template).forEach((key, i) => { out[key] = segments[i] || ''; });
  return out;
};

const parseVars = (href: string): UrlVars => {
  const out: UrlVars = {};
  const tail = (href || '').split(VAR_DELIMS).slice(1).join('&');
  tail.split('&').forEach(pair => {
    if (!pair) return;
    const eq = pair.indexOf('=');
    if (eq === -1) return;
    const key = pair.slice(0, eq);
    if (key) out[key] = pair.slice(eq + 1);
  });
  return out;
};

const buildHref = (template: string, paths: Record<string, string>, vars: UrlVars): string => {
  const path = '/' + templateKeys(template).map(key => paths[key]).filter(Boolean).join('/');
  const var_keys = Object.keys(vars).filter(key => vars[key] !== '');
  // vars ride on '#' (his call): path#var=val, not path?var=val. Parsing (VAR_DELIMS)
  // still accepts ? # $ so any old ?-style link still reads; only the WRITE side emits '#'.
  const search = var_keys.length
    ? '#' + var_keys.map(key => `${key}=${vars[key]}`).join('&')
    : '';
  return path + search;
};

// pull just the path segments out of a UrlState (drops the reserved url_vars)
const pathsOf = (state: UrlState): Record<string, string> => {
  const out: Record<string, string> = {};
  Object.keys(state).forEach(key => {
    if (key !== 'url_vars') out[key] = state[key] as string;
  });
  return out;
};

// THE PATH IS A HIERARCHY, SO WRITING A SEGMENT TRUNCATES WHAT FOLLOWS IT.
// main/page/view/tab/sub-tab is ordered coarse -> fine on purpose: `page` only
// means something UNDER a `main`, `view` only under a `page`. So when a segment
// is rewritten, everything downstream belonged to the OLD parent and is now
// meaningless -- carrying it forward is how you land on /tab2/about/contact
// where `about` describes a tab that is no longer open.
//
// TWO RULES, and they are different:
//   WRITE a value   -> clear everything AFTER the deepest key given (exclusive)
//        {a:'tab2'}                 -> /tab2                b, c cleared
//        {b:'details'}              -> /tab1/details        c cleared, a kept
//        {a:'tab2', c:'z'}          -> /tab2/about/z        c is deepest
//   SET undefined   -> clear that key AND everything after it (INCLUSIVE)
//        {b: undefined}             -> /tab1                b AND c gone
//
// `undefined` is the ONLY clear signal, tested with === exactly. '' is NOT a
// clear: parsePaths fills absent segments with '', so treating it as one would
// make reading a state back and writing it again wipe the path.
const applyPaths = (
  template: string,
  current: Record<string, string>,
  options: Record<string, unknown>,
): Record<string, string> => {
  const keys = templateKeys(template);
  // Object.keys, not truthiness: `{b: undefined}` and `{}` spread identically,
  // so the only way to know `b` was NAMED is to ask for the key list.
  const named = Object.keys(options).filter(key => keys.includes(key));
  if (!named.length) return { ...current };

  const deepest = Math.max(...named.map(key => keys.indexOf(key)));
  const cleared = named.some(key => options[key] === undefined && keys.indexOf(key) === deepest);
  // exclusive for a write, inclusive for a clear -- the one line the two rules
  // actually differ by.
  const cut = cleared ? deepest : deepest + 1;

  const out: Record<string, string> = {};
  keys.forEach((key, i) => {
    if (i >= cut) return;                                   // truncated away
    const given = Object.prototype.hasOwnProperty.call(options, key) ? options[key] : undefined;
    out[key] = given === undefined ? (current[key] || '') : String(given);
  });
  return out;
};

// EVERY INSTANCE HEARS EVERY WRITE (his call 2026-07-26 -- "tabs not working").
//
// THE BUG THIS FIXES, exactly: SiteChrome calls useURL() TWICE -- once in the
// nav that writes, once in the page loader that reads. pushState does NOT fire
// popstate (only Back/Forward does), so the writing instance updated its own
// state and the reading one never heard a thing. The url changed, the nav
// highlighted, and THE PAGE NEVER SWAPPED. Nothing errored; the console stayed
// clean; it just silently did not work.
//
// SO A WRITE ANNOUNCES ITSELF. Every mounted useURL re-reads window.location --
// which is the single source of truth all of them already read from, so there
// is nothing to keep in step and no shared state to own.
const URL_SUBS = new Set<() => void>();
const announceURL = () => URL_SUBS.forEach((fn) => { try { fn(); } catch { /* one never stops the rest */ } });

export const useURL = (template: string = DEFAULT_TEMPLATE) => {
  const read = useCallback((): UrlState => {
    const loc = window?.location;
    return { ...parsePaths(template, loc?.pathname || ''), url_vars: parseVars(loc?.href || '') };
  }, [template]);

  const [state, setState] = useState<UrlState>(read);

  useEffect(() => {
    const sync = () => setState(read());
    // popstate  -- back/forward through pushState entries (the PATH half)
    // hashchange -- an anchor click or a hand-edited '#...' (the VARS half).
    //   Both are needed: a bare hash change does not always raise popstate, so
    //   without this the address bar would say one thing and state another.
    window?.addEventListener?.('popstate', sync);
    window?.addEventListener?.('hashchange', sync);
    // AND A WRITE FROM ANY OTHER INSTANCE. pushState raises no event at all, so
    // without this the instance that did NOT write never learns anything moved.
    URL_SUBS.add(sync);
    return () => {
      window?.removeEventListener?.('popstate', sync);
      window?.removeEventListener?.('hashchange', sync);
      URL_SUBS.delete(sync);
    };
  }, [read]);

  const handle = useCallback((type: HandleType, options: Record<string, unknown> = {}) => {
    const current = read();

    const commit = (paths: Record<string, string>, vars: UrlVars): UrlState => {
      window?.history?.pushState?.({}, '', buildHref(template, paths, vars));
      const next = read();
      setState(next);
      // TELL EVERY OTHER INSTANCE. This one just updated itself; the others are
      // reading the same window.location and have no idea it moved.
      announceURL();
      return next;
    };

    switch (type) {
      // ONE CASE, TWO VERBS -- they differ by ONE argument, so they share a
      // body. Writing them separately means the truncation rule lives in two
      // places, and the day applyPaths changes, one of them gets updated.
      //
      // BOTH TRUNCATE. See applyPaths above: writing a segment clears
      // everything downstream of it, because those values described the parent
      // that was just replaced. The difference is only what happens to '#':
      //
      //   update-path  KEEPS the vars -- moving between tabs of the same
      //                record, where the id still means something.
      //   set-path     DROPS them. The truncation rule already says a written
      //                segment invalidates everything BELOW it, and vars sit
      //                below every segment: an `id` was an id OF the page being
      //                left. Carrying it is how you land on /organizer#id=234
      //                pointing at a row in a table you are not looking at.
      //
      // EITHER WAY IT IS ONE COMMIT, so one tap of Back. update-path followed
      // by remove-var would be two pushState entries with a half-state between.
      case 'update-path':
      case 'set-path':
        return commit(
          applyPaths(template, pathsOf(current), options),
          type === 'set-path' ? {} : current.url_vars,
        );
      case 'update-var':
        return commit(pathsOf(current), { ...current.url_vars, ...(options as UrlVars) });
      case 'update':
        // paths AND vars in ONE commit = ONE history entry. Without this,
        // changing both means two pushState calls and two taps of Back.
        // Shape: handle('update', { paths: {...}, vars: {...} })
        // Its paths go through applyPaths too -- the same segment written by two
        // different verbs must land on the same URL, or the truncation rule is
        // only true half the time, which is worse than not having it.
        return commit(
          applyPaths(template, pathsOf(current), (options.paths as Record<string, unknown>) || {}),
          { ...current.url_vars, ...((options.vars as UrlVars) || {}) },
        );
      case 'remove-var': {
        const next_vars = { ...current.url_vars };
        Object.keys(options).forEach(key => { delete next_vars[key]; });
        return commit(pathsOf(current), next_vars);
      }
      default:
        // SAY IT OUT LOUD. This used to return `current` in silence, which is
        // the scar at the top of LOSSES.txt: the click fires, the handler runs,
        // the URL does not move, the console stays clean, and there is nowhere
        // to start looking. One letter in a string could cost an hour.
        //
        // It reports and RETURNS rather than throwing: handle() is called from
        // click handlers, and a throw there can take down the render on a typo
        // -- a bigger failure than the one being fixed. The message names the
        // hook and lists the real verbs, so the fix is in the error itself.
        console.error(
          `invalid handler for useURL: '${type}'. The five verbs are ` +
          `update-path, set-path, update-var, update, remove-var. The URL was NOT changed.`,
        );
        return current;
    }
  }, [read, template]);

  return [state, handle] as const;
};
