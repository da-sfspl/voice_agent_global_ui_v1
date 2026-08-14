'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const data = [
  { day: 'Mon', inbound: 342, outbound: 218 },
  { day: 'Tue', inbound: 428, outbound: 305 },
  { day: 'Wed', inbound: 391, outbound: 271 },
  { day: 'Thu', inbound: 512, outbound: 388 },
  { day: 'Fri', inbound: 467, outbound: 342 },
  { day: 'Sat', inbound: 198, outbound: 112 },
  { day: 'Sun', inbound: 156, outbound: 89 },
]

// Previous 7-day period — used only to compute the header trend (not rendered)
const prevData = [
  { day: 'Mon', inbound: 300, outbound: 180 },
  { day: 'Tue', inbound: 395, outbound: 245 },
  { day: 'Wed', inbound: 350, outbound: 230 },
  { day: 'Thu', inbound: 490, outbound: 310 },
  { day: 'Fri', inbound: 440, outbound: 280 },
  { day: 'Sat', inbound: 185, outbound: 115 },
  { day: 'Sun', inbound: 150, outbound: 84 },
]

const maxTotal = Math.max(...data.map((d) => d.inbound + d.outbound))
const totalCalls = data.reduce((s, d) => s + d.inbound + d.outbound, 0)
const prevTotal = prevData.reduce((s, d) => s + d.inbound + d.outbound, 0)
const changePct = ((totalCalls - prevTotal) / prevTotal) * 100

const fullDay: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
}

export function CallVolumeChart() {
  const [hovered, setHovered] = useState<number | null>(null)
  const hd = hovered !== null ? data[hovered] : null

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Call Volume</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            <span>Last 7 days</span>
            <span aria-hidden>·</span>
            <span className="font-medium tabular-nums text-foreground">{totalCalls.toLocaleString()} total calls</span>
            <span className={cn(
              'inline-flex items-center gap-0.5 rounded px-1 py-px text-[10px] font-medium tabular-nums',
              changePct >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            )}>
              {changePct >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" />Inbound</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-chart-2" />Outbound</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[120px]">
        {/* baseline + subtle gridlines */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border" />
        {[0.25, 0.5, 0.75].map((f) => (
          <div key={f} className="pointer-events-none absolute inset-x-0 border-t border-border/50" style={{ bottom: `${f * 100}%` }} />
        ))}

        {/* stacked bars */}
        <div className="absolute inset-0 flex items-end gap-2" onMouseLeave={() => setHovered(null)}>
          {data.map((d, i) => {
            const total = d.inbound + d.outbound
            return (
              <div key={d.day} className="flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHovered(i)}>
                <div
                  className={cn(
                    'flex w-full max-w-[30px] flex-col-reverse overflow-hidden rounded-t-md rounded-b-sm transition-all duration-300',
                    hovered !== null && hovered !== i && 'opacity-50'
                  )}
                  style={{ height: `${(total / maxTotal) * 100}%` }}
                >
                  <div className="w-full bg-primary" style={{ height: `${(d.inbound / total) * 100}%` }} />
                  <div className="w-full bg-chart-2" style={{ height: `${(d.outbound / total) * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* hover tooltip */}
        {hd && hovered !== null && (
          <div
            className="pointer-events-none absolute bottom-full mb-2 z-10 w-max rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md"
            style={{
              left: `${((hovered + 0.5) / data.length) * 100}%`,
              transform: hovered === 0 ? 'translateX(0)' : hovered === data.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
            }}
          >
            <p className="mb-1 font-semibold text-foreground">{fullDay[hd.day]}</p>
            <div className="space-y-0.5 tabular-nums">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-primary" />Inbound</span>
                <span className="font-medium text-foreground">{hd.inbound.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-chart-2" />Outbound</span>
                <span className="font-medium text-foreground">{hd.outbound.toLocaleString()}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-1">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{(hd.inbound + hd.outbound).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Day labels */}
      <div className="mt-1.5 flex gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex-1 text-center text-[10px] text-muted-foreground">{d.day}</div>
        ))}
      </div>
    </div>
  )
}