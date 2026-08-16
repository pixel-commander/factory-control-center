import './css/site-nav.css'
import type { SiteNavProps, SiteNavItemProps } from './SiteNav.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this site-nav loop through data? if so, what is the item_class
 * 3. is there a container_class for this site-nav?
 **/

export const SiteNav = ({ 
  className, 
  nav_items,
  container_class = 'site-nav',
  item_class = 'site-nav-item',
  selected,
  handleClick,
}: SiteNavProps) => {
  className=`site-nav ${container_class} ${className || ''}`.trim()
  
  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, item: SiteNavItemProps) => {
    e.preventDefault()
    handleClick?.(item)
  }

  return (
    <nav className={className}>
      {nav_items.map((item, i) => {
        const { id, path, label } = item || {}
        let link_class = `nav-item ${item_class}`.trim()
        if (path === selected) link_class += ' is-selected'
        return <a key={id || i} className={link_class} href={path || ''} onClick={(e) => handleItemClick(e, item)}>{label || 'n/a'}</a>
      })}
    </nav>
  )
}

export default SiteNav
 