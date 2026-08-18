'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Plus, X } from 'lucide-react'
import { SelectGroup, SelectLabel } from '@/components/ui/select'


export type RuleCondition = {
  category: string
  field: string
  operator: string
  value: string
}

export type RuleItem = {
  id: string
  name: string
  description: string
  priority: number
  enabled: boolean
  conditions: RuleCondition[]
  actionType: 'transfer' | 'escalate' | 'end-call' | 'flag' | 'notify'
  actionTarget: string
}


type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (rule: RuleItem) => void
  editingItem?: RuleItem | null
}

// const emptyForm: RuleItem = {
//   name: '',
//   description: '',
//   priority: 5,
//   conditionType: 'caller-request',
//   conditionDetails: '',
//   actionType: 'transfer',
//   actionConfig: '',
//   enabled: true,
// }

// Add this near the top of your file, after imports
function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {children}
    </div>
  )
}

// ─── Add/Edit Rule Dialog ───────────────────────────────────────────────────
export function AddRuleDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: RuleItem | null
  onSave: (rule: Omit<RuleItem, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(1)
  const [enabled, setEnabled] = useState(true)
  const [conditions, setConditions] = useState<RuleCondition[]>([])
  const [actionType, setActionType] = useState<'transfer' | 'escalate' | 'end-call' | 'flag' | 'notify'>('transfer')
  const [actionTarget, setActionTarget] = useState('')

  const conditionCategories = [
    {
      label: 'Caller / Conversation',
      fields: [
        { value: 'request_type', label: 'Request type' },
        { value: 'frustration_level', label: 'Frustration level' },
        { value: 'misunderstanding_count', label: 'Misunderstanding count' },
        { value: 'silence_duration', label: 'Silence duration' },
      ]
    },
    {
      label: 'Customer / CRM Context',
      fields: [
        { value: 'account_status', label: 'Account status' },
        { value: 'customer_type', label: 'Customer type' },
        { value: 'days_overdue', label: 'Days overdue' },
        { value: 'outstanding_balance', label: 'Outstanding balance' },
      ]
    },
    {
      label: 'Conversation State',
      fields: [
        { value: 'attempts_count', label: 'Attempts count' },
        { value: 'call_duration', label: 'Call duration' },
        { value: 'objective_achieved', label: 'Objective achieved' },
      ]
    },
  ]

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setName(editingItem.name)
        setDescription(editingItem.description)
        setPriority(editingItem.priority)
        setEnabled(editingItem.enabled)
        setConditions(Array.isArray(editingItem.conditions) ? editingItem.conditions : [])
        setActionType(editingItem.actionType)
        setActionTarget(editingItem.actionTarget)
      } else {
        setName('')
        setDescription('')
        setPriority(1)
        setEnabled(true)
        setConditions([{ category: '', field: '', operator: 'equals', value: '' }])
        setActionType('transfer')
        setActionTarget('')
      }
    }
  }, [open, editingItem])

  function handleSave() {
    if (!name.trim() || conditions.length === 0 || !actionTarget.trim()) return
    onSave({ name, description, priority, enabled, conditions, actionType, actionTarget })
    onOpenChange(false)
  }

  function addCondition() {
    setConditions([...conditions, { category: '', field: '', operator: 'equals', value: '' }])
  }

  function updateCondition(idx: number, field: Partial<RuleCondition>) {
    setConditions(conditions.map((c, i) => i === idx ? { ...c, ...field } : c))
  }

  function removeCondition(idx: number) {
    setConditions(conditions.filter((_, i) => i !== idx))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
          <DialogDescription>
            Configure deterministic WHEN → THEN decisions
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Basic Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <Label>Rule Name</Label>
                <Input
                  placeholder="e.g. Human Request"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 w-24">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                  min={1}
                  max={99}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description (optional)</Label>
              <Input
                placeholder="Brief description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              <Label>Enabled</Label>
            </div>
          </div>

          <Separator />

          {/* WHEN - Conditions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">WHEN</h4>
              <Button size="sm" variant="outline" onClick={addCondition} className="gap-1">
                <Plus className="h-3 w-3" /> Add Condition
              </Button>
            </div>
            <div className="space-y-2">
              {conditions.map((cond, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded border border-border p-3 bg-muted/20">
                  {idx > 0 && (
                    <div className="text-xs font-medium text-muted-foreground">AND</div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select
                      value={cond.field}
                      onValueChange={(v) => {
                        if (!v) return
                        const category = conditionCategories.find(c =>
                          c.fields.some(f => f.value === v)
                        )?.label || ''
                        updateCondition(idx, { field: v, category })
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionCategories.map(cat => (
                          <SelectGroup key={cat.label}>
                            <SelectLabel>{cat.label}</SelectLabel>
                            {cat.fields.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={cond.operator}
                      onValueChange={(v) => v && updateCondition(idx, { operator: v })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not-equals">not equals</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value=">=">&gt;=</SelectItem>
                        <SelectItem value="<=">&lt;=</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={cond.value}
                      onChange={(e) => updateCondition(idx, { value: e.target.value })}
                      className="flex-1"
                    />
                    {conditions.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => removeCondition(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* THEN - Action */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">THEN</h4>
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Action</Label>
                <Select value={actionType}
                  onValueChange={(v) => v && setActionType(v as 'transfer' | 'escalate' | 'end-call' | 'flag' | 'notify')}
                 >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer to</SelectItem>
                    <SelectItem value="escalate">Escalate to</SelectItem>
                    <SelectItem value="end-call">End call</SelectItem>
                    <SelectItem value="flag">Flag for review</SelectItem>
                    <SelectItem value="notify">Send notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Target</Label>
                <Input
                  placeholder="e.g. Support Queue"
                  value={actionTarget}
                  onChange={(e) => setActionTarget(e.target.value)}
                />
              </div>
            </FieldRow>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || conditions.length === 0 || !actionTarget.trim()}>
            {editingItem ? 'Save Changes' : 'Add Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}