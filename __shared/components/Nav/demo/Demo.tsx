import { Nav } from '../Nav'

const ITEMS = [{
  id: 'one',
  label: 'one',
  path: 'one'
},{
  id: 'two',
  label: 'two',
  path: 'two'
},{
  id: 'three',
  label: 'three',
  path: 'three'
}]

export const Demo = () => {

  return (
    <div>
    <div className="grid with-header">
       <div className='pad-sm'>nav</div>
       <Nav nav_items={ITEMS} selected='one' />
    </div>
    <div className="grid with-header">
       <div className='pad-sm'>nav is-vertical</div>
       <Nav nav_items={ITEMS} selected='two' is_vertical={true} />
    </div>
    <div className="grid with-header">
       <div className='pad-sm'>nav with atoms</div>
       <Nav
         nav_items={ITEMS}
         selected='three'
         is_vertical={true}
         container_class='container-main'
         item_class='tab-nav-button'
       />
    </div>
    </div>
  )
}

export default Demo
