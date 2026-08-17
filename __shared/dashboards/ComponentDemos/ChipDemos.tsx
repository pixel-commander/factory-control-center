import { CHIPS } from './manifest'

export const ChipDemos = () => {
    return (
        <div>
            {CHIPS?.map((item, i) => {
                const { id, Demo } = item || {}
                if (!Demo) return null
                return <Demo key={id || i} />
            })}
        </div>
    )
}

export default ChipDemos
