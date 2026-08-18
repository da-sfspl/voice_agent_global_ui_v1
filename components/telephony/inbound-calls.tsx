'use client'

import { useState } from 'react'
import { inboundCalls, inboundRoutes, phoneNumbers, agents, type InboundRoute, type CallRecord } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PhoneIncoming, Search, Plus, MoreHorizontal, Settings2, Play, Pause,
  Mic2, Clock, CheckCircle2, XCircle, PhoneMissed, PhoneForwarded,
  Download, Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  completed: { label: 'Completed', className: 'border-[var(--status-active)]/30 text-[var(--status-active)]', icon: CheckCircle2 },
  missed:    { label: 'Missed',    className: 'border-destructive/30 text-destructive', icon: PhoneMissed },
  dropped:   { label: 'Dropped',   className: 'border-destructive/30 text-destructive', icon: XCircle },
  transferred: { label: 'Transferred', className: 'border-blue-500/30 text-blue-500', icon: PhoneForwarded },
  voicemail: { label: 'Voicemail', className: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]', icon: Mic2 },
  failed:    { label: 'Failed',    className: 'border-destructive/30 text-destructive', icon: XCircle },
}

const sentimentDot: Record<string, string> = {
  positive: 'bg-[var(--status-active)]',
  neutral:  'bg-muted-foreground',
  negative: 'bg-destructive',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Mock Data: Phone Numbers
const availableNumbers = [
  { id: 'num-001', number: '+1 (555) 012-3456', label: 'Main Line' },
  { id: 'num-002', number: '+1 (555) 987-6543', label: 'Support Line' },
  { id: 'num-003', number: '+1 (555) 246-8101', label: 'Sales Line' },
  { id: 'num-004', number: '+1 (555) 135-7911', label: 'After Hours' },
  { id: 'num-005', number: '+1 (555) 468-2035', label: 'VIP Line' },
]

export function InboundCalls() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [routes, setRoutes] = useState<InboundRoute[]>(inboundRoutes)
  const [showAddRouteDialog, setShowAddRouteDialog] = useState(false)
  
  //  Define the exact union types that match your InboundRoute interface
  type FallbackType = 'voicemail' | 'queue' | 'transfer'
  type ScheduleType = 'business-hours' | 'always' | 'custom'
  

const [newRouteForm, setNewRouteForm] = useState<{
  name: string
  phoneNumber: string
  agentId: string
  schedule: ScheduleType
  fallback: FallbackType
  maxQueueDepth: number
  priority: number   
}>({
  name: '',
  phoneNumber: '',
  agentId: '',
  schedule: 'business-hours',
  fallback: 'voicemail',
  maxQueueDepth: 10,
  priority: 1,    
})

  function handleSaveRoute() {
    if (!newRouteForm.name || !newRouteForm.phoneNumber || !newRouteForm.agentId) return
    
    const selectedAgent = agents.find(a => a.id === newRouteForm.agentId)
    const selectedNumber = availableNumbers.find(n => n.id === newRouteForm.phoneNumber)
    
  const newRoute: InboundRoute = {
    id: `route-${Date.now()}`,
    name: newRouteForm.name,
    phoneNumber: selectedNumber?.number ?? newRouteForm.phoneNumber,
    phoneNumberId: newRouteForm.phoneNumber,   // 👈 ADD THIS
    agentId: newRouteForm.agentId,             // 👈 ADD THIS
    agentName: selectedAgent?.name ?? 'Unknown',
    schedule: newRouteForm.schedule,
    fallback: newRouteForm.fallback,
    maxQueueDepth: newRouteForm.maxQueueDepth,
    priority: newRouteForm.priority,           // 👈 ADD THIS
    status: 'active',
  }
  setRoutes(prev => [...prev, newRoute])
  setShowAddRouteDialog(false)
  setNewRouteForm({ 
    name: '', 
    phoneNumber: '', 
    agentId: '', 
    schedule: 'business-hours', 
    fallback: 'voicemail', 
    maxQueueDepth: 10,
    priority: 1,  
  })
}


  const filtered = inboundCalls.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.callerNumber.includes(search) ||
      (c.callerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      c.agentName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalToday = inboundCalls.length
  const resolved = inboundCalls.filter((c) => c.status === 'completed').length
  const missed = inboundCalls.filter((c) => c.status === 'missed' || c.status === 'dropped').length
  const avgDur = Math.round(inboundCalls.reduce((s, c) => s + c.durationSecs, 0) / inboundCalls.length)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Inbound Calls</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure routing, agent assignment, and review inbound call history.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAddRouteDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Route
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Calls Today', value: totalToday, icon: PhoneIncoming, color: 'text-primary' },
          { label: 'Resolved', value: resolved, icon: CheckCircle2, color: 'text-[var(--status-active)]' },
          { label: 'Missed / Dropped', value: missed, icon: PhoneMissed, color: 'text-destructive' },
          { label: 'Avg Duration', value: `${Math.floor(avgDur / 60)}m ${avgDur % 60}s`, icon: Clock, color: 'text-muted-foreground' },
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

      <Tabs defaultValue="routing">
        <TabsList>
          <TabsTrigger value="routing">Call Routing</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
        </TabsList>

        {/* ── Routing Tab ── */}
        <TabsContent value="routing">
          <div className="flex flex-col gap-4 pt-4">
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Route Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Assigned Agent</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Fallback</TableHead>
                    <TableHead>Queue Depth</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <RouteRow key={route.id} route={route} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ── Config Tab ── */}
        <TabsContent value="config">
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">General Inbound Settings</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Default Inbound Agent</Label>
                  <Select defaultValue="agt-001">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {agents.filter((a) => a.type !== 'outbound').map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Max Queue Depth</Label>
                  <Input type="number" defaultValue={10} />
                  <p className="text-xs text-muted-foreground">Calls beyond this limit are sent to fallback.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">Fallback Action</Label>
                  <Select 
                    value={newRouteForm.fallback} 
                    onValueChange={(v) => {
                      if (v) setNewRouteForm(f => ({ ...f, fallback: v as FallbackType }))
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voicemail">Send to Voicemail</SelectItem>
                      <SelectItem value="queue">Hold in Queue</SelectItem>
                      <SelectItem value="transfer">Transfer to Human</SelectItem>
                      <SelectItem value="disconnect">Disconnect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Call Handling Options</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Call Recording', desc: 'Record all inbound calls for compliance and QA.', defaultOn: true },
                  { label: 'Voicemail Transcription', desc: 'Auto-transcribe voicemail messages using STT.', defaultOn: true },
                  { label: 'Caller ID Lookup', desc: 'Enrich caller info via CNAM lookup on each call.', defaultOn: false },
                  { label: 'Business Hours Enforcement', desc: 'Route to fallback outside configured business hours.', defaultOn: true },
                  { label: 'DTMF IVR Menu', desc: 'Present a keypad menu before connecting to the AI agent.', defaultOn: false },
                  { label: 'Spam Call Filtering', desc: 'Block known spam numbers using carrier-level data.', defaultOn: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultOn} />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Business Hours</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Timezone</Label>
                  <Select defaultValue="america-new_york">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-new_york">America / New York (ET)</SelectItem>
                      <SelectItem value="america-chicago">America / Chicago (CT)</SelectItem>
                      <SelectItem value="america-los_angeles">America / Los Angeles (PT)</SelectItem>
                      <SelectItem value="europe-london">Europe / London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Open Time</Label>
                  <Input type="time" defaultValue="09:00" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Close Time</Label>
                  <Input type="time" defaultValue="18:00" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                  <button
                    key={d}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      i < 5
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-border/80',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm">Discard</Button>
                <Button size="sm">Save Settings</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── History Tab ── */}
        <TabsContent value="history">
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search calls..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                {['all', 'completed', 'missed', 'dropped', 'transferred'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                      statusFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 ml-auto">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Call ID</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((call) => (
                    <CallHistoryRow key={call.id} call={call} />
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                        No calls match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/*  ADD ROUTE DIALOG  */}
      <Dialog open={showAddRouteDialog} onOpenChange={setShowAddRouteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
            <DialogDescription>
              Configure a new inbound call routing rule.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Route Name */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Route Name</Label>
              <Input 
                placeholder="e.g. Support Hotline" 
                value={newRouteForm.name}
                onChange={(e) => setNewRouteForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Phone Number Dropdown */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Phone Number</Label>
              <Select 
                value={newRouteForm.phoneNumber} 
                onValueChange={(v) => {
                  if (v) setNewRouteForm(f => ({ ...f, phoneNumber: v }))
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select available number" /></SelectTrigger>
                <SelectContent>
                  {availableNumbers.map((num) => (
                    <SelectItem key={num.id} value={num.id}>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs">{num.number}</span>
                        <span className="text-muted-foreground text-xs">({num.label})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned Agent Dropdown */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Assigned Agent</Label>
              <Select 
                value={newRouteForm.agentId} 
                onValueChange={(v) => {
                  if (v) setNewRouteForm(f => ({ ...f, agentId: v }))
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select AI agent" /></SelectTrigger>
                <SelectContent>
                  {agents.filter((a) => a.type !== 'outbound').map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <span className="flex items-center gap-2">
                        <Mic2 className="h-3 w-3 text-primary" />
                        {agent.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Schedule</Label>
              <Select 
                value={newRouteForm.schedule} 
                onValueChange={(v) => {
                  if (v) setNewRouteForm(f => ({ ...f, schedule: v as ScheduleType }))
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="business-hours">Business Hours</SelectItem>
                  <SelectItem value="always">Always On (24/7)</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fallback & Queue Depth */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Fallback Action</Label>
                <Select 
                  value={newRouteForm.fallback} 
                  onValueChange={(v) => {
                    if (v) setNewRouteForm(f => ({ ...f, fallback: v }))
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voicemail">Voicemail</SelectItem>
                    <SelectItem value="queue">Hold in Queue</SelectItem>
                    <SelectItem value="transfer">Transfer to Human</SelectItem>
                    <SelectItem value="disconnect">Disconnect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Max Queue Depth</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={50}
                  value={newRouteForm.maxQueueDepth}
                  onChange={(e) => setNewRouteForm(f => ({ ...f, maxQueueDepth: parseInt(e.target.value) || 10 }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRouteDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveRoute} disabled={!newRouteForm.name || !newRouteForm.phoneNumber || !newRouteForm.agentId}>
              Save Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RouteRow({ route }: { route: InboundRoute }) {
  return (
    <TableRow className="border-border">
      <TableCell className="font-medium text-sm">{route.name}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{route.phoneNumber}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm">
          <Mic2 className="h-3.5 w-3.5 text-primary shrink-0" />
          {route.agentName}
        </div>
      </TableCell>
      <TableCell>
        <span className="capitalize text-sm text-muted-foreground">{route.schedule.replace('-', ' ')}</span>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground capitalize">{route.fallback}</TableCell>
      <TableCell className="text-sm tabular-nums text-muted-foreground">{route.maxQueueDepth}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={route.status === 'active'
            ? 'border-[var(--status-active)]/30 text-[var(--status-active)]'
            : 'border-border text-muted-foreground'}
        >
          {route.status}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2"><Settings2 className="h-3.5 w-3.5" /> Edit Route</DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              {route.status === 'active'
                ? <><Pause className="h-3.5 w-3.5" /> Disable</>
                : <><Play className="h-3.5 w-3.5" /> Enable</>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function CallHistoryRow({ call }: { call: CallRecord }) {
  const cfg = statusConfig[call.status]
  const StatusIcon = cfg.icon
  return (
    <TableRow className="border-border">
      <TableCell className="font-mono text-xs text-muted-foreground">{call.id}</TableCell>
      <TableCell>
        <div>
          <p className="text-sm font-mono">{call.callerNumber}</p>
          {call.callerName && <p className="text-xs text-muted-foreground">{call.callerName}</p>}
        </div>
      </TableCell>
      <TableCell className="text-sm">{call.agentName}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatTime(call.startedAt)}</TableCell>
      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">{call.duration}</TableCell>
      <TableCell>
        <Badge variant="outline" className={cn('gap-1', cfg.className)}>
          <StatusIcon className="h-3 w-3" />
          {cfg.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', sentimentDot[call.sentiment])} />
          <span className="text-xs capitalize text-muted-foreground">{call.sentiment}</span>
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2"><Play className="h-3.5 w-3.5" /> Play Recording</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><Download className="h-3.5 w-3.5" /> Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
