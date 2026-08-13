'use client'

import { useState } from 'react'
import {
  Plus, Settings2, Trash2, ArrowDown, ArrowRight, Info, ShieldCheck, Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

// ─── Provider catalogs by service type ──────────────────────────────────────
const providerCatalog: Record<'LLM' | 'STT' | 'TTS', string[]> = {
  LLM: ['OpenAI', 'Anthropic', 'Google Vertex', 'Mistral AI'],
  STT: ['Deepgram', 'Sarvam AI', 'AssemblyAI', 'Azure Speech', 'Google STT'],
  TTS: ['Cartesia', 'ElevenLabs', 'Azure Speech', 'Smallest AI', 'Google TTS'],
}

// ─── Failover condition options ─────────────────────────────────────────────
const FAILOVER_CONDITIONS = [
  { id: 'unavailable', label: 'Provider Unavailable', hasThreshold: false },
  { id: 'timeout', label: 'Request Timeout', hasThreshold: true, unit: 'seconds', default: 5 },
  { id: 'ratelimit', label: 'Rate Limit Exceeded', hasThreshold: false },
  { id: 'server_error', label: '5xx / Server Error', hasThreshold: false },
  { id: 'error_rate', label: 'Error Rate Threshold', hasThreshold: true, unit: '%', default: 10 },
  { id: 'latency', label: 'Latency Threshold', hasThreshold: true, unit: 'ms', default: 3000 },
] as const

type FailoverConditionId = typeof FAILOVER_CONDITIONS[number]['id']

// ─── Routing rule type ──────────────────────────────────────────────────────
type RoutingRule = {
  id: string
  service: 'LLM' | 'STT' | 'TTS'
  primary: string
  fallback1?: string
  fallback2?: string
  conditions: FailoverConditionId[]
  thresholds: Record<string, number>
  orgOverride: 'allowed' | 'restricted'
  status: 'active' | 'inactive'
}

const initialRules: RoutingRule[] = [
  {
    id: '1',
    service: 'LLM',
    primary: 'OpenAI',
    fallback1: 'Anthropic',
    fallback2: 'Google Vertex',
    conditions: ['timeout', 'server_error'],
    thresholds: { timeout: 5 },
    orgOverride: 'allowed',
    status: 'active',
  },
  {
    id: '2',
    service: 'STT',
    primary: 'Deepgram',
    fallback1: 'Sarvam AI',
    fallback2: 'Azure Speech',
    conditions: ['unavailable', 'timeout'],
    thresholds: { timeout: 3 },
    orgOverride: 'allowed',
    status: 'active',
  },
  {
    id: '3',
    service: 'TTS',
    primary: 'Cartesia',
    fallback1: 'ElevenLabs',
    fallback2: 'Azure Speech',
    conditions: ['ratelimit', 'unavailable'],
    thresholds: {},
    orgOverride: 'allowed',
    status: 'active',
  },
]

// ─── Empty form state factory ───────────────────────────────────────────────
function emptyForm(): RoutingRule {
  return {
    id: '',
    service: 'LLM',
    primary: '',
    fallback1: undefined,
    fallback2: undefined,
    conditions: [],
    thresholds: {},
    orgOverride: 'allowed',
    status: 'active',
  }
}

export default function RoutingFallbackPage() {
  const [rules, setRules] = useState<RoutingRule[]>(initialRules)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null)
  const [form, setForm] = useState<RoutingRule>(emptyForm())

  const isEditing = editingRule !== null
  const availableProviders = providerCatalog[form.service]

  // ── Open add ──
  function openAdd() {
    setEditingRule(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  // ── Open edit ──
  function openEdit(rule: RoutingRule) {
    setEditingRule(rule)
    setForm({ ...rule })
    setDialogOpen(true)
  }

  // ── Close ──
  function closeDialog() {
    setDialogOpen(false)
    setEditingRule(null)
    setForm(emptyForm())
  }

  // ── Toggle status ──
  const toggleStatus = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r))
  }

  // ── Delete ──
  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  // ── Save ──
  const handleSave = () => {
    if (!form.primary) return
    if (isEditing && editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? { ...form, id: editingRule.id } : r))
    } else {
      const newRule: RoutingRule = { ...form, id: `rule-${Date.now()}` }
      setRules(prev => [...prev, newRule])
    }
    closeDialog()
  }

  // ── Condition toggle ──
  const toggleCondition = (id: FailoverConditionId) => {
    setForm(prev => {
      const has = prev.conditions.includes(id)
      const newConditions = has
        ? prev.conditions.filter(c => c !== id)
        : [...prev.conditions, id]
      const cond = FAILOVER_CONDITIONS.find(c => c.id === id)
      const newThresholds = { ...prev.thresholds }
      if (!has && cond?.hasThreshold) {
        newThresholds[id] = cond.default as number
      } else if (has) {
        delete newThresholds[id]
      }
      return { ...prev, conditions: newConditions, thresholds: newThresholds }
    })
  }

  // ── Reset providers when service changes ──
  const handleServiceChange = (service: 'LLM' | 'STT' | 'TTS') => {
    setForm(prev => ({
      ...prev,
      service,
      primary: '',
      fallback1: undefined,
      fallback2: undefined,
    }))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
 {/* Header */}
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">Platform Routing & Fallback</h1>
    <p className="text-sm text-muted-foreground">
      Configure platform-wide default provider routing and automatic failover policies for LLM, STT, and TTS services.
    </p>
  </div>
  <Button onClick={openAdd} className="gap-2">
    <Plus className="h-4 w-4" />
    Add Routing Rule
  </Button>
</div>

{/* Add/Edit Routing Rule Dialog */}
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isEditing ? 'Edit Routing Rule' : 'Add Routing Rule'}</DialogTitle>
      <DialogDescription>
        {isEditing
          ? 'Update the platform-level failover policy.'
          : 'Define a platform default provider and its fallback chain.'}
      </DialogDescription>
    </DialogHeader>

    <div className="grid gap-5 py-2">
      {/* Service Type */}
      <div className="flex flex-col gap-1.5">
        <Label>Service Type</Label>
        <Select
          value={form.service}
          onValueChange={(v) => v && handleServiceChange(v as 'LLM' | 'STT' | 'TTS')}
          disabled={isEditing}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="LLM">LLM (Large Language Model)</SelectItem>
            <SelectItem value="STT">STT (Speech-to-Text)</SelectItem>
            <SelectItem value="TTS">TTS (Text-to-Speech)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          Providers shown below are filtered to this service type.
        </p>
      </div>

      {/* Provider chain */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs font-semibold uppercase tracking-wide">Provider Failover Chain</Label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">
              Platform Default <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.primary || ''}
              onValueChange={(v) => v && setForm(f => ({ ...f, primary: v }))}
            >
              <SelectTrigger><SelectValue placeholder="Select default" /></SelectTrigger>
              <SelectContent>
                {availableProviders.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Primary provider</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Fallback 1</Label>
            <Select
              value={form.fallback1 || ''}
              onValueChange={(v) => setForm(f => ({ ...f, fallback1: v === '__none__' ? undefined : v || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— None —</SelectItem>
                {availableProviders.filter(p => p !== form.primary).map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Second try</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Fallback 2</Label>
            <Select
              value={form.fallback2 || ''}
              onValueChange={(v) => setForm(f => ({ ...f, fallback2: v === '__none__' ? undefined : v || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— None —</SelectItem>
                {availableProviders.filter(p => p !== form.primary && p !== form.fallback1).map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Final fallback</p>
          </div>
        </div>

        {/* Chain preview */}
        {form.primary && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
            <span className="text-[11px] text-muted-foreground">Chain preview:</span>
            <Badge variant="secondary" className="font-medium">{form.primary}</Badge>
            {form.fallback1 && (
              <>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline">{form.fallback1}</Badge>
              </>
            )}
            {form.fallback2 && (
              <>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-muted-foreground">{form.fallback2}</Badge>
              </>
            )}
          </div>
        )}
      </div>

      {/* Failover conditions */}
      <div className="flex flex-col gap-2">
        <Label>Failover Conditions</Label>
        <p className="text-[11px] text-muted-foreground -mt-1">
          Failover triggers when <strong>any</strong> selected condition is met.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {FAILOVER_CONDITIONS.map(cond => {
            const checked = form.conditions.includes(cond.id)
            return (
              <div
                key={cond.id}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors',
                  checked ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                )}
                onClick={() => toggleCondition(cond.id)}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleCondition(cond.id)} />
                <span className="text-sm">{cond.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Threshold fields */}
      {form.conditions.some(id => FAILOVER_CONDITIONS.find(c => c.id === id)?.hasThreshold) && (
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wide">Threshold Configuration</Label>
          <div className="grid grid-cols-2 gap-4">
            {form.conditions.map(id => {
              const cond = FAILOVER_CONDITIONS.find(c => c.id === id)
              if (!cond?.hasThreshold) return null
              return (
                <div key={id} className="flex flex-col gap-1.5">
                  <Label className="text-xs">{cond.label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={form.thresholds[id] ?? cond.default}
                      onChange={(e) => setForm(f => ({
                        ...f,
                        thresholds: { ...f.thresholds, [id]: parseInt(e.target.value) || 0 },
                      }))}
                      className="w-24"
                    />
                    <span className="text-xs text-muted-foreground">{cond.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Org override + status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Organization Override Policy</Label>
          <Select
            value={form.orgOverride}
            onValueChange={(v) => v && setForm(f => ({ ...f, orgOverride: v as 'allowed' | 'restricted' }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="allowed">Allow organization override</SelectItem>
              <SelectItem value="restricted">Platform default only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            {form.orgOverride === 'allowed'
              ? 'Organizations may configure their own provider chain.'
              : 'Organizations must use the platform-defined chain.'}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-muted-foreground">Enable this rule platform-wide</p>
          </div>
          <Switch
            checked={form.status === 'active'}
            onCheckedChange={(v) => setForm(f => ({ ...f, status: v ? 'active' : 'inactive' }))}
          />
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={closeDialog}>Cancel</Button>
      <Button onClick={handleSave} disabled={!form.primary}>
        {isEditing ? 'Save Changes' : 'Save Rule'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Explanatory card */}
<Card className="border-primary/20 bg-primary/5">
  <CardContent className="flex items-start gap-3 py-3">
    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
    <div className="text-xs text-muted-foreground leading-relaxed">
      <span className="font-medium text-foreground">Platform defaults</span> are used when an organization has not configured an override.
      Failover automatically moves requests to the next provider when the configured failure conditions are met.
      The <span className="font-medium">Organization Override</span> column indicates whether individual organizations may define their own chain.
    </div>
  </CardContent>
</Card>

{/* Rules table */}
<Card>
  <CardContent className="p-0">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Platform Default</TableHead>
          <TableHead>Fallback Chain</TableHead>
          <TableHead>Failover Conditions</TableHead>
          <TableHead>Org Override</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
              No routing rules configured. Click "Add Routing Rule" to create one.
            </TableCell>
          </TableRow>
        )}
        {rules.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <Badge variant="outline" className="font-mono text-[10px]">{r.service}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="font-medium">{r.primary}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                {r.fallback1 && (
                  <div className="flex items-center gap-2 text-xs">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-[10px]">{r.fallback1}</Badge>
                  </div>
                )}
                {r.fallback2 && (
                  <div className="flex items-center gap-2 text-xs">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">{r.fallback2}</Badge>
                  </div>
                )}
                {!r.fallback1 && !r.fallback2 && (
                  <span className="text-xs text-muted-foreground italic">No fallback configured</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {r.conditions.map(id => {
                  const cond = FAILOVER_CONDITIONS.find(c => c.id === id)
                  if (!cond) return null

                  const val = r.thresholds[id]
                  let displayLabel: string = cond.label

                  if (cond.hasThreshold && val !== undefined) {
                    if (id === 'timeout') displayLabel = `Timeout > ${val}s`
                    else if (id === 'error_rate') displayLabel = `Error > ${val}%`
                    else if (id === 'latency') displayLabel = `Latency > ${val}ms`
                  }

                  return (
                    <Badge key={id} variant="outline" className="text-[10px]">
                      {displayLabel}
                    </Badge>
                  )
                })}
                {r.conditions.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">None</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {r.orgOverride === 'allowed' ? (
                <Badge variant="outline" className="gap-1 border-[var(--status-active)]/30 text-[var(--status-active)]">
                  <ShieldCheck className="h-3 w-3" /> Allowed
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-[var(--status-warning)]/30 text-[var(--status-warning)]">
                  <Lock className="h-3 w-3" /> Restricted
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={r.status === 'active' ? 'border-[var(--status-active)]/30 text-[var(--status-active)]' : 'text-muted-foreground'}>
                {r.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => openEdit(r)}
                  className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteRule(r.id)}
                  className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Switch checked={r.status === 'active'} onCheckedChange={() => toggleStatus(r.id)} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
</div>
  )
}