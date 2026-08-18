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

export type ExtractionField = {
  id?: string
  name: string
  type: string
  description: string
  confidence: number
  lowConfidenceBehavior: string
  required: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (field: ExtractionField) => void
  editingItem?: ExtractionField | null
}

const emptyForm: ExtractionField = {
  name: '',
  type: 'string',
  description: '',
  confidence: 80,
  lowConfidenceBehavior: 'clarify',
  required: false,
}

export function AddExtractionFieldDialog({ open, onOpenChange, onSave, editingItem }: Props) {
  const [form, setForm] = useState<ExtractionField>(emptyForm)

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
          <DialogTitle>{isEditing ? 'Edit Extraction Field' : 'Add Extraction Field'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the extraction field configuration.' : 'Define a field to extract from conversations.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Field Name</Label>
              <Input
                placeholder="e.g. customer_phone"
                className="font-mono text-xs"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Data Type</Label>
              <Select value={form.type} onValueChange={(v) => v && setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date / DateTime</SelectItem>
                  <SelectItem value="enum">Enum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              placeholder="Describe what this field represents..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Confidence Threshold</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.confidence}
                onChange={(e) => setForm(f => ({ ...f, confidence: parseInt(e.target.value) || 80 }))}
              />
              <p className="text-xs text-muted-foreground">Minimum confidence to accept extraction</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Low Confidence Behavior</Label>
              <Select value={form.lowConfidenceBehavior} onValueChange={(v) => v && setForm(f => ({ ...f, lowConfidenceBehavior: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="accept">Accept anyway</SelectItem>
                  <SelectItem value="clarify">Request clarification</SelectItem>
                  <SelectItem value="review">Send for review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.required}
              onCheckedChange={(v) => setForm(f => ({ ...f, required: v }))}
            />
            <Label>Required field</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {isEditing ? 'Save Changes' : 'Add Field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}