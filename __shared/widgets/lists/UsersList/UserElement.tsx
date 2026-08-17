import './css/user-item.css'
import type { RenderItemProps } from '../../../components/RenderItems/RenderItems.types'

export const UserElement = (props?: RenderItemProps) => {
  const { name, title, label } = props || {}

  const shown_name = String(label || name || 'untitled')
  const name_words = shown_name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const title_words = String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const has_own_title = !!title_words && title_words !== name_words

  return (
    <div className='user-item'>
      <div className='name'>{shown_name}</div>
      {has_own_title ? <div className='title'>{String(title)}</div> : null}
    </div>
  )
}

export default UserElement
