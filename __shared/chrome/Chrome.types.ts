import type { NavItemProps } from '../components/Nav/Nav.types'

// A NAV ITEM THAT CARRIES ITS PAGE. Nav only needs id/label/path to draw; the
// chrome also needs to know WHAT to render when that item is the open one, so
// the view rides along on the item rather than in a second lookup table that
// could fall out of step with it.
export interface ChromeNavItemProps extends NavItemProps {
  // ComponentType, not a hand-written signature: a view takes whatever props it
  // likes (ComponentDemos has its own) and the chrome renders it with none, so
  // the only real requirement is that every prop it declares has a default.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  View?: React.ComponentType<any>
}

/**
 * THE PAGE TAKES ITS REGIONS AS COMPONENTS. header, left, main, right, footer are
 * the reserved area words, so any screen can be dropped into main without knowing
 * what surrounds it -- and a page passes only the regions it actually has.
 *
 * They are rendered guarded and as ELEMENTS -- {Left && <Left />}, never Left() --
 * so a region that throws takes itself down and not the chrome around it.
 */
export interface ChromeProps {
  className?: string,

  nav_items?: ChromeNavItemProps[],
  selected?: string | number,

  title?: React.ReactNode,
  description?: React.ReactNode,
  status?: React.ReactNode,
  badge?: React.ReactNode,

  // the regions
  Header?: () => React.JSX.Element,
  Left?: () => React.JSX.Element,
  Main?: () => React.JSX.Element,
  Right?: () => React.JSX.Element,
  Footer?: () => React.JSX.Element,

  // the atom each region wears -- the chrome's own css does layout only
  header_class?: string,
  left_class?: string,
  main_class?: string,
  right_class?: string,
  footer_class?: string,
  brand_class?: string,
  avatar_class?: string,

  handleSelect?: (x?: NavItemProps) => void,
  handleClick?: () => void,

  children?: React.ReactNode
}
