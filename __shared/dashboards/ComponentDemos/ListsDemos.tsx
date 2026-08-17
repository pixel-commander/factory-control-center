import { LISTS } from './manifest'
import { GridCell } from '@components/GridCell/GridCell'
import { Nav } from '@components/Nav/Nav'
import { useURL } from '../../hooks/useURL/useURL'

export const ListsDemos = () => {
  const [{ view }, go] = useURL()

  const nav_items = (LISTS || []).map((widget) => ({
    id: String(widget?.id || ''),
    label: String(widget?.name || ''),
    path: String(widget?.id || ''),
  }))

  const held = String(view || '')
  const selected = (LISTS || []).filter((widget) => widget?.id === held)[0]
  const Demo = selected?.Demo

  const nav_settings = {
    nav_items,
    is_vertical: true,
    container_class: 'tab-nav',
    item_class: 'tab-nav-button',
    selected: held,
    handleClick: (item?: { path?: string }) => go('update-path', { view: item?.path }),
  }

  return (
    <div className='grid side-l'>
      <GridCell area='side'>
        <Nav {...nav_settings} />
      </GridCell>
      <GridCell area='main' has_padding={true}>
        {held ? (Demo ? <Demo /> : <>invalid selection</>) : <>Choose a demo to the left</>}
      </GridCell>
    </div>
  )
}

export default ListsDemos
