import '../css/styles.css'
import '../css/grid.css'
import '../css/theme.css'
import './css/chrome.css'

import { useURL } from '../hooks/useURL/useURL'
import { GridCell } from '../components/GridCell/GridCell'

import ComponentDemos from '../dashboards/ComponentDemos/ComponentDemos'
import {SiteNav} from './components/SiteNav/SiteNav'

const NAV_ITEMS = [{
    id: 'demos',
    label: 'demos',
    path: 'demos',
    View: ComponentDemos,
}]

export const Chrome = () => {
    const [{main}, go] = useURL()
    let ViewToLoad = NAV_ITEMS?.[0]?.View || (() => <div>4o4</div>)
    if (main)  ViewToLoad = NAV_ITEMS?.find(({id}) => id === main)?.View || (() => <div>4o4</div>)
    const site_nav_settings = {
        nav_items: NAV_ITEMS,
        handleClick: (x?: { path?: string, id?: string }) => go('set-path', { main: x?.path || x?.id })
    }
    return (
        <div className='site-chrome grid with-header with-footer'>
            <GridCell area='header'>
                <SiteNav {...site_nav_settings} />
            </GridCell>
            <GridCell area='main'>
                <ViewToLoad />
            </GridCell>
            <GridCell area='footer'>footer</GridCell>
        </div>
    )
}