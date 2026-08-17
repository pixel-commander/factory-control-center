import { EFFECTS } from './manifest'

export const EffectDemos = () => {
    return (
        <div>
            {EFFECTS?.map((item, i) => {
                const { id, Demo } = item || {}
                if (!Demo) return null
                return <Demo key={id || i} />
            })}
        </div>
    )
}

export default EffectDemos
