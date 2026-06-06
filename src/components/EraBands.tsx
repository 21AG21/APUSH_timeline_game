import type { Event } from '../data/types'

const PERIODS = [
  { name: 'Period 1', start: 1491, end: 1607, color: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800' },
  { name: 'Period 2', start: 1607, end: 1754, color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
  { name: 'Period 3', start: 1754, end: 1800, color: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800' },
  { name: 'Period 4', start: 1800, end: 1848, color: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800' },
  { name: 'Period 5', start: 1844, end: 1877, color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' },
  { name: 'Period 6', start: 1865, end: 1898, color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' },
  { name: 'Period 7', start: 1890, end: 1945, color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
  { name: 'Period 8', start: 1945, end: 1980, color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
  { name: 'Period 9', start: 1980, end: 2099, color: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800' },
]

export function getPeriod(year: number) {
  return PERIODS.find((p) => year >= p.start && year < p.end) ?? PERIODS[PERIODS.length - 1]
}

interface EraHeaderProps {
  year: number
  prevYear: number | null
}

export function EraBandHeader({ year, prevYear }: EraHeaderProps) {
  const current = getPeriod(year)
  const prev = prevYear !== null ? getPeriod(prevYear) : null

  if (prev && prev.name === current.name) return null

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded border text-xs font-medium my-1 ${current.color}`}
    >
      <span className={current.color.split(' ')[0].replace('bg-', 'text-').replace('/30', '')}>
        {current.name}
      </span>
      <span className="text-gray-400 dark:text-gray-500">
        {current.start}–{current.end === 2099 ? 'present' : current.end}
      </span>
    </div>
  )
}

interface TimelineWithBandsProps {
  events: Event[]
  renderCard: (event: Event, index: number) => React.ReactNode
  renderSlot: (index: number) => React.ReactNode
  hasCurrentEvent: boolean
}

export function TimelineWithBands({ events, renderCard, renderSlot, hasCurrentEvent }: TimelineWithBandsProps) {
  const items: React.ReactNode[] = []

  if (hasCurrentEvent) {
    items.push(<div key="slot-0">{renderSlot(0)}</div>)
  }

  events.forEach((event, i) => {
    const prevYear = i > 0 ? events[i - 1].year : null
    items.push(
      <EraBandHeader key={`era-${event.id}`} year={event.year} prevYear={prevYear} />
    )
    items.push(<div key={event.id}>{renderCard(event, i)}</div>)
    if (hasCurrentEvent) {
      items.push(<div key={`slot-${i + 1}`}>{renderSlot(i + 1)}</div>)
    }
  })

  return <>{items}</>
}
