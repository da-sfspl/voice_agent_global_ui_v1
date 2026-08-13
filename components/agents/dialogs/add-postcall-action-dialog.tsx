'use client'

import { useState, useEffect } from 'react'
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

export type PostCallAction = {
  id?: string
  name: string
  actionType: string
  trigger: string
  payload: string
  retryBehavior: string
  failureHandling: string
  enabled?: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (action: PostCallAction) => void
  editingItem?: PostCallAction | null
}

const defaultPayload = `{
  "customer_name": "{{customer_name}}",
  "order_id": "{{order_id}}",
  "outcome": "{{call_outcome}}",
  "sentiment": "{{sentiment}}"
}`

const emptyForm: PostCallAction = {
  name: '',
  actionType: 'crm-update',
  trigger: 'call-completed',
  payload: defaultPayload,
  retryBehavior: '3',
  failureHandling: 'log',
  enabled: true,
}

export function AddPostCallActionDialog({ open, onOpenChange, onSave, editingItem }: Props) {
  const [form, setForm] = useState<PostCallAction>(emptyForm)

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
          <DialogTitle>{isEditing ? 'Edit Post-Call Action' : 'Add Post-Call Action'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the post-call action configuration.' : 'Define an action to execute after the call finishes.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Action Name</Label>
              <Input
                placeholder="e.g. Schedule Callback"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Action Type</Label>
              <Select value={form.actionType} onValueChange={(v) => v && setForm(f => ({ ...f, actionType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="crm-update">CRM Update</SelectItem>
                  <SelectItem value="function">Function</SelectItem>
                  <SelectItem value="rest-api">REST API</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="task">Task Creation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Trigger</Label>
            <Select value={form.trigger} onValueChange={(v) => v && setForm(f => ({ ...f, trigger: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="call-completed">Call Completed</SelectItem>
                <SelectItem value="call-failed">Call Failed</SelectItem>
                <SelectItem value="specific-outcome">Specific Call Outcome</SelectItem>
                <SelectItem value="field-condition">Extracted Field Condition</SelectItem>
                <SelectItem value="confidence-condition">Confidence Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Payload (JSON)</Label>
            <Textarea
              rows={6}
              value={form.payload}
              onChange={(e) => setForm(f => ({ ...f, payload: e.target.value }))}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">Use {'{{field_name}}'} to reference extracted conversation fields.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Retry Behavior</Label>
              <Select value={form.retryBehavior} onValueChange={(v) => v && setForm(f => ({ ...f, retryBehavior: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No retry</SelectItem>
                  <SelectItem value="3">3 retries</SelectItem>
                  <SelectItem value="5">5 retries</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Failure Handling</Label>
              <Select value={form.failureHandling} onValueChange={(v) => v && setForm(f => ({ ...f, failureHandling: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="log">Log and continue</SelectItem>
                  <SelectItem value="alert">Alert admin</SelectItem>
                  <SelectItem value="retry-later">Retry later</SelectItem>
                </SelectContent>
              </Select>
            </div>
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