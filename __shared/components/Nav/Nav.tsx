import './css/nav.css'
import './css/site-nav.css'
import './css/tab-nav.css'

import type { NavProps, NavItemProps } from './Nav.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this nav loop through data? if so, what is the item_class
 * 3. is there a container_class for this nav?
 **/

/**
 * ONE NAV, EVERY NAV. SiteNav (chrome) and TabsNav (dashboards) were the same
 * map with different class defaults; this is that map, once.
 *
 * IT DOES NOT TOUCH THE URL, ON PURPOSE. The segment a nav writes is the
 * PARENT's business -- chrome writes `main`, the demo tabs write `page` -- so
 * routing arrives as handleClick and the open one arrives as `selected`. A nav
 * that called useURL itself would still need telling which segment, which is
 * this same prop wearing a costume. (Reading is the opposite: a component reads
 * its own segment. See the useURL README.)
 */
export const Nav = ({
  className,
  nav_items,
  container_class = 'nav',
  item_class = 'nav-item',
  selected,
  is_vertical,
  container_ref,
  handleClick,
  //handleSort,  we will need this soon
}: NavProps) => {
  className = `nav ${container_class} ${className || ''}`.trim()
  if (is_vertical) className += ' is-vertical'

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItemProps) => {
    e.preventDefault()
    handleClick?.(item)
  }

  return (
    <nav className={className} ref={container_ref}>
      {nav_items?.map((item, i) => {
        const { id, path, label } = item || {}
        let link_class = `nav-item ${item_class}`.trim()
        if (path === selected) link_class += ' is-selected'
        return <a key={id || i} className={link_class} href={path || ''} onClick={(e) => handleItemClick(e, item)}>{label || 'n/a'}</a>
      })}
    </nav>
  )
}

export default Nav
