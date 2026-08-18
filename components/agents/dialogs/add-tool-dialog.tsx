'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
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

export type ToolItem = {
  id?: string
  name: string
  description: string
  type: string
  endpoint?: string
  httpMethod?: string
  authentication?: string
  timeout?: number
  retryPolicy?: string
  parameters?: { name: string; type: string; description: string; required: boolean }[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (tool: ToolItem) => void
  editingItem?: ToolItem | null
}

const emptyForm: ToolItem = {
  name: '',
  description: '',
  type: 'rest-api',
  endpoint: '',
  httpMethod: 'GET',
  authentication: 'api-key',
  timeout: 5000,
  retryPolicy: '3',
  parameters: [],
}

export function AddToolDialog({ open, onOpenChange, onSave, editingItem }: Props) {
  const [form, setForm] = useState<ToolItem>(emptyForm)

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

  function addParameter() {
    setForm(f => ({
      ...f,
      parameters: [...(f.parameters ?? []), { name: '', type: 'string', description: '', required: false }],
    }))
  }

  function updateParameter(index: number, key: string, value: string | boolean) {
    setForm(f => ({
      ...f,
      parameters: (f.parameters ?? []).map((p, i) => i === index ? { ...p, [key]: value } : p),
    }))
  }

  function removeParameter(index: number) {
    setForm(f => ({
      ...f,
      parameters: (f.parameters ?? []).filter((_, i) => i !== index),
    }))
  }

  const isEditing = !!editingItem

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Custom Function' : 'Add Custom Function'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the function configuration.' : 'Define a new function the agent can call during conversations.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Function Name</Label>
              <Input
                placeholder="e.g. check_inventory"
                className="font-mono text-xs"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Function Type</Label>
              <Select value={form.type} onValueChange={(v) => v && setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rest-api">REST API</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="built-in">Built-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              placeholder="Describe what this function does..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Endpoint / URL</Label>
              <Input
                placeholder="https://api.example.com/v1/resource"
                className="font-mono text-xs"
                value={form.endpoint ?? ''}
                onChange={(e) => setForm(f => ({ ...f, endpoint: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>HTTP Method</Label>
              <Select value={form.httpMethod ?? 'GET'} onValueChange={(v) => v && setForm(f => ({ ...f, httpMethod: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Authentication</Label>
            <Select value={form.authentication ?? 'api-key'} onValueChange={(v) => v && setForm(f => ({ ...f, authentication: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="api-key">API Key</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Request Parameters</Label>
            <div className="rounded-md border border-border p-3 space-y-2">
              {(form.parameters ?? []).map((param, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_1fr_80px_32px] gap-2 text-xs items-center">
                  <Input
                    placeholder="Name"
                    className="font-mono text-xs h-8"
                    value={param.name}
                    onChange={(e) => updateParameter(i, 'name', e.target.value)}
                  />
                  <Select value={param.type} onValueChange={(v) => v && updateParameter(i, 'type', v)}>
                    <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Description"
                    className="text-xs h-8"
                    value={param.description}
                    onChange={(e) => updateParameter(i, 'description', e.target.value)}
                  />
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={param.required}
                      onCheckedChange={(v) => updateParameter(i, 'required', v)}
                    />
                    <span className="text-[10px] text-muted-foreground">Req</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeParameter(i)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={addParameter}>
                <Plus className="h-3 w-3" /> Add Parameter
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Timeout (ms)</Label>
              <Input
                type="number"
                value={form.timeout ?? 5000}
                onChange={(e) => setForm(f => ({ ...f, timeout: parseInt(e.target.value) || 5000 }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Retry Policy</Label>
              <Select value={form.retryPolicy ?? '3'} onValueChange={(v) => v && setForm(f => ({ ...f, retryPolicy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No retry</SelectItem>
                  <SelectItem value="1">1 retry</SelectItem>
                  <SelectItem value="3">3 retries</SelectItem>
                  <SelectItem value="5">5 retries</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {isEditing ? 'Save Changes' : 'Add Function'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}