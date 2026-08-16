/**
 * THE HARDWARE, AS DATA.
 *
 * The rails are the only part whose height is unknown, so every tube, joint and
 * led is placed as a FRACTION of it. The original painted them on a <canvas> for
 * exactly that reason; the css version drops the canvas and drives the same
 * fractions through percentage top/height instead.
 *
 * The README that came with the css said the trade was "you set the fractions
 * inline in your markup instead of in a data array" -- so they are back in a data
 * array here. The markup loops; nothing is hand-placed twice, and moving a tube
 * is editing one number in one place.
 */

export type TubeColor = 'pink' | 'cyan'
export type LedColor = 'green' | 'amber' | 'cyan' | 'pink'

export interface TubeProps {
  color?: TubeColor,
  top?: string,
  height?: string,
  breathes?: boolean
}

export interface LedProps {
  color?: LedColor,
  top?: string,
  blinks?: boolean
}

export interface RailProps {
  side?: 'left' | 'right',
  tubes?: TubeProps[],
  joints?: string[],
  leds?: LedProps[]
}

export interface TrimTubeProps {
  color?: TubeColor,
  left?: string,
  right?: string,
  width?: string
}

export interface TrimProps {
  edge?: 'top' | 'bottom',
  tubes?: TrimTubeProps[],
  blocks?: string[]
}

// carried from Chassis.tsx, unchanged -- they are just percentages, move them
// freely
export const RAILS: RailProps[] = [{
  side: 'left',
  tubes: [
    { color: 'pink', top: '19%', height: '16%', breathes: true },
    { color: 'cyan', top: '40%', height: '19%', breathes: true },
    { color: 'pink', top: '66.5%', height: '31%', breathes: true }
  ],
  joints: ['36.5%', '61%'],
  leds: [
    { color: 'green', top: '15%', blinks: true },
    { color: 'amber', top: '50%' },
    { color: 'cyan', top: '84%', blinks: true }
  ]
},{
  side: 'right',
  tubes: [
    { color: 'cyan', top: '2.5%', height: '31%', breathes: true },
    { color: 'pink', top: '40%', height: '22%', breathes: true },
    { color: 'cyan', top: '69.5%', height: '14%', breathes: true }
  ],
  joints: ['34.5%', '66%'],
  leds: [
    { color: 'cyan', top: '12%', blinks: true },
    { color: 'pink', top: '48%' },
    { color: 'green', top: '86%', blinks: true }
  ]
}]

export const TRIMS: TrimProps[] = [{
  edge: 'top',
  tubes: [
    { color: 'pink', left: '8%', width: '7%' },
    { color: 'cyan', right: '18%', width: '11%' }
  ],
  blocks: ['34%', '58%']
},{
  edge: 'bottom',
  tubes: [
    { color: 'pink', left: '14%', width: '16%' },
    { color: 'cyan', right: '12%', width: '12%' }
  ],
  blocks: ['44%']
}]

export const CORNERS = ['tl', 'tr', 'bl', 'br'] as const
