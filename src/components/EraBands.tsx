import type { Event } from '../data/types'

const PERIODS = [
  { name: 'Period 1', start: 1491, end: 1607 },
  { name: 'Period 2', start: 1607, end: 1754 },
  { name: 'Period 3', start: 1754, end: 1800 },
  { name: 'Period 4', start: 1800, end: 1848 },
  { name: 'Period 5', start: 1844, end: 1877 },
  { name: 'Period 6', start: 1865, end: 1898 },
  { name: 'Period 7', start: 1890, end: 1945 },
  { name: 'Period 8', start: 1945, end: 1980 },
  { name: 'Period 9', start: 1980, end: 2099 },
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

  // A section break in the record rather than a filled band: the label sits on
  // the baseline of a rule that runs out to the edge of the pane.
  return (
    <div className="flex items-center gap-3 pt-3 pb-1">
      <span className="label-mono text-om-gold">{current.name}</span>
      <span className="label-mono text-om-muted">
        {current.start}&ndash;{current.end === 2099 ? 'present' : current.end}
      </span>
      <span className="flex-1 h-px bg-om-border" />
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
