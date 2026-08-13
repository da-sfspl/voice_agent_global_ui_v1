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

export type RuleItem = {
  id?: string
  name: string
  description: string
  priority: number
  conditionType: string
  conditionDetails: string
  actionType: string
  actionConfig: string
  enabled?: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (rule: RuleItem) => void
  editingItem?: RuleItem | null
}

const emptyForm: RuleItem = {
  name: '',
  description: '',
  priority: 5,
  conditionType: 'caller-request',
  conditionDetails: '',
  actionType: 'transfer',
  actionConfig: '',
  enabled: true,
}

export function AddRuleDialog({ open, onOpenChange, onSave, editingItem }: Props) {
  const [form, setForm] = useState<RuleItem>(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(editingItem ? { ...editingItem } : { ...emptyForm })
    }
  }, [open, editingItem])

  function handleSave() {
    if (!form.name.trim()) return
    onSave(form)
    onOpenChange(false)
  }

  const isEditing = !!editingItem

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the rule condition and action.' : 'Define a condition and action for agent behavior.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Rule Name</Label>
              <Input
                placeholder="e.g. Transfer on Frustration"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.priority}
                onChange={(e) => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 5 }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              placeholder="Describe when this rule should trigger..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[var(--status-warning)]" />
              <span className="text-sm font-semibold">WHEN / CONDITION</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Condition Type</Label>
              <Select value={form.conditionType} onValueChange={(v) => v && setForm(f => ({ ...f, conditionType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="caller-request">Caller requests human</SelectItem>
                  <SelectItem value="frustration">Customer frustration threshold</SelectItem>
                  <SelectItem value="unresolved">Issue unresolved after N turns</SelectItem>
                  <SelectItem value="ineligible">Customer is not eligible</SelectItem>
                  <SelectItem value="intent">Specific intent detected</SelectItem>
                  <SelectItem value="field">Specific extracted field/value</SelectItem>
                  <SelectItem value="duration">Call duration exceeds limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Condition Details</Label>
              <Input
                placeholder="e.g. Frustration count >= 2"
                className="font-mono text-xs"
                value={form.conditionDetails}
                onChange={(e) => setForm(f => ({ ...f, conditionDetails: e.target.value }))}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">THEN / ACTION</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Action Type</Label>
              <Select value={form.actionType} onValueChange={(v) => v && setForm(f => ({ ...f, actionType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer Call</SelectItem>
                  <SelectItem value="end">End Call</SelectItem>
                  <SelectItem value="invoke">Invoke Function</SelectItem>
                  <SelectItem value="continue">Continue Conversation</SelectItem>
                  <SelectItem value="change-flow">Change Conversation Flow</SelectItem>
                  <SelectItem value="webhook">Trigger Webhook</SelectItem>
                  <SelectItem value="variable">Set/Update Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Action Configuration</Label>
              <Input
                placeholder="e.g. Support Queue"
                value={form.actionConfig}
                onChange={(e) => setForm(f => ({ ...f, actionConfig: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {isEditing ? 'Save Changes' : 'Add Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}