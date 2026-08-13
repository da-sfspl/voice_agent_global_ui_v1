'use client'

import { useState, useMemo } from 'react'
import {
  Search, ShieldCheck, Lock, Users, Building2, Activity, Zap, X, AlertTriangle, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'

// ─── Types ──────────────────────────────────────────────────────────────────
type ServiceType = 'LLM' | 'STT' | 'TTS'
type OrgStatus = 'active' | 'suspended'

type Organization = {
  id: string
  name: string
  status: OrgStatus
}

// ─── Provider catalog by service type ──────────────────────────────────────
const providerCatalog: Record<ServiceType, string[]> = {
  LLM: ['OpenAI', 'Anthropic', 'Google Vertex', 'Mistral', 'Meta'],
  STT: ['Deepgram', 'Sarvam AI', 'Smallest AI', 'Azure Speech', 'Google Speech'],
  TTS: ['Cartesia', 'ElevenLabs', 'Azure Speech', 'Google Cloud TTS', 'PlayHT'],
}

// ─── Organizations ─────────────────────────────────────────────────────────
const organizations: Organization[] = [
  { id: 'org-001', name: 'Acme Corporation', status: 'active' },
  { id: 'org-002', name: 'Nova Healthcare', status: 'active' },
  { id: 'org-003', name: 'Zenith Finance', status: 'active' },
  { id: 'org-004', name: 'Bright Retail', status: 'active' },
  { id: 'org-005', name: 'Vertex Logistics', status: 'suspended' },
  { id: 'org-006', name: 'Stellar Media', status: 'active' },
  { id: 'org-007', name: 'Horizon Bank', status: 'active' },
  { id: 'org-008', name: 'Pulse Fitness', status: 'active' },
  { id: 'org-009', name: 'Cobalt Legal', status: 'active' },
  { id: 'org-010', name: 'Nimbus Travel', status: 'active' },
]

// ─── Provider details (informational only) ─────────────────────────────────
const providerDetails: Record<string, { models: number; status: string }> = {
  'OpenAI': { models: 6, status: 'Platform Enabled' },
  'Anthropic': { models: 4, status: 'Platform Enabled' },
  'Google Vertex': { models: 3, status: 'Platform Enabled' },
  'Mistral': { models: 3, status: 'Platform Enabled' },
  'Meta': { models: 2, status: 'Platform Enabled' },
  'Deepgram': { models: 4, status: 'Platform Enabled' },
  'Sarvam AI': { models: 2, status: 'Platform Enabled' },
  'Smallest AI': { models: 2, status: 'Platform Enabled' },
  'Azure Speech': { models: 5, status: 'Platform Enabled' },
  'Google Speech': { models: 3, status: 'Platform Enabled' },
  'Cartesia': { models: 2, status: 'Platform Enabled' },
  'ElevenLabs': { models: 5, status: 'Platform Enabled' },
  'Google Cloud TTS': { models: 4, status: 'Platform Enabled' },
  'PlayHT': { models: 3, status: 'Platform Enabled' },
}

// ─── Last updated timestamps (static for demo) ─────────────────────────────
const lastUpdatedMap: Record<string, string> = {
  'org-001': '2 hours ago',
  'org-002': '1 day ago',
  'org-003': '3 days ago',
  'org-004': '5 hours ago',
  'org-005': '1 week ago',
  'org-006': '6 hours ago',
  'org-007': '2 days ago',
  'org-008': '4 days ago',
  'org-009': '8 hours ago',
  'org-010': '3 days ago',
}

// ─── Deterministic helpers for realistic dummy usage ──────────────────────
function hashStr(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

function getUsage(provider: string, orgId: string): number {
  return (hashStr(provider + orgId) % 500000) + 10000
}

function getAgentCount(provider: string, orgId: string): number {
  return (hashStr(orgId + provider) % 12) + 1
}

function formatUsage(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ─── Build initial access map (provider → orgId → boolean) ─────────────────
function buildInitialAccess(): Record<string, Record<string, boolean>> {
  const access: Record<string, Record<string, boolean>> = {}
  const allProviders = [
    ...providerCatalog.LLM,
    ...providerCatalog.STT,
    ...providerCatalog.TTS,
  ]
  const deniedByDefault = new Set(['org-005']) // Suspended org has no access

  allProviders.forEach(provider => {
    access[provider] = {}
    organizations.forEach(org => {
      access[provider][org.id] = !deniedByDefault.has(org.id)
    })
  })

  // Realistic overrides
  access['OpenAI']['org-003'] = false
  access['Anthropic']['org-002'] = false
  access['Anthropic']['org-007'] = false
  access['Meta']['org-001'] = false
  access['Meta']['org-002'] = false
  access['Meta']['org-004'] = false
  access['PlayHT']['org-003'] = false
  access['PlayHT']['org-006'] = false
  access['Sarvam AI']['org-007'] = false

  return access
}

// ─── Pending confirmation action ───────────────────────────────────────────
type ConfirmAction = {
  type: 'single' | 'bulk'
  orgIds: string[]
  enable: boolean
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ProviderAccessControlPage() {
  const [service, setService] = useState<ServiceType>('LLM')
  const [provider, setProvider] = useState('OpenAI')
  const [accessMap, setAccessMap] = useState<Record<string, Record<string, boolean>>>(buildInitialAccess())

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [accessFilter, setAccessFilter] = useState('all')

  // Bulk selection
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set())

  // Confirmation dialog
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const providerAccess = accessMap[provider] || {}

  // ── Service change: reset provider & selection ──
  function handleServiceChange(s: ServiceType) {
    setService(s)
    setProvider(providerCatalog[s][0])
    setSelectedOrgs(new Set())
  }

  // ── Filtered organizations ──
  const filteredOrgs = useMemo(() => {
    return organizations.filter(org => {
      const matchSearch = org.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || org.status === statusFilter
      const hasAccess = !!providerAccess[org.id]
      const matchAccess =
        accessFilter === 'all' ||
        (accessFilter === 'enabled' && hasAccess) ||
        (accessFilter === 'disabled' && !hasAccess)
      return matchSearch && matchStatus && matchAccess
    })
  }, [search, statusFilter, accessFilter, providerAccess])

  // ── Summary stats ──
  const stats = useMemo(() => {
    const withAccess = organizations.filter(o => providerAccess[o.id]).length
    const withoutAccess = organizations.length - withAccess
    const activeOrgs = organizations.filter(o => o.status === 'active').length
    const totalUsage = organizations.reduce(
      (sum, o) => (providerAccess[o.id] ? sum + getUsage(provider, o.id) : sum),
      0
    )
    return { withAccess, withoutAccess, activeOrgs, totalUsage }
  }, [providerAccess, provider])

  // ── Apply access changes ──
  function applyAccess(orgIds: string[], enable: boolean) {
    setAccessMap(prev => {
      const updated = { ...prev }
      updated[provider] = { ...updated[provider] }
      orgIds.forEach(id => {
        updated[provider][id] = enable
      })
      return updated
    })
  }

  // ── Single toggle ──
  function handleToggle(orgId: string, newValue: boolean) {
    if (newValue) {
      applyAccess([orgId], true) // Enable: no confirmation needed
    } else {
      setConfirmAction({ type: 'single', orgIds: [orgId], enable: false })
    }
  }

  // ── Confirm pending action ──
  function confirmPending() {
    if (!confirmAction) return
    applyAccess(confirmAction.orgIds, confirmAction.enable)
    if (confirmAction.type === 'bulk') setSelectedOrgs(new Set())
    setConfirmAction(null)
  }

  // ── Bulk actions ──
  function handleBulkEnable() {
    applyAccess([...selectedOrgs], true)
    setSelectedOrgs(new Set())
  }

  function handleBulkDisable() {
    setConfirmAction({ type: 'bulk', orgIds: [...selectedOrgs], enable: false })
  }

  // ── Selection helpers ──
  function toggleSelect(orgId: string) {
    setSelectedOrgs(prev => {
      const next = new Set(prev)
      if (next.has(orgId)) next.delete(orgId)
      else next.add(orgId)
      return next
    })
  }

  const allSelected = filteredOrgs.length > 0 && filteredOrgs.every(o => selectedOrgs.has(o.id))

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedOrgs(new Set())
    } else {
      setSelectedOrgs(new Set(filteredOrgs.map(o => o.id)))
    }
  }

  // ── Confirmation dialog text ──
  const confirmOrgNames = confirmAction
    ? confirmAction.orgIds
        .map(id => organizations.find(o => o.id === id)?.name)
        .filter(Boolean)
    : []

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Provider Access Control</h1>
        <p className="text-sm text-muted-foreground">
          Control which AI provider companies are available to each organization.
        </p>
      </div>

      {/* Selectors */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <Label>Service Type</Label>
              <Select
                value={service}
                onValueChange={(v) => v && handleServiceChange(v as ServiceType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLM">LLM (Large Language Model)</SelectItem>
                  <SelectItem value="STT">STT (Speech-to-Text)</SelectItem>
                  <SelectItem value="TTS">TTS (Text-to-Speech)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Provider Company</Label>
              <Select
                value={provider}
                onValueChange={(v) => {
                  if (v) {
                    setProvider(v)
                    setSelectedOrgs(new Set())
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {providerCatalog[service].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Organizations With Access</span>
              <ShieldCheck className="h-4 w-4 text-[var(--status-active)]" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.withAccess}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Organizations Without Access</span>
              <Lock className="h-4 w-4 text-[var(--status-warning)]" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.withoutAccess}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active Organizations</span>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.activeOrgs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Provider Usage</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{formatUsage(stats.totalUsage)}</p>
            <p className="text-[11px] text-muted-foreground">requests (enabled orgs)</p>
          </CardContent>
        </Card>
      </div>

      {/* Provider info strip */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-6 py-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold">{provider}</span>
          </div>
          <InfoItem label="Service" value={service} />
          <InfoItem label="Status" value={providerDetails[provider]?.status || 'Platform Enabled'} />
          <InfoItem label="Orgs Enabled" value={`${stats.withAccess} / ${organizations.length}`} />
          <InfoItem label="Models Available" value={String(providerDetails[provider]?.models ?? 0)} />
          <InfoItem label="Platform Usage" value={`${formatUsage(stats.totalUsage)} requests`} />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Org Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={accessFilter} onValueChange={(v) => v && setAccessFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Access" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions bar */}
      {selectedOrgs.size > 0 && (
        <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">
            {selectedOrgs.size} organization{selectedOrgs.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleBulkEnable} className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Enable Access
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDisable}
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <Lock className="h-3.5 w-3.5" /> Disable Access
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedOrgs(new Set())} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Access table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider Access</TableHead>
                <TableHead className="text-right">Usage</TableHead>
                <TableHead className="text-right">Agents Using Provider</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No organizations match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filteredOrgs.map(org => {
                const hasAccess = !!providerAccess[org.id]
                const usage = hasAccess ? getUsage(provider, org.id) : 0
                const agents = hasAccess ? getAgentCount(provider, org.id) : 0
                return (
                  <TableRow key={org.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrgs.has(org.id)}
                        onCheckedChange={() => toggleSelect(org.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          org.status === 'active'
                            ? 'border-[var(--status-active)]/30 text-[var(--status-active)]'
                            : 'border-destructive/30 text-destructive'
                        }
                      >
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          hasAccess
                            ? 'border-[var(--status-active)]/30 text-[var(--status-active)]'
                            : 'text-muted-foreground'
                        }
                      >
                        {hasAccess ? 'ON' : 'OFF'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {hasAccess ? `${formatUsage(usage)} requests` : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {hasAccess ? `${agents} agents` : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {lastUpdatedMap[org.id] || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={hasAccess}
                        onCheckedChange={(v) => handleToggle(org.id, v)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--status-warning)]" />
              {confirmAction?.type === 'bulk'
                ? `Disable ${provider} for ${confirmAction.orgIds.length} organizations?`
                : `Disable ${provider} for ${confirmOrgNames[0] || ''}?`}
            </DialogTitle>
            <DialogDescription>
              Agents in {confirmAction?.type === 'bulk' ? 'these organizations' : 'this organization'} will
              no longer be able to select or use {provider} after this change. This can be reversed at any time.
            </DialogDescription>
          </DialogHeader>
          {confirmAction?.type === 'bulk' && (
            <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
              <ul className="text-xs space-y-1">
                {confirmOrgNames.map(name => (
                  <li key={name} className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmPending}>Disable Provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Small helper component for info strip items ───────────────────────────
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}