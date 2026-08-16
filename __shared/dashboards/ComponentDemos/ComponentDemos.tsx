import './css/component-demos.css'
import type { ComponentDemosProps } from './ComponentDemos.types'
import {GridCell} from '../../components/GridCell/GridCell'
import {Nav} from '../../components/Nav/Nav'
import type { NavProps } from '../../components/Nav/Nav.types'
import { useURL } from '../../hooks/useURL/useURL'
import { ButtonDemos } from './ButtonDemos'
import { ContainerDemos } from './ContainerDemos'
import StatelessFormDemo from '../../components/StatelessForm/demo/Demo'
import CalendarDemo from '../../components/Calendar/demo/Demo'
import RenderItemsDemo from '../../components/RenderItems/demo/Demo'
import IdeDemo from '../../components/Ide/demo/Demo'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. what are the tabs (if any)
 * 3. is there a nav bar (if any)
 * 4. are there specific cell_classes for the grid areas
 **/



// ONE ENTRY PER DEMO PAGE. The id IS the url segment and the key into DEMOS
// below -- add a page, add a line, and the two stay in step because a typo in
// either lands on 'invalid selection' rather than a blank screen.
const TABS = [{
  id: 'containers',
  label: 'containers',
  path: 'containers'
},{
  id: 'buttons',
  label: 'buttons',
  path: 'buttons'
},{
  id: 'stateless-form',
  label: 'stateless form',
  path: 'stateless-form'
},{
  id: 'calendar',
  label: 'calendar',
  path: 'calendar'
},{
  id: 'render-items',
  label: 'render items',
  path: 'render-items'
},{
  id: 'ide',
  label: 'ide',
  path: 'ide'
}]

// TabsNav OWNS THE URL; Nav just draws. It reads its own segment (`page`) and
// hands Nav the two things Nav cannot know: which item is open, and what a
// click means. See components/Nav/Nav.tsx.
export const Side = ({
  className,
  is_vertical = true,
  nav_items = TABS,
  container_class = 'tab-nav',
  item_class = 'tab-nav-button',
  selected
}: Partial<NavProps>) => {

  const [{page}, go] = useURL()

  const nav_settings = {
    className,
    nav_items,
    container_class,
    item_class,
    is_vertical,
    // no segment written yet -> the first tab is the open one
    selected: String(page || selected || nav_items?.[0]?.path || ''),
    handleClick: (item?: { path?: string }) => go('set-path', { page: item?.path })
  }

  return <Nav {...nav_settings} />

}

// THE ROUTER. key = the tab's id = the url segment.
// The first three are LISTS (a manifest of many demos); the last two are single
// components wired straight in by hand -- no manifest entry, nothing to keep in
// step, because there is only ever one of each.
const DEMOS: Record<string, () => React.JSX.Element> = {
  buttons: ButtonDemos,
  containers: ContainerDemos,
  'stateless-form': StatelessFormDemo,
  calendar: CalendarDemo,
  'render-items': RenderItemsDemo,
  ide: IdeDemo
}

const Main = () => {

  const [{page}] = useURL()

  let Demo = () => <>Choose a demo to the left</>

  if (page) Demo = DEMOS?.[String(page)] || (() => <>invalid selection</>)

  // THE GRID BELONGS HERE, NOT IN EACH DEMO. A demo whose root is `grid
  // with-header` needs a grid PARENT for its data-area children to land in --
  // without one the areas collapse and the demo renders as a plain stack.
  // ContainerDemos and the other list pages each wrapped their own, so the two
  // hand-wired demos looked different from the same component in a list.
  return (
    <div className='grid'>
      <Demo />
    </div>
  )
}
const ComponentDemos = ({
  className,
  grid_type = 'side-l',
 }: ComponentDemosProps) => {
  className=`grid ${grid_type} ${className || ''}`.trim()

  return (
    <div className={className}>
      <GridCell area='side'>
        <Side />
      </GridCell>
      <GridCell area='main' has_padding={true}>
        <Main />
      </GridCell>
    </div>
  )
}

export default ComponentDemos
 