import { ATOMS } from './manifest'

export const ButtonDemos = () => {
    return (
        <div>
            {ATOMS?.map((atom, i) => {
                const { id, Demo } = atom || {}
                if (!Demo) return null
                return <Demo key={id || i} />
            })}
        </div>
    )
}

export default ButtonDemos
