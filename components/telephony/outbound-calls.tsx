'use client'

import { useState } from 'react'
import { outboundCalls, agents, sipTrunks, type CallRecord } from '@/lib/data'
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
  PhoneOutgoing, Search, Plus, MoreHorizontal, Play, Download,
  CheckCircle2, XCircle, PhoneForwarded, Mic2, Clock, Voicemail,
  PhoneCall, Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  completed:  { label: 'Completed',   className: 'border-[var(--status-active)]/30 text-[var(--status-active)]', icon: CheckCircle2 },
  voicemail:  { label: 'Voicemail',   className: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]', icon: Voicemail },
  transferred:{ label: 'Transferred', className: 'border-blue-500/30 text-blue-500', icon: PhoneForwarded },
  failed:     { label: 'Failed',      className: 'border-destructive/30 text-destructive', icon: XCircle },
  dropped:    { label: 'Dropped',     className: 'border-destructive/30 text-destructive', icon: XCircle },
  missed:     { label: 'No Answer',   className: 'border-border text-muted-foreground', icon: PhoneOutgoing },
}

const outcomeLabel: Record<string, string> = {
  'demo-scheduled':   'Demo Scheduled',
  'payment-arranged': 'Payment Arranged',
  'not-qualified':    'Not Qualified',
  'no-answer':        'No Answer',
  voicemail:          'Voicemail',
  transferred:        'Transferred',
}

const sentimentDot: Record<string, string> = {
  positive: 'bg-[var(--status-active)]',
  neutral:  'bg-muted-foreground',
  negative: 'bg-destructive',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function OutboundCalls() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = outboundCalls.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.callerNumber.includes(search) ||
      (c.callerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      c.agentName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalToday = outboundCalls.length
  const connected = outboundCalls.filter((c) => c.status === 'completed' || c.status === 'transferred').length
  const voicemails = outboundCalls.filter((c) => c.status === 'voicemail').length
  const avgDur = Math.round(
    outboundCalls.filter((c) => c.durationSecs > 0).reduce((s, c) => s + c.durationSecs, 0) /
    Math.max(outboundCalls.filter((c) => c.durationSecs > 0).length, 1),
  )

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Outbound Calls</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure outbound dialing, agent assignment, and review call history.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <PhoneCall className="h-4 w-4" />
          Initiate Call
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Calls Today', value: totalToday, icon: PhoneOutgoing, color: 'text-primary' },
          { label: 'Connected', value: connected, icon: CheckCircle2, color: 'text-[var(--status-active)]' },
          { label: 'Voicemails', value: voicemails, icon: Voicemail, color: 'text-[var(--status-warning)]' },
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

      <Tabs defaultValue="initiate">
        <TabsList>
          <TabsTrigger value="initiate">Initiate Call</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
        </TabsList>

        {/* ── Initiate Tab ── */}
        <TabsContent value="initiate">
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Manual Outbound Call</h2>
              <p className="text-xs text-muted-foreground -mt-2">
                Trigger a single AI-initiated outbound call to a specific number.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Destination Number</Label>
                  <Input placeholder="+1 (555) 000-0000" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Caller Name (optional)</Label>
                  <Input placeholder="Contact name for reference" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Assign AI Agent</Label>
                  <Select defaultValue="agt-002">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {agents.filter((a) => a.type !== 'inbound').map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Outbound Trunk</Label>
                  <Select defaultValue="trunk-003">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sipTrunks.filter((t) => t.direction !== 'inbound').map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Campaign (optional)</Label>
                  <Select defaultValue="none">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None — Ad-hoc call</SelectItem>
                      <SelectItem value="cmp-001">Q3 Sales Outreach</SelectItem>
                      <SelectItem value="cmp-002">Collections — August</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Notes / Context</Label>
                  <Input placeholder="Optional context passed to the agent" />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm" className="gap-1.5">
                  <PhoneCall className="h-4 w-4" />
                  Initiate Call
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-semibold mb-3">Active Outbound Agents</h2>
                <div className="flex flex-col gap-2">
                  {agents.filter((a) => a.type !== 'inbound' && a.status === 'active').map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{a.type} · {a.llmModel}</p>
                      </div>
                      <Badge variant="outline" className="border-[var(--status-active)]/30 text-[var(--status-active)] text-[10px]">
                        active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-semibold mb-1">Dialing Rules</h2>
                <p className="text-xs text-muted-foreground mb-3">Applied to all outbound calls from this workspace.</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Respect Do-Not-Call list', desc: 'Block numbers on the DNC registry.', on: true },
                    { label: 'Retry on no-answer', desc: 'Retry up to 2× with a 4-hour gap.', on: true },
                    { label: 'Voicemail drop', desc: 'Leave a pre-recorded message on voicemail.', on: false },
                    { label: 'STIR/SHAKEN attestation', desc: 'Send A-level attestation on all calls.', on: true },
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
            </div>
          </div>
        </TabsContent>

        {/* ── Config Tab ── */}
        <TabsContent value="config">
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Outbound Dialing Settings</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Default Outbound Agent</Label>
                  <Select defaultValue="agt-002">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {agents.filter((a) => a.type !== 'inbound').map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Default Outbound Trunk</Label>
                  <Select defaultValue="trunk-003">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sipTrunks.filter((t) => t.direction !== 'inbound').map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Max Concurrent Outbound Calls</Label>
                  <Input type="number" defaultValue={20} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Calls Per Minute (rate limit)</Label>
                  <Input type="number" defaultValue={5} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Max Call Duration (minutes)</Label>
                  <Input type="number" defaultValue={15} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Caller ID Override</Label>
                  <Select defaultValue="assigned">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">Use assigned DID</SelectItem>
                      <SelectItem value="pn-001">+1 (800) 555-0100 — Main Support</SelectItem>
                      <SelectItem value="pn-004">+1 (646) 555-0400 — Sales DID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm">Discard</Button>
                <Button size="sm">Save Settings</Button>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Retry & Compliance</h2>
              <div className="flex flex-col gap-3">
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
                <div className="flex flex-col gap-1.5">
                  <Label>Allowed Calling Hours</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="time" defaultValue="08:00" />
                    <Input type="time" defaultValue="21:00" />
                  </div>
                  <p className="text-xs text-muted-foreground">TCPA compliance: calls only within these hours.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  {[
                    { label: 'Call Recording', desc: 'Record all outbound calls.', on: true },
                    { label: 'Consent Verification', desc: 'Verify opt-in consent before dialing.', on: true },
                    { label: 'AMD (Answering Machine Detection)', desc: 'Detect voicemail before connecting agent.', on: true },
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
                {['all', 'completed', 'voicemail', 'failed', 'transferred'].map((f) => (
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
                    <TableHead>Destination</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((call) => (
                    <OutboundCallRow key={call.id} call={call} />
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
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
    </div>
  )
}

function OutboundCallRow({ call }: { call: CallRecord }) {
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
      <TableCell className="text-xs text-muted-foreground">{call.campaignId ?? '—'}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatTime(call.startedAt)}</TableCell>
      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">{call.duration}</TableCell>
      <TableCell>
        <Badge variant="outline" className={cn('gap-1', cfg.className)}>
          <StatusIcon className="h-3 w-3" />
          {cfg.label}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{outcomeLabel[call.outcome] ?? call.outcome}</TableCell>
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
