'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Separator } from '@base-ui/react' 
import { Database, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, XCircle, ArrowRight, ArrowDown, Play } from 'lucide-react'

export type PreCallAction = {
  id: string
  name: string
  required: boolean
  source: string
  sourceType: 'CRM API' | 'REST API' | 'Database' | 'Function'
  lookupField: string
  callerField: string
  targetField: string
  conditions: { field: string; operator: string; value: string }[]
  loadData: string[]
  timeout: number
  failureBehavior: 'proceed-partial' | 'proceed-without' | 'stop'
}

export type RuleCondition = {
  category: string
  field: string
  operator: string
  value: string
}

export type PreCallCondition = {
  field: string
  operator: string
  value: string
}


// type Props = {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onSave: (action: PreCallAction) => void
//   editingItem?: PreCallAction | null
// }

// const emptyForm: PreCallAction = {
//   name: '',
//   type: 'function',
//   source: '',
//   endpoint: '',
//   conditions: '',
//   timeout: 3000,
//   failureBehavior: 'proceed-partial',
//   required: false,
// }


const mockCrmFields = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'account_id', label: 'Account ID' },
  { value: 'customer_name', label: 'Customer Name' },
  { value: 'account_status', label: 'Account Status', options: ['Active', 'Inactive', 'Suspended', 'Churned'] },
  { value: 'outstanding_balance', label: 'Outstanding Balance' },
  { value: 'last_interaction', label: 'Last Interaction' },
  { value: 'payment_status', label: 'Payment Status', options: ['Paid', 'Pending', 'Overdue'] },
  { value: 'due_date', label: 'Due Date' },
  { value: 'account_type', label: 'Account Type', options: ['Enterprise', 'SMB', 'Consumer'] },
  { value: 'customer_tier', label: 'Customer Tier', options: ['Gold', 'Silver', 'Bronze'] },
]


// ─── Add/Edit Pre-Call Action Dialog ────────────────────────────────────────

