import { CONTAINERS } from './manifest'

export const ContainerDemos = () => {
    return (
        <div >
            {CONTAINERS?.map((container, i) => {
                const { id, Demo } = container || {}
                if (!Demo) return null
                return <Demo key={id || i} />
            })}
        </div>
    )
}

export default ContainerDemos
