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
import { cn } from '@/lib/utils'
import { Checkbox } from "@/components/ui/checkbox";

export type RuleCondition = {
  category: string
  field: string
  operator: string
  value: string
}

export type GuardrailItem = {
  id: string
  name: string
  description: string
  priority: number
  enabled: boolean
  protectedData: string[]
  conditions: RuleCondition[]
  checkBefore: boolean
  checkAfter: boolean
  action: 'block' | 'redact' | 'replace' | 'transfer' | 'end-call'
  safeResponse: string
}

// type Props = {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onSave: (guardrail: GuardrailItem) => void
//   editingItem?: GuardrailItem | null
// }

// const emptyForm: GuardrailItem = {
//   label: '',
//   description: '',
//   action: 'refuse',
//   detectionCondition: '',
//   protectedData: '',
//   responseBehavior: '',
//   enabled: true,
// }

// ─── Add/Edit Guardrail Dialog ──────────────────────────────────────────────
export function AddGuardrailDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: GuardrailItem | null
  onSave: (guardrail: Omit<GuardrailItem, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(1)
  const [enabled, setEnabled] = useState(true)
  const [protectedData, setProtectedData] = useState<string[]>([])
  const [conditions, setConditions] = useState<RuleCondition[]>([])
  const [checkBefore, setCheckBefore] = useState(true)
  const [checkAfter, setCheckAfter] = useState(true)
  const [action, setAction] = useState<'block' | 'redact' | 'replace' | 'transfer' | 'end-call'>('block')  
  const [safeResponse, setSafeResponse] = useState('')

  const protectedDataOptions = [
    'SSN / government ID',
    'Card number',
    'Bank account',
    'Password / credential',
    'Profanity',
    'Personal health information',
    'Other sensitive information'
  ]

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setName(editingItem.name)
        setDescription(editingItem.description)
        setPriority(editingItem.priority)
        setEnabled(editingItem.enabled)
        setProtectedData(Array.isArray(editingItem.protectedData) ? editingItem.protectedData : [])
        setConditions(Array.isArray(editingItem.conditions) ? editingItem.conditions : [])
        setCheckBefore(editingItem.checkBefore)
        setCheckAfter(editingItem.checkAfter)
        setAction(editingItem.action)
        setSafeResponse(editingItem.safeResponse)
      } else {
        setName('')
        setDescription('')
        setPriority(1)
        setEnabled(true)
        setProtectedData([])
        setConditions([])
        setCheckBefore(true)
        setCheckAfter(true)
        setAction('block')
        setSafeResponse('')
      }
    }
  }, [open, editingItem])

  function handleSave() {
    if (!name.trim() || protectedData.length === 0) return
    onSave({
      name,
      description,
      priority,
      enabled,
      protectedData,
      conditions,
      checkBefore,
      checkAfter,
      action,
      safeResponse,
    })
    onOpenChange(false)
  }

  function toggleProtectedData(data: string) {
    setProtectedData(prev =>
      prev.includes(data) ? prev.filter(d => d !== data) : [...prev, data]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Guardrail' : 'Add Guardrail'}</DialogTitle>
          <DialogDescription>
            Configure deterministic policies to protect agent behavior
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Basic Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <Label>Guardrail Name</Label>
                <Input
                  placeholder="e.g. PII Protection"
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

          {/* Protected Data */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Protected Data / Target</h4>
            <p className="text-xs text-muted-foreground">
              What type of information should this guardrail detect and protect?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {protectedDataOptions.map(option => (
                <div
                  key={option}
                  className={cn(
                    'flex items-center gap-2 rounded border px-3 py-2 cursor-pointer transition-colors',
                    protectedData.includes(option)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80'
                  )}
                  onClick={() => toggleProtectedData(option)}
                >
                  <Checkbox checked={protectedData.includes(option)} />
                  <span className="text-sm">{option}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Evaluation Stage */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Evaluation Stage</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox checked={checkBefore} onCheckedChange={(v) => setCheckBefore(!!v)} />
                <div className="flex-1">
                  <Label className="text-sm font-medium">Before response generation</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Controls whether the requested response should be generated
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox checked={checkAfter} onCheckedChange={(v) => setCheckAfter(!!v)} />
                <div className="flex-1">
                  <Label className="text-sm font-medium">After response generation</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Validates the generated response before it is returned to the caller
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Violation Action */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Violation Action</h4>
            <Select value={action} onValueChange={(v) => v && setAction(v as typeof action)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block response</SelectItem>
                <SelectItem value="redact">Redact detected content</SelectItem>
                <SelectItem value="replace">Replace with safe response</SelectItem>
                <SelectItem value="transfer">Transfer to human</SelectItem>
                <SelectItem value="end-call">End call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Safe Response */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Safe Response</h4>
            <p className="text-xs text-muted-foreground">
              What should the agent say when this guardrail is triggered?
            </p>
            <Textarea
              placeholder="I can't help with that request. Let me connect you with a representative."
              value={safeResponse}
              onChange={(e) => setSafeResponse(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} 
             disabled={!name?.trim() || !Array.isArray(protectedData) || protectedData.length === 0}
            >
            {editingItem ? 'Save Changes' : 'Add Guardrail'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}