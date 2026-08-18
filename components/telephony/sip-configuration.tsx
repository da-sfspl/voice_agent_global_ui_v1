'use client'

import { useState } from 'react'
import { sipTrunks, phoneNumbers, type SipTrunk, type PhoneNumber } from '@/lib/data'
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Server, Plus, MoreHorizontal, Settings2, Trash2, RefreshCw,
  CheckCircle2, AlertTriangle, XCircle, PhoneIncoming, PhoneOutgoing,
  ArrowLeftRight, Hash, Eye, EyeOff, Copy, Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const trunkStatusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  connected:    { label: 'Connected',    className: 'border-[var(--status-active)]/30 text-[var(--status-active)]',   icon: CheckCircle2 },
  degraded:     { label: 'Degraded',     className: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]', icon: AlertTriangle },
  disconnected: { label: 'Disconnected', className: 'border-destructive/30 text-destructive',                          icon: XCircle },
}

const directionConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  inbound:       { label: 'Inbound',       icon: PhoneIncoming,  color: 'text-emerald-500' },
  outbound:      { label: 'Outbound',      icon: PhoneOutgoing,  color: 'text-blue-500' },
  bidirectional: { label: 'Bidirectional', icon: ArrowLeftRight, color: 'text-violet-500' },
}

const numberStatusConfig: Record<string, string> = {
  active:     'border-[var(--status-active)]/30 text-[var(--status-active)]',
  unassigned: 'border-border text-muted-foreground',
  suspended:  'border-destructive/30 text-destructive',
}

const providerColors: Record<string, string> = {
  'VoBiz AI':       'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Grandstream SIP':'bg-violet-500/10 text-violet-500 border-violet-500/20',
  'Twilio':         'bg-red-500/10 text-red-500 border-red-500/20',
  'Vonage':         'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

const sipCredentials = [
  { id: 'cred-001', label: 'VoBiz AI — Primary', username: 'acme-vobiz-prod', password: '••••••••••••', realm: 'sip.vobiz.ai', trunkId: 'trunk-001', status: 'active' },
  { id: 'cred-002', label: 'VoBiz AI — Outbound', username: 'acme-vobiz-out', password: '••••••••••••', realm: 'sip-out.vobiz.ai', trunkId: 'trunk-003', status: 'active' },
  { id: 'cred-003', label: 'Grandstream — US West', username: 'acme-gs-west', password: '••••••••••••', realm: '192.168.10.45', trunkId: 'trunk-002', status: 'active' },
  { id: 'cred-004', label: 'VoBiz AI — EU', username: 'acme-vobiz-eu', password: '••••••••••••', realm: 'sip-eu.vobiz.ai', trunkId: 'trunk-004', status: 'inactive' },
]

export function SipConfiguration() {
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">SIP Configuration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage VoIP/SIP trunks, phone numbers, credentials, and connection status.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Trunk
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Trunks', value: sipTrunks.length, icon: Server, color: 'text-primary' },
          { label: 'Connected', value: sipTrunks.filter((t) => t.status === 'connected').length, icon: CheckCircle2, color: 'text-[var(--status-active)]' },
          { label: 'Degraded', value: sipTrunks.filter((t) => t.status === 'degraded').length, icon: AlertTriangle, color: 'text-[var(--status-warning)]' },
          { label: 'Phone Numbers', value: phoneNumbers.length, icon: Hash, color: 'text-muted-foreground' },
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

      <Tabs defaultValue="trunks">
        <TabsList>
          <TabsTrigger value="trunks">SIP Trunks</TabsTrigger>
          <TabsTrigger value="numbers">Phone Numbers</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="livekit">LiveKit</TabsTrigger>
        </TabsList>

        {/* ── Trunks Tab ── */}
        <TabsContent value="trunks">
          <div className="flex flex-col gap-4 pt-4">
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Trunk Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Host / IP</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Active / Max</TableHead>
                    <TableHead className="text-right">Calls Today</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sipTrunks.map((trunk) => (
                    <TrunkRow key={trunk.id} trunk={trunk} />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Add Trunk Form */}
            <div className="rounded-lg border border-dashed border-border bg-card p-5">
              <h2 className="text-sm font-semibold mb-4">Add New SIP Trunk</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Trunk Name</Label>
                  <Input placeholder="e.g. VoBiz Inbound — US West" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Provider</Label>
                  <Select defaultValue="vobiz">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vobiz">VoBiz AI</SelectItem>
                      <SelectItem value="grandstream">Grandstream SIP</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="vonage">Vonage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Direction</Label>
                  <Select defaultValue="inbound">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="bidirectional">Bidirectional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>SIP Host / IP</Label>
                  <Input placeholder="sip.provider.com or 192.168.x.x" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Port</Label>
                  <Input type="number" defaultValue={5060} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Transport</Label>
                  <Select defaultValue="TLS">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UDP">UDP</SelectItem>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="TLS">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Max Concurrent Calls</Label>
                  <Input type="number" defaultValue={50} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Region</Label>
                  <Select defaultValue="us-east-1">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">us-east-1</SelectItem>
                      <SelectItem value="us-west-2">us-west-2</SelectItem>
                      <SelectItem value="eu-west-1">eu-west-1</SelectItem>
                      <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add Trunk
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Phone Numbers Tab ── */}
        <TabsContent value="numbers">
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex justify-end">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Number
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Number</TableHead>
                    <TableHead>Friendly Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Trunk</TableHead>
                    <TableHead>Assigned Agent</TableHead>
                    <TableHead className="text-right">Calls Today</TableHead>
                    <TableHead className="text-right">Monthly Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phoneNumbers.map((pn) => (
                    <PhoneNumberRow key={pn.id} pn={pn} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ── Credentials Tab ── */}
        <TabsContent value="credentials">
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex justify-end">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Credential
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {sipCredentials.map((cred) => (
                <CredentialCard key={cred.id} cred={cred} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── LiveKit Tab ── */}
        <TabsContent value="livekit">
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Wifi className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">LiveKit Integration</h2>
                  <p className="text-xs text-muted-foreground">Real-time media transport for AI voice agents</p>
                </div>
                <Badge variant="outline" className="ml-auto border-[var(--status-active)]/30 text-[var(--status-active)]">
                  Connected
                </Badge>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>LiveKit Server URL</Label>
                  <Input defaultValue="wss://acme-corp.livekit.cloud" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input defaultValue="APIKey_acme_prod_k8x2m" className="font-mono text-xs" readOnly />
                    <Button size="sm" variant="outline" className="shrink-0"><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>API Secret</Label>
                  <div className="flex gap-2">
                    <Input defaultValue="••••••••••••••••••••••••" type="password" className="font-mono text-xs" readOnly />
                    <Button size="sm" variant="outline" className="shrink-0"><Eye className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Region</Label>
                  <Select defaultValue="us-east">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east">US East</SelectItem>
                      <SelectItem value="us-west">US West</SelectItem>
                      <SelectItem value="eu-west">EU West</SelectItem>
                      <SelectItem value="ap-southeast">AP Southeast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <RefreshCw className="h-4 w-4" />
                  Test Connection
                </Button>
                <Button size="sm">Save</Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-semibold mb-3">LiveKit Settings</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Enable LiveKit for Inbound', desc: 'Route inbound SIP calls through LiveKit rooms.', on: true },
                    { label: 'Enable LiveKit for Outbound', desc: 'Route outbound calls through LiveKit rooms.', on: true },
                    { label: 'Room Auto-Cleanup', desc: 'Destroy LiveKit rooms after call ends.', on: true },
                    { label: 'Recording via LiveKit', desc: 'Use LiveKit Egress for call recording.', on: false },
                    { label: 'Noise Cancellation (Krisp)', desc: 'Apply Krisp noise cancellation on media streams.', on: true },
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

              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-sm font-semibold mb-3">Active Rooms</h2>
                <div className="flex flex-col gap-2">
                  {[
                    { room: 'room-L001', call: 'L-001', participants: 2, duration: '02:14' },
                    { room: 'room-L002', call: 'L-002', participants: 2, duration: '03:34' },
                    { room: 'room-L003', call: 'L-003', participants: 2, duration: '01:07' },
                  ].map((r) => (
                    <div key={r.room} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-xs font-mono">{r.room}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Call {r.call}</span>
                      <span className="text-xs text-muted-foreground">{r.participants} participants</span>
                      <span className="font-mono text-xs">{r.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TrunkRow({ trunk }: { trunk: SipTrunk }) {
  const sc = trunkStatusConfig[trunk.status]
  const StatusIcon = sc.icon
  const dc = directionConfig[trunk.direction]
  const DirIcon = dc.icon
  const pc = providerColors[trunk.provider] ?? 'bg-muted text-muted-foreground border-border'

  return (
    <TableRow className="border-border">
      <TableCell className="font-medium text-sm">{trunk.name}</TableCell>
      <TableCell>
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', pc)}>
          {trunk.provider}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm">
          <DirIcon className={cn('h-3.5 w-3.5', dc.color)} />
          <span className="text-muted-foreground">{dc.label}</span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{trunk.host}:{trunk.port}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[10px] font-mono">{trunk.transport}</Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground font-mono">{trunk.region}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">
        <span className={trunk.activeCalls > 0 ? 'text-[var(--status-active)] font-medium' : 'text-muted-foreground'}>
          {trunk.activeCalls}
        </span>
        <span className="text-muted-foreground"> / {trunk.maxConcurrent}</span>
      </TableCell>
      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
        {trunk.callsToday.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn('gap-1', sc.className)}>
          <StatusIcon className="h-3 w-3" />
          {sc.label}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2"><Settings2 className="h-3.5 w-3.5" /> Edit Trunk</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><RefreshCw className="h-3.5 w-3.5" /> Test Connection</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function PhoneNumberRow({ pn }: { pn: PhoneNumber }) {
  return (
    <TableRow className="border-border">
      <TableCell className="font-mono text-sm">{pn.number}</TableCell>
      <TableCell className="text-sm">{pn.friendlyName}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[10px] capitalize">{pn.type}</Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{pn.country}</TableCell>
      <TableCell className="text-xs font-mono text-muted-foreground">{pn.trunkId}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{pn.agentName ?? <span className="italic">Unassigned</span>}</TableCell>
      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">{pn.callsToday}</TableCell>
      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">${pn.monthlyCost.toFixed(2)}</TableCell>
      <TableCell>
        <Badge variant="outline" className={numberStatusConfig[pn.status]}>
          {pn.status}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2"><Settings2 className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><Copy className="h-3.5 w-3.5" /> Copy Number</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Release Number
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function CredentialCard({ cred }: { cred: typeof sipCredentials[0] }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{cred.label}</p>
            <p className="text-xs text-muted-foreground font-mono">{cred.trunkId}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cred.status === 'active'
            ? 'border-[var(--status-active)]/30 text-[var(--status-active)]'
            : 'border-border text-muted-foreground'}
        >
          {cred.status}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Username</span>
          <span className="text-sm font-mono">{cred.username}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Password</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{visible ? 'p@ssw0rd_acme_2026' : cred.password}</span>
            <button onClick={() => setVisible((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
              {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Realm / Host</span>
          <span className="text-sm font-mono">{cred.realm}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs">
          <Settings2 className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Rotate Secret
        </Button>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive ml-auto">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  )
}
