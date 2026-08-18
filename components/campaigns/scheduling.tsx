'use client'

import { useState } from 'react'
import { campaignSchedules, campaigns, type CampaignSchedule, type ScheduleStatus } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CalendarClock, Plus, MoreHorizontal, Play, Pause, Settings2,
  Trash2, Clock, CheckCircle2, AlertTriangle, Ban, Bot,
  Megaphone, RefreshCw, CalendarX, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<ScheduleStatus, { label: string; className: string; dot: string }> = {
  active:    { label: 'Active',    className: 'border-[var(--status-active)]/30 text-[var(--status-active)]',   dot: 'bg-[var(--status-active)]' },
  scheduled: { label: 'Scheduled', className: 'border-blue-500/30 text-blue-500',                               dot: 'bg-blue-500' },
  paused:    { label: 'Paused',    className: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]', dot: 'bg-[var(--status-warning)]' },
  completed: { label: 'Completed', className: 'border-primary/30 text-primary',                                 dot: 'bg-primary' },
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function CampaignScheduling() {
  const [selected, setSelected] = useState<CampaignSchedule>(campaignSchedules[0])
  const [addBlackoutOpen, setAddBlackoutOpen] = useState(false)
  const [newScheduleOpen, setNewScheduleOpen] = useState(false)

  const active    = campaignSchedules.filter((s) => s.status === 'active').length
  const scheduled = campaignSchedules.filter((s) => s.status === 'scheduled').length
  const paused    = campaignSchedules.filter((s) => s.status === 'paused').length
  const totalToday = campaignSchedules.reduce((s, x) => s + x.callsDispatchedToday, 0)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Scheduling</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure when and under what timing constraints campaign calls are executed.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setNewScheduleOpen(true)}>
          <Plus className="h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Schedules',    value: active,      icon: Play,         color: 'text-[var(--status-active)]' },
          { label: 'Scheduled',           value: scheduled,   icon: CalendarClock, color: 'text-blue-500' },
          { label: 'Paused',              value: paused,      icon: Pause,        color: 'text-[var(--status-warning)]' },
          { label: 'Calls Today',         value: totalToday.toLocaleString(), icon: Clock, color: 'text-muted-foreground' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={cn('h-4 w-4', s.color)} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Panel: List + Detail */}
      <div className="grid grid-cols-[340px_1fr] gap-4 items-start">
        {/* Schedule List */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Schedules ({campaignSchedules.length})
          </p>
          {campaignSchedules.map((sch) => {
            const sc = statusConfig[sch.status]
            const isSelected = selected.id === sch.id
            return (
              <button
                key={sch.id}
                onClick={() => setSelected(sch)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors w-full',
                  isSelected
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-card hover:border-border/80 hover:bg-accent/20',
                )}
              >
                <div className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', sc.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{sch.campaignName}</p>
                    <Badge variant="outline" className={cn('text-[10px] shrink-0', sc.className)}>
                      {sc.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{sch.agentName}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span>{sch.callingHoursStart}–{sch.callingHoursEnd}</span>
                    <span>·</span>
                    <span>{sch.callingDays.length}d/wk</span>
                    <span>·</span>
                    <span>{sch.maxCallsPerDay}/day</span>
                  </div>
                  {sch.nextExecution && (
                    <p className="text-[11px] text-blue-500 mt-1">
                      Next: {fmtDateTime(sch.nextExecution)}
                    </p>
                  )}
                  {sch.callsDispatchedToday > 0 && (
                    <p className="text-[11px] text-[var(--status-active)] mt-0.5">
                      {sch.callsDispatchedToday} calls dispatched today
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Schedule Detail / Config */}
        <ScheduleDetailPanel
          schedule={selected}
          onAddBlackout={() => setAddBlackoutOpen(true)}
        />
      </div>

      <AddBlackoutDialog open={addBlackoutOpen} onClose={() => setAddBlackoutOpen(false)} />
      <NewScheduleDialog open={newScheduleOpen} onClose={() => setNewScheduleOpen(false)} />
    </div>
  )
}

function ScheduleDetailPanel({
  schedule: s,
  onAddBlackout,
}: {
  schedule: CampaignSchedule
  onAddBlackout: () => void
}) {
  const sc = statusConfig[s.status]
  const campaign = campaigns.find((c) => c.id === s.campaignId)

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold">{s.campaignName}</p>
                <Badge variant="outline" className={cn('gap-1', sc.className)}>
                  {s.status === 'active' && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--status-active)] opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--status-active)]" />
                    </span>
                  )}
                  {sc.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Bot className="h-3.5 w-3.5" />{s.agentName}</span>
                <span>·</span>
                <span className="font-mono">{s.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {s.status === 'active' && (
              <Button size="sm" variant="outline" className="gap-1.5">
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
            {s.status === 'paused' && (
              <Button size="sm" variant="outline" className="gap-1.5">
                <Play className="h-4 w-4" /> Resume
              </Button>
            )}
            {s.status === 'scheduled' && (
              <Button size="sm" variant="outline" className="gap-1.5">
                <Play className="h-4 w-4" /> Start Now
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="gap-2"><Settings2 className="h-3.5 w-3.5" /> Edit Schedule</DropdownMenuItem>
                <DropdownMenuItem className="gap-2"><RefreshCw className="h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Delete Schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Execution stats */}
        <div className="mt-4 grid grid-cols-4 gap-3 rounded-lg bg-muted/40 p-3">
          <StatCell label="Total Executions" value={s.totalExecutions.toString()} />
          <StatCell label="Calls Today" value={s.callsDispatchedToday.toString()} highlight={s.callsDispatchedToday > 0} />
          <StatCell label="Last Run" value={fmtDateTime(s.lastExecution)} />
          <StatCell label="Next Run" value={fmtDateTime(s.nextExecution)} highlight={!!s.nextExecution} />
        </div>
      </div>

      {/* Config grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Timing config */}
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Timing Configuration</h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Timezone</Label>
              <Select defaultValue={s.timezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">America / New York (ET)</SelectItem>
                  <SelectItem value="America/Chicago">America / Chicago (CT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America / Los Angeles (PT)</SelectItem>
                  <SelectItem value="Europe/London">Europe / London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Start Date</Label>
                <Input type="date" defaultValue={s.startDate} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>End Date</Label>
                <Input type="date" defaultValue={s.endDate} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Calling Hours Start</Label>
                <Input type="time" defaultValue={s.callingHoursStart} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Calling Hours End</Label>
                <Input type="time" defaultValue={s.callingHoursEnd} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Calling Days</Label>
              <div className="flex gap-1.5 flex-wrap">
                {ALL_DAYS.map((d) => (
                  <button
                    key={d}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                      s.callingDays.includes(d)
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-border/80',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button variant="outline" size="sm">Discard</Button>
            <Button size="sm">Save Timing</Button>
          </div>
        </div>

        {/* Limits config */}
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Call Limits & Execution</h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Max Calls Per Day</Label>
              <Input type="number" defaultValue={s.maxCallsPerDay} />
              <p className="text-xs text-muted-foreground">
                {s.callsDispatchedToday} dispatched today ({Math.round((s.callsDispatchedToday / s.maxCallsPerDay) * 100)}% of limit)
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Concurrent Call Limit</Label>
              <Input type="number" defaultValue={s.concurrentCallLimit} />
              <p className="text-xs text-muted-foreground">Maximum simultaneous active calls for this campaign.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Execution Mode</Label>
              <Select defaultValue="continuous">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="continuous">Continuous (run until daily limit)</SelectItem>
                  <SelectItem value="burst">Burst (dispatch all at once)</SelectItem>
                  <SelectItem value="paced">Paced (evenly spread over hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3 pt-1">
              {[
                { label: 'Pause on High Failure Rate', desc: 'Auto-pause if failure rate exceeds 20%.', on: true },
                { label: 'Respect DNC List', desc: 'Skip contacts on the DNC registry.', on: true },
                { label: 'TCPA Compliance Mode', desc: 'Enforce calling hour restrictions strictly.', on: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button variant="outline" size="sm">Discard</Button>
            <Button size="sm">Save Limits</Button>
          </div>
        </div>
      </div>

      {/* Blackout Periods */}
      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Blackout Periods</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Date ranges during which no calls will be dispatched for this campaign.
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onAddBlackout}>
            <Plus className="h-4 w-4" />
            Add Blackout
          </Button>
        </div>

        {s.blackoutPeriods.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
            <CalendarX className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No blackout periods configured.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {s.blackoutPeriods.map((bp) => (
              <div key={bp.id} className="flex items-center gap-4 rounded-lg border border-border bg-background px-4 py-3">
                <CalendarX className="h-4 w-4 text-[var(--status-warning)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{bp.label}</p>
                  <p className="text-xs text-muted-foreground">{bp.reason}</p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {fmtDate(bp.startDate)}
                  {bp.startDate !== bp.endDate && ` → ${fmtDate(bp.endDate)}`}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2"><Pencil className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign relationship summary */}
      {campaign && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-3">Campaign Context</h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Campaign</span>
              <div className="flex items-center gap-1.5">
                <Megaphone className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium truncate">{campaign.name}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Contact List</span>
              <span className="font-medium">{campaign.contactListName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Outbound Trunk</span>
              <span className="font-mono font-medium">{campaign.trunkId}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Contacts</span>
              <span className="font-medium tabular-nums">{campaign.totalContacts.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending</span>
              <span className="font-medium tabular-nums">{campaign.pending.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Retry Policy</span>
              <span className="font-medium">×{campaign.retryPolicy.maxAttempts} @ {campaign.retryPolicy.intervalHours}h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-semibold', highlight ? 'text-[var(--status-active)]' : 'text-foreground')}>
        {value}
      </span>
    </div>
  )
}

// Pencil icon used in blackout dropdown — import it
import { Pencil } from 'lucide-react'

function AddBlackoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Blackout Period</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Label</Label>
            <Input placeholder="e.g. Independence Day, System Maintenance" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>End Date</Label>
              <Input type="date" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Reason</Label>
            <Input placeholder="Brief reason for the blackout" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Apply To</Label>
            <Select defaultValue="this">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="this">This campaign only</SelectItem>
                <SelectItem value="all">All active campaigns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>Add Blackout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NewScheduleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Schedule</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Campaign</Label>
            <Select defaultValue="">
              <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
              <SelectContent>
                {campaigns.filter((c) => c.status !== 'completed').map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Timezone</Label>
            <Select defaultValue="America/New_York">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">America / New York (ET)</SelectItem>
                <SelectItem value="America/Chicago">America / Chicago (CT)</SelectItem>
                <SelectItem value="America/Los_Angeles">America / Los Angeles (PT)</SelectItem>
                <SelectItem value="Europe/London">Europe / London (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>End Date</Label>
              <Input type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Calling Hours Start</Label>
              <Input type="time" defaultValue="09:00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Calling Hours End</Label>
              <Input type="time" defaultValue="18:00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Max Calls / Day</Label>
              <Input type="number" defaultValue={100} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Concurrent Limit</Label>
              <Input type="number" defaultValue={5} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Calling Days</Label>
            <div className="flex gap-1.5">
              {ALL_DAYS.map((d, i) => (
                <button
                  key={d}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    i < 5
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>Create Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
