import '../css/styles.css'
import '../css/grid.css'
import '../css/theme.css'
import './css/chrome.css'

import type { ChromeProps, ChromeNavItemProps } from './Chrome.types'
import { useURL } from '../hooks/useURL/useURL'
import { Nav } from '../components/Nav/Nav'
import { ChromeWrapper } from './components/ChromeWrapper/ChromeWrapper'

import ComponentDemos from '../dashboards/ComponentDemos/ComponentDemos'
import Appointments from '../dashboards/Appointments/Appointments'
import CommsCenter from '../dashboards/CommsCenter/CommsCenter'
import Projects from '../dashboards/Projects/Projects'
import Organizer from '../dashboards/Organizer/Organizer'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this chrome loop through data? if so, what is the item_class
 * 3. is there a container_class for this chrome?
 **/

/**
 * THE PAGE SHAPE. header, left, main, right, footer are named regions, so any
 * screen drops into main without knowing what surrounds it.
 *
 * THE PAGE NEVER SCROLLS -- the frame is 100dvh, header and footer are
 * max-content, body is the single 1fr row, and any region that can overflow
 * scrolls ITSELF. No page scrollbar can exist because no region is ever taller
 * than its cell.
 *
 * AN EMPTY RAIL IS NOT A RAIL: the body grid collapses to whichever rails were
 * actually passed, so a page with no right rail does not leave a blank gutter
 * beside main.
 */

// EVERY ITEM CARRIES ITS VIEW, so a tab can never land on a blank body -- the
// thing that is clicked and the thing that renders are the same row.
// The placeholders are real pages that say they are placeholders; an empty main
// looks identical to a broken one.
const Placeholder = (word: string) => () => (
    <div className='grid pad'>
        <span className='site-chrome-note'>{word} — nothing here yet</span>
    </div>
)

const NAV_ITEMS: ChromeNavItemProps[] = [{
    id: 'demos',
    label: 'demos',
    path: 'demos',
    View: ComponentDemos,
},{
    id: 'appointments',
    label: 'appointments',
    path: 'appointments',
    View: Appointments,
},{
    id: 'comms-center',
    label: 'comms center',
    path: 'comms-center',
    View: CommsCenter,
},{
    id: 'projects',
    label: 'projects',
    path: 'projects',
    View: Projects,
},{
    id: 'organizer',
    label: 'organizer',
    path: 'organizer',
    View: Organizer,
},{
    id: 'floor',
    label: 'floor',
    path: 'floor',
    View: Placeholder('FLOOR'),
},{
    id: 'lines',
    label: 'lines',
    path: 'lines',
    View: Placeholder('LINES'),
},{
    id: 'reports',
    label: 'reports',
    path: 'reports',
    View: Placeholder('REPORTS'),
}]

export const Chrome = ({
    className,
    nav_items = NAV_ITEMS,
    title = 'DESIGN SYSTEM',
    description = 'v.0.1',
    status = 'SYSTEMS NOMINAL',
    badge = 'RB',
    Header,
    Left,
    Main,
    Right,
    Footer,
    header_class = 'container-panel',
    left_class = 'container-panel',
    main_class = '',
    right_class = 'container-panel',
    footer_class = 'container-panel',
    brand_class = 'container-well',
    avatar_class = 'button-ghost',
    handleClick,
    children
}: ChromeProps) => {

    const [{ main }, go] = useURL()

    let ViewToLoad = nav_items?.[0]?.View || (() => <div>4o4</div>)
    if (main) ViewToLoad = nav_items?.find(({ id }) => id === main)?.View || (() => <div>4o4</div>)

    const nav_settings = {
        nav_items,
        selected: String(main || nav_items?.[0]?.path || ''),
        // site-nav, not tab-nav: the enclosed-well styling lives in
        // components/SiteNav/css/site-nav.css and it styles .nav-item itself, so
        // the items need no atom of their own.
        container_class: 'site-nav',
        item_class: '',
        handleClick: (x?: { path?: string, id?: string }) => go('set-path', { main: x?.path || x?.id })
    }

    // AN EMPTY RAIL IS NOT A RAIL -- see the css. Only rails that were passed get
    // a column.
    const has_left = !!Left
    const has_right = !!Right
    const rails = has_left && has_right ? 'both' : has_left ? 'left' : has_right ? 'right' : 'none'

    return (
        <ChromeWrapper>
            <div className={`site-chrome grid ${className || ''}`.trim()}>

                <div className={`site-chrome-header ${header_class || ''}`.trim()} data-area='header'>
                    {Header ? <Header /> : (
                        <>
                            <div className={`site-chrome-brand ${brand_class || ''}`.trim()}>
                                <span className='site-chrome-wordmark'>R<em>a</em>BIT</span>
                                <span className='site-chrome-version'>{title}</span>
                            </div>
                            <div className='site-chrome-nav'>
                                <Nav {...nav_settings} />
                            </div>
                            <div className='site-chrome-badge'>
                                <span className={`site-chrome-avatar ${avatar_class || ''}`.trim()} onClick={handleClick}>{badge}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className={`site-chrome-body rails-${rails}`}>
                    {has_left ? (
                        <div className={`site-chrome-left ${left_class || ''}`.trim()} data-area='left'>
                            {Left ? <Left /> : null}
                        </div>
                    ) : null}

                    <div className={`site-chrome-main ${main_class || ''}`.trim()} data-area='main'>
                        {children}
                        {Main ? <Main /> : <ViewToLoad />}
                    </div>

                    {has_right ? (
                        <div className={`site-chrome-right ${right_class || ''}`.trim()} data-area='right'>
                            {Right ? <Right /> : null}
                        </div>
                    ) : null}
                </div>

                <div className={`site-chrome-footer ${footer_class || ''}`.trim()} data-area='footer'>
                    {Footer ? <Footer /> : (
                        <>
                            <span className='site-chrome-note'>{description}</span>
                            <span className='site-chrome-status'>{status}</span>
                        </>
                    )}
                </div>

            </div>
        </ChromeWrapper>
    )
}

export default Chrome
