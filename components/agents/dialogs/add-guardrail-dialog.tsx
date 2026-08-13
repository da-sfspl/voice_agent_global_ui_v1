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

export type GuardrailItem = {
  id?: string
  label: string
  description: string
  action: string
  detectionCondition: string
  protectedData: string
  responseBehavior: string
  enabled: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (guardrail: GuardrailItem) => void
  editingItem?: GuardrailItem | null
}

const emptyForm: GuardrailItem = {
  label: '',
  description: '',
  action: 'refuse',
  detectionCondition: '',
  protectedData: '',
  responseBehavior: '',
  enabled: true,
}

export function AddGuardrailDialog({ open, onOpenChange, onSave, editingItem }: Props) {
  const [form, setForm] = useState<GuardrailItem>(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(editingItem ? { ...editingItem } : { ...emptyForm })
    }
  }, [open, editingItem])

  function handleSave() {
    if (!form.label.trim()) return
    onSave(form)
    onOpenChange(false)
  }

  const isEditing = !!editingItem

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Guardrail' : 'Add Guardrail'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the guardrail configuration.' : 'Define a safety or compliance boundary for agent behavior.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Guardrail Name</Label>
            <Input
              placeholder="e.g. Block PII Collection"
              value={form.label}
              onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              placeholder="Describe what this guardrail prevents or enforces..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Action</Label>
              <Select value={form.action} onValueChange={(v) => v && setForm(f => ({ ...f, action: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="refuse">Refuse</SelectItem>
                  <SelectItem value="redact">Redact</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="end-call">End Call</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">What happens when this guardrail triggers</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Response / Fallback Behavior</Label>
              <Select value={form.responseBehavior} onValueChange={(v) => v && setForm(f => ({ ...f, responseBehavior: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apologize">Apologize and redirect</SelectItem>
                  <SelectItem value="clarify">Ask for clarification</SelectItem>
                  <SelectItem value="escalate">Escalate to human</SelectItem>
                  <SelectItem value="silence">Silently handle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Detection Condition / Rule</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Detect when user requests SSN, credit card number, or password"
              value={form.detectionCondition}
              onChange={(e) => setForm(f => ({ ...f, detectionCondition: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Describe the pattern or condition that triggers this guardrail</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Protected Data or Topic</Label>
            <Input
              placeholder="e.g. SSN, credit card, medical records, investments"
              value={form.protectedData}
              onChange={(e) => setForm(f => ({ ...f, protectedData: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of protected items</p>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => setForm(f => ({ ...f, enabled: v }))}
            />
            <Label>Enable this guardrail</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.label.trim()}>
            {isEditing ? 'Save Changes' : 'Add Guardrail'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}