import { ITEMS } from './manifest'

export const ItemDemos = () => {
    return (
        <div>
            {ITEMS?.map((item, i) => {
                const { id, Demo } = item || {}
                if (!Demo) return null
                return <Demo key={id || i} />
            })}
        </div>
    )
}

export default ItemDemos
