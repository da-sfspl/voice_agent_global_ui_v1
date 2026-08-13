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

export type PreCallAction = {
  id?: string
  name: string
  type: string
  source: string
  endpoint: string
  conditions: string
  timeout: number
  failureBehavior: string
  required: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (action: PreCallAction) => void
  editingItem?: PreCallAction | null
}

const emptyForm: PreCallAction = {
  name: '',
  type: 'function',
  source: '',
  endpoint: '',
  conditions: '',
  timeout: 3000,
  failureBehavior: 'proceed-partial',
  required: false,
}

export function AddPreCallActionDialog({ open, onOpenChange, onSave, editingItem }: Props) {
  const [form, setForm] = useState<PreCallAction>(emptyForm)

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Pre-Call Action' : 'Add Pre-Call Action'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the pre-call action configuration.' : 'Define an action to execute before the call starts.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Action Name</Label>
              <Input
                placeholder="e.g. Verify Customer Identity"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Action Type</Label>
              <Select value={form.type} onValueChange={(v) => v && setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="function">Function</SelectItem>
                  <SelectItem value="rest-api">REST API</SelectItem>
                  <SelectItem value="business-rule">Business Rule</SelectItem>
                  <SelectItem value="data-enrichment">Data Enrichment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Source / Integration</Label>
              <Input
                placeholder="e.g. Salesforce CRM"
                value={form.source}
                onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Function or Endpoint</Label>
              <Input
                placeholder="e.g. /api/v1/customers/{id}"
                className="font-mono text-xs"
                value={form.endpoint}
                onChange={(e) => setForm(f => ({ ...f, endpoint: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Conditions</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Only execute for outbound calls to existing customers"
              value={form.conditions}
              onChange={(e) => setForm(f => ({ ...f, conditions: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Timeout (ms)</Label>
              <Input
                type="number"
                value={form.timeout}
                onChange={(e) => setForm(f => ({ ...f, timeout: parseInt(e.target.value) || 3000 }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Failure Behavior</Label>
              <Select value={form.failureBehavior} onValueChange={(v) => v && setForm(f => ({ ...f, failureBehavior: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="proceed">Proceed</SelectItem>
                  <SelectItem value="proceed-partial">Proceed with partial context</SelectItem>
                  <SelectItem value="skip">Skip call</SelectItem>
                  <SelectItem value="fail">Fail call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.required}
              onCheckedChange={(v) => setForm(f => ({ ...f, required: v }))}
            />
            <Label>Required (call fails if this action fails)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {isEditing ? 'Save Changes' : 'Add Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}