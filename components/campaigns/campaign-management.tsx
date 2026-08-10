'use client'

import { useState } from 'react'
import { campaigns, type Campaign, type CampaignStatus } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Megaphone, Plus, Search, MoreHorizontal, Play, Pause, Square,
  Pencil, Eye, Bot, Users, Clock, CheckCircle2, XCircle,
  PhoneOutgoing, CalendarClock, TrendingUp, BarChart3, RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<CampaignStatus, { label: string; className: string; dot: string }> = {
  draft:     { label: 'Draft',     className: 'border-border text-muted-foreground',                                dot: 'bg-muted-foreground' },
  scheduled: { label: 'Scheduled', className: 'border-blue-500/30 text-blue-500',                                  dot: 'bg-blue-500' },
  running:   { label: 'Running',   className: 'border-[var(--status-active)]/30 text-[var(--status-active)]',      dot: 'bg-[var(--status-active)]' },
  paused:    { label: 'Paused',    className: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]',    dot: 'bg-[var(--status-warning)]' },
  completed: { label: 'Completed', className: 'border-primary/30 text-primary',                                    dot: 'bg-primary' },
}

function pct(part: number, total: number) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function CampaignManagement() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.agentName.toLowerCase().includes(search.toLowerCase()) ||
      c.objective.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const running   = campaigns.filter((c) => c.status === 'running').length
  const scheduled = campaigns.filter((c) => c.status === 'scheduled').length
  const paused    = campaigns.filter((c) => c.status === 'paused').length
  const totalContacts = campaigns.reduce((s, c) => s + c.totalContacts, 0)
  const totalCompleted = campaigns.reduce((s, c) => s + c.completed, 0)
  const contactRate = pct(campaigns.reduce((s, c) => s + c.contacted, 0), totalCompleted || 1)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campaign Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define, operate, and monitor outbound AI voice campaigns.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Running',         value: running,                                icon: Play,         color: 'text-[var(--status-active)]' },
          { label: 'Scheduled',       value: scheduled,                              icon: CalendarClock, color: 'text-blue-500' },
          { label: 'Paused',          value: paused,                                 icon: Pause,        color: 'text-[var(--status-warning)]' },
          { label: 'Total Contacts',  value: totalContacts.toLocaleString(),         icon: Users,        color: 'text-muted-foreground' },
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

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(['all', 'running', 'scheduled', 'paused', 'draft', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                statusFilter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card py-16">
            <Megaphone className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No campaigns match your criteria.</p>
            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
              Create Campaign
            </Button>
          </div>
        )}
      </div>

      <CreateCampaignDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

function CampaignCard({ campaign: c }: { campaign: Campaign }) {
  const sc = statusConfig[c.status]
  const completedPct = pct(c.completed, c.totalContacts)
  const contactedPct = pct(c.contacted, c.completed || 1)
  const isLive = c.status === 'running'

  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-border/80">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
          isLive ? 'bg-[var(--status-active)]/10' : 'bg-primary/10',
        )}>
          <Megaphone className={cn('h-5 w-5', isLive ? 'text-[var(--status-active)]' : 'text-primary')} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{c.name}</span>
            <Badge variant="outline" className={cn('gap-1', sc.className)}>
              {isLive && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--status-active)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--status-active)]" />
                </span>
              )}
              {sc.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{c.objective}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{c.description}</p>

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-4 flex-wrap">
            <MetaItem icon={Bot} label={c.agentName} />
            <MetaItem icon={Users} label={c.contactListName} />
            <MetaItem icon={CalendarClock} label={`${fmtDate(c.startDate)} → ${fmtDate(c.endDate)}`} />
            <MetaItem icon={Clock} label={`${c.callingHoursStart}–${c.callingHoursEnd} ${c.timezone.split('/')[1]?.replace('_', ' ')}`} />
          </div>
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <ProgressStat label="Progress" value={completedPct} sub={`${c.completed.toLocaleString()} / ${c.totalContacts.toLocaleString()}`} />
          <CallStat label="Contacted" value={c.contacted} color="text-[var(--status-active)]" />
          <CallStat label="Voicemail" value={c.voicemail} color="text-[var(--status-warning)]" />
          <CallStat label="Failed" value={c.failed} color="text-destructive" />
          <CallStat label="Pending" value={c.pending} color="text-muted-foreground" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {c.status === 'running' && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs">
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
          )}
          {c.status === 'paused' && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs">
              <Play className="h-3.5 w-3.5" /> Resume
            </Button>
          )}
          {c.status === 'scheduled' && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs">
              <Play className="h-3.5 w-3.5" /> Start Now
            </Button>
          )}
          {c.status === 'draft' && (
            <Button size="sm" className="h-8 gap-1.5 px-2.5 text-xs">
              <Play className="h-3.5 w-3.5" /> Launch
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2"><Eye className="h-3.5 w-3.5" /> View Details</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Pencil className="h-3.5 w-3.5" /> Edit Campaign</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><BarChart3 className="h-3.5 w-3.5" /> Analytics</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><RefreshCw className="h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
              {(c.status === 'running' || c.status === 'paused') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                    <Square className="h-3.5 w-3.5" /> Stop Campaign
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress bar + config strip */}
      {c.totalContacts > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedPct}% complete</span>
            <span>{c.pending.toLocaleString()} pending · {c.inProgress} in progress</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', isLive ? 'bg-[var(--status-active)]' : 'bg-primary')}
              style={{ width: `${completedPct}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-0.5">
            <span>Max {c.maxCallsPerDay}/day</span>
            <span>·</span>
            <span>{c.concurrentCallLimit} concurrent</span>
            <span>·</span>
            <span>Retry ×{c.retryPolicy.maxAttempts} @ {c.retryPolicy.intervalHours}h</span>
            {c.nextRunAt && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" />
                  Next: {new Date(c.nextRunAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MetaItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate max-w-[160px]">{label}</span>
    </div>
  )
}

function CallStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-0.5 items-end">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-semibold tabular-nums', color)}>{value.toLocaleString()}</span>
    </div>
  )
}

function ProgressStat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="flex flex-col gap-1 w-28">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-medium tabular-nums">{value}%</span>
      </div>
      <Progress value={value} />
      <span className="text-[10px] text-muted-foreground tabular-nums">{sub}</span>
    </div>
  )
}

function CreateCampaignDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* Identity */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campaign Identity</p>
            <div className="flex flex-col gap-1.5">
              <Label>Campaign Name</Label>
              <Input placeholder="e.g. Q4 Sales Outreach — SMB" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea rows={2} placeholder="Brief description of the campaign's purpose." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Business Objective</Label>
              <Select defaultValue="">
                <SelectTrigger><SelectValue placeholder="Select objective" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead-qual">Lead Qualification & Demo Scheduling</SelectItem>
                  <SelectItem value="payment">Payment Recovery</SelectItem>
                  <SelectItem value="appointment">Appointment Confirmation & Rescheduling</SelectItem>
                  <SelectItem value="survey">Customer Satisfaction Survey</SelectItem>
                  <SelectItem value="onboarding">Employee / Customer Onboarding</SelectItem>
                  <SelectItem value="winback">Customer Win-Back</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Agent & Contacts */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent & Audience</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>AI Agent</Label>
                <Select defaultValue="">
                  <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agt-002">Sales Outreach Bot</SelectItem>
                    <SelectItem value="agt-003">Appointment Scheduler</SelectItem>
                    <SelectItem value="agt-004">Collections & Payment</SelectItem>
                    <SelectItem value="agt-001">Customer Support Agent</SelectItem>
                    <SelectItem value="agt-005">IT Help Desk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Contact List</Label>
                <Select defaultValue="">
                  <SelectTrigger><SelectValue placeholder="Select contact list" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cl-001">Enterprise Leads Q3 (2,000)</SelectItem>
                    <SelectItem value="cl-002">Past Due Accounts — Aug (1,850)</SelectItem>
                    <SelectItem value="cl-003">Upcoming Appointments — Aug (1,200)</SelectItem>
                    <SelectItem value="cl-004">July Purchasers (880)</SelectItem>
                    <SelectItem value="cl-005">New Hires — August (42)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Outbound Trunk</Label>
              <Select defaultValue="trunk-003">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trunk-003">VoBiz Outbound — US East</SelectItem>
                  <SelectItem value="trunk-001">VoBiz Inbound — US East</SelectItem>
                  <SelectItem value="trunk-002">Grandstream — US West</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule & Limits</p>
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
              <div className="flex flex-col gap-1.5">
                <Label>Max Calls / Day</Label>
                <Input type="number" defaultValue={100} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Concurrent Call Limit</Label>
                <Input type="number" defaultValue={5} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Retry */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Retry Policy</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Max Retry Attempts</Label>
                <Select defaultValue="2">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No retries</SelectItem>
                    <SelectItem value="1">1 retry</SelectItem>
                    <SelectItem value="2">2 retries</SelectItem>
                    <SelectItem value="3">3 retries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Retry Interval (hours)</Label>
                <Input type="number" defaultValue={4} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Retry on No Answer', key: 'noAnswer' },
                { label: 'Retry on Voicemail', key: 'voicemail' },
                { label: 'Retry on Busy', key: 'busy' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" defaultChecked={item.key !== 'busy'} className="rounded" />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline">Save as Draft</Button>
          <Button>Create & Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
