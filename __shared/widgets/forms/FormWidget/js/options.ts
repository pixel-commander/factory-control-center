export interface OptionItemProps {
  id: string,
  name: string,
}

export const WORK_STATUS: OptionItemProps[] = [
  { id: 'open', name: 'OPEN' },
  { id: 'active', name: 'IN PROGRESS' },
  { id: 'waiting', name: 'WAITING' },
  { id: 'blocked', name: 'BLOCKED' },
  { id: 'review', name: 'REVIEW' },
  { id: 'done', name: 'DONE' },
]

export const PRIORITY: OptionItemProps[] = [
  { id: 'low', name: 'LOW' },
  { id: 'normal', name: 'NORMAL' },
  { id: 'high', name: 'HIGH' },
  { id: 'urgent', name: 'URGENT' },
]