export function AddPreCallActionDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: PreCallAction | null
  onSave: (action: Omit<PreCallAction, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [required, setRequired] = useState(true)
  const [sourceType, setSourceType] = useState<'CRM API' | 'REST API' | 'Database' | 'Function'>('CRM API')
  const [source, setSource] = useState('')
  const [lookupField, setLookupField] = useState('')
  const [callerField, setCallerField] = useState('')
  const [targetField, setTargetField] = useState('')
  const [conditions, setConditions] = useState<PreCallCondition[]>([])
  const [loadData, setLoadData] = useState<string[]>([])
  const [timeout, setTimeout] = useState(3000)
  const [failureBehavior, setFailureBehavior] = useState<'proceed-partial' | 'proceed-without' | 'stop'>('proceed-partial')
  
  // UI-only state for test lookup
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const availableFields = [
    'Customer name', 'Account status', 'Outstanding balance', 'Last interaction',
    'Payment status', 'Due date', 'Account type', 'Customer tier'
  ]

  useEffect(() => {
    if (open) {
      setTestResult(null) // Reset test result on open
      if (editingItem) {
        setName(editingItem.name ?? '')
        setRequired(editingItem.required ?? true)
        setSourceType(editingItem.sourceType ?? 'CRM API')
        setSource(editingItem.source ?? '')
        setLookupField(editingItem.lookupField ?? '')
        setCallerField(editingItem.callerField ?? '')
        setTargetField(editingItem.targetField ?? '')
        setConditions(Array.isArray(editingItem.conditions) ? editingItem.conditions : [])
        setLoadData(Array.isArray(editingItem.loadData) ? editingItem.loadData : [])
        setTimeout(editingItem.timeout ?? 3000)
        setFailureBehavior(editingItem.failureBehavior ?? 'proceed-partial')
      } else {
        setName('')
        setRequired(true)
        setSourceType('CRM API')
        setSource('')
        setLookupField('')
        setCallerField('')
        setTargetField('')
        setConditions([])
        setLoadData([])
        setTimeout(3000)
        setFailureBehavior('proceed-partial')
      }
    }
  }, [open, editingItem])

  function handleSave() {
    if (!name?.trim() || !source?.trim()) return
    onSave({
      name,
      required,
      sourceType,
      source,
      lookupField,
      callerField,
      targetField,
      conditions: Array.isArray(conditions) ? conditions : [],
      loadData: Array.isArray(loadData) ? loadData : [],
      timeout,
      failureBehavior,
    })
    onOpenChange(false)
  }

  function addCondition() {
    const current = Array.isArray(conditions) ? conditions : []
    setConditions([...current, { field: '', operator: 'equals', value: '' }])
  }

  function updateCondition(idx: number, field: Partial<PreCallCondition>) {
    const current = Array.isArray(conditions) ? conditions : []
    setConditions(current.map((c, i) => i === idx ? { ...c, ...field } : c))
  }

  function removeCondition(idx: number) {
    const current = Array.isArray(conditions) ? conditions : []
    setConditions(current.filter((_, i) => i !== idx))
  }

  function toggleLoadData(field: string) {
    setLoadData(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    )
  }

  function FieldRow({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 gap-4">{children}</div>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Pre-Call Action' : 'Add Pre-Call Action'}</DialogTitle>
          <DialogDescription>
            Configure what data to retrieve before the call starts
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Basic Info */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <Label>Action Name</Label>
              <Input
                placeholder="e.g. Customer Lookup"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={required} onCheckedChange={setRequired} />
              <Label className="text-sm">Required</Label>
            </div>
          </div>

          <Separator />

          {/* Source Configuration */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Source / Connection</h4>
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Source Type</Label>
                <Select value={sourceType} onValueChange={(v) => v && setSourceType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRM API">CRM API</SelectItem>
                    <SelectItem value="REST API">REST API</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="Function">Function</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Connection Name</Label>
                <Input
                  placeholder="e.g. CRM Connection"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>
            </FieldRow>
            {sourceType === 'CRM API' && (
              source ? (
                <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
                  <Database className="h-3.5 w-3.5" />
                  <span>CRM fields available: {mockCrmFields.length}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Select a CRM connection to configure lookup fields.</p>
              )
            )}
          </div>

          <Separator />

          {/* Lookup Configuration */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Lookup Configuration</h4>
              {sourceType === 'CRM API' && source && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 gap-1.5 text-xs" 
                  onClick={() => setTestResult(Math.random() > 0.2 ? 'success' : 'error')}
                >
                  <Play className="h-3 w-3" /> Test Lookup
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <Label>Caller Field</Label>
                <Select value={callerField} onValueChange={(v) => v && setCallerField(v)}>
                  <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caller.phone_e164">caller.phone_e164</SelectItem>
                    <SelectItem value="caller.email">caller.email</SelectItem>
                    <SelectItem value="customer.account_id">customer.account_id</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-6 shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Label>Target Field (CRM)</Label>
                <Select value={targetField} onValueChange={(v) => v && setTargetField(v)}>
                  <SelectTrigger><SelectValue placeholder="Select CRM field" /></SelectTrigger>
                  <SelectContent>
                    {mockCrmFields.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {testResult === 'success' && (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs space-y-1">
                <p className="font-medium text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Matching record found
                </p>
                <div className="grid grid-cols-3 gap-2 text-muted-foreground mt-2">
                  <div><span className="font-medium text-foreground">Customer Name:</span> Jane Doe</div>
                  <div><span className="font-medium text-foreground">Account Status:</span> Active</div>
                  <div><span className="font-medium text-foreground">Outstanding Balance:</span> $142.50</div>
                </div>
              </div>
            )}
            {testResult === 'error' && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs">
                <p className="font-medium text-destructive flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> No matching record found
                </p>
              </div>
            )}
          </div>

          {/* Optional Conditions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Optional Lookup Conditions</h4>
              <Button size="sm" variant="outline" onClick={addCondition} className="gap-1 h-7 text-xs">
                <Plus className="h-3 w-3" /> Add Condition
              </Button>
            </div>
            {Array.isArray(conditions) && conditions.map((cond, idx) => {
              const selectedField = mockCrmFields.find(f => f.value === cond.field)
              const hideValue = cond.operator === 'is_empty' || cond.operator === 'is_not_empty'
              return (
                <div key={idx} className="flex items-center gap-2">
                  <Select value={cond.field} onValueChange={(v) => v && updateCondition(idx, { field: v, value: '' })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="CRM Field" /></SelectTrigger>
                    <SelectContent>
                      {mockCrmFields.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={cond.operator} onValueChange={(v) => v && updateCondition(idx, { operator: v })}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">equals</SelectItem>
                      <SelectItem value="not_equals">not equals</SelectItem>
                      <SelectItem value="contains">contains</SelectItem>
                      <SelectItem value="starts_with">starts with</SelectItem>
                      <SelectItem value="greater_than">greater than</SelectItem>
                      <SelectItem value="less_than">less than</SelectItem>
                      <SelectItem value="is_empty">is empty</SelectItem>
                      <SelectItem value="is_not_empty">is not empty</SelectItem>
                    </SelectContent>
                  </Select>
                  {!hideValue ? (
                    selectedField?.options ? (
                      <Select value={cond.value} onValueChange={(v) => v && updateCondition(idx, { value: v })}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Value" /></SelectTrigger>
                        <SelectContent>
                          {selectedField.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder="Value" value={cond.value} onChange={(e) => updateCondition(idx, { value: e.target.value })} className="flex-1" />
                    )
                  ) : (
                    <div className="flex-1" />
                  )}
                  <Button size="sm" variant="ghost" onClick={() => removeCondition(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          <Separator />

          {/* Data to Load */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Data to Load into Call Context</h4>
              <span className="text-xs text-muted-foreground">{loadData.length} fields selected</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Select the CRM fields that should be available to the agent when the call starts.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {availableFields.map(field => (
                <div
                  key={field}
                  className={cn(
                    'flex items-center gap-2 rounded border px-3 py-2 cursor-pointer transition-colors',
                    loadData.includes(field)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80'
                  )}
                  onClick={() => toggleLoadData(field)}
                >
                  <Checkbox checked={loadData.includes(field)} />
                  <span className="text-sm">{field}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lookup Preview */}
          {(callerField || targetField || conditions.length > 0 || loadData.length > 0) && (
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lookup Preview</h4>
              <div className="flex flex-col gap-2 text-xs font-mono">
                {callerField && (
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-[10px] uppercase font-sans">Caller Field</span>
                    <span className="text-foreground">{callerField}</span>
                  </div>
                )}
                {targetField && (
                  <>
                    <ArrowDown className="h-3 w-3 text-muted-foreground mx-auto" />
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-[10px] uppercase font-sans">CRM Lookup</span>
                      <span className="text-foreground">{mockCrmFields.find(f => f.value === targetField)?.label || targetField}</span>
                    </div>
                  </>
                )}
                {conditions.length > 0 && (
                  <>
                    <ArrowDown className="h-3 w-3 text-muted-foreground mx-auto" />
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-[10px] uppercase font-sans">Conditions</span>
                      <span className="text-foreground">
                        {conditions.map(c => {
                          const f = mockCrmFields.find(mf => mf.value === c.field)?.label || c.field
                          const op = c.operator.replace('_', ' ')
                          const hideVal = c.operator === 'is_empty' || c.operator === 'is_not_empty'
                          return `${f} ${op}${!hideVal && c.value ? ` ${c.value}` : ''}`
                        }).join('  AND  ')}
                      </span>
                    </div>
                  </>
                )}
                {loadData.length > 0 && (
                  <>
                    <ArrowDown className="h-3 w-3 text-muted-foreground mx-auto" />
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-[10px] uppercase font-sans">Data Loaded</span>
                      <span className="text-foreground">{loadData.join(' · ')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Timeout and Failure Behavior */}
          <div className="flex flex-col gap-3">
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Timeout (ms)</Label>
                <Input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value) || 3000)}
                  min={1000}
                  max={30000}
                  step={500}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>On Failure</Label>
                <Select value={failureBehavior} onValueChange={(v) => v && setFailureBehavior(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proceed-partial">Proceed with partial context</SelectItem>
                    <SelectItem value="proceed-without">Proceed without enrichment</SelectItem>
                    <SelectItem value="stop">Stop / fail pre-call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name?.trim() || !source?.trim()}>
            {editingItem ? 'Save Changes' : 'Add Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}