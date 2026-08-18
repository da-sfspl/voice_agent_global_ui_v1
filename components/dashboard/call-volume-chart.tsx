'use client'

const data = [
  { day: 'Mon', inbound: 342, outbound: 218 },
  { day: 'Tue', inbound: 428, outbound: 305 },
  { day: 'Wed', inbound: 391, outbound: 271 },
  { day: 'Thu', inbound: 512, outbound: 388 },
  { day: 'Fri', inbound: 467, outbound: 342 },
  { day: 'Sat', inbound: 198, outbound: 112 },
  { day: 'Sun', inbound: 156, outbound: 89 },
]

const maxVal = Math.max(...data.flatMap((d) => [d.inbound, d.outbound]))

export function CallVolumeChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Call Volume</h3>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-primary" />
            Inbound
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-chart-2" />
            Outbound
          </span>
        </div>
      </div>

      <div className="flex h-36 items-end gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end gap-0.5" style={{ height: '120px' }}>
              <div
                className="flex-1 rounded-sm bg-primary/80 transition-all"
                style={{ height: `${(d.inbound / maxVal) * 100}%` }}
                title={`Inbound: ${d.inbound}`}
              />
              <div
                className="flex-1 rounded-sm bg-chart-2/80 transition-all"
                style={{ height: `${(d.outbound / maxVal) * 100}%` }}
                title={`Outbound: ${d.outbound}`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
