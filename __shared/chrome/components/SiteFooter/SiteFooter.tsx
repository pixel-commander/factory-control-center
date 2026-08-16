import './css/site-footer.css'
import type { SiteFooterProps } from './SiteFooter.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this site-footer loop through data? if so, what is the item_class
 * 3. is there a container_class for this site-footer?
 **/

export const SiteFooter = ({ className }: SiteFooterProps) => {
  className=`grid site-footer ${className || ''}`.trim()

  return <footer className={className}>v.11</footer>
}

export default SiteFooter
 