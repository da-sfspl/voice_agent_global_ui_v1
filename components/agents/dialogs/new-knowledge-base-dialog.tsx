'use client'

import { useState } from 'react'
import {
  File, Link, Plug, Upload, Plus, FileText, Globe, Eye, EyeOff, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'

// ─── API form helper ────────────────────────────────────────────────────────
type ApiForm = {
  name: string
  endpoint: string
  authMethod: string
  apiKey: string
  requestMethod: string
  headers: string
  schema: string
  syncFrequency: string
}

function emptyApiForm(): ApiForm {
  return {
    name: '', endpoint: '', authMethod: 'api-key', apiKey: '',
    requestMethod: 'GET', headers: '', schema: '', syncFrequency: 'daily',
  }
}

// ─── Reusable Dialog Component ──────────────────────────────────────────────
type NewKnowledgeBaseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (kb: { name: string; description: string }) => void
}

export function NewKnowledgeBaseDialog({ open, onOpenChange, onSave }: NewKnowledgeBaseDialogProps) {
  const [newKbName, setNewKbName] = useState('')
  const [newKbDescription, setNewKbDescription] = useState('')

  // API form state (shared with your existing logic)
  const [showApiForm, setShowApiForm] = useState(false)
  const [editingApi, setEditingApi] = useState<any>(null)
  const [apiForm, setApiForm] = useState<ApiForm>(emptyApiForm())
  const [showKey, setShowKey] = useState(false)

  function resetForm() {
    setNewKbName('')
    setNewKbDescription('')
    setShowApiForm(false)
    setEditingApi(null)
    setApiForm(emptyApiForm())
    setShowKey(false)
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  function handleSave() {
    if (!newKbName.trim()) return
    onSave?.({ name: newKbName, description: newKbDescription })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Knowledge Base</DialogTitle>
          <DialogDescription>
            Set up your new knowledge base by adding documents, URLs, and API sources.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Knowledge Base Name</Label>
              <Input
                placeholder="e.g. Product Documentation"
                value={newKbName}
                onChange={(e) => setNewKbName(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                placeholder="Brief description of this knowledge base"
                value={newKbDescription}
                onChange={(e) => setNewKbDescription(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="new-documents" className="flex-1">
            <TabsList className="h-8">
              <TabsTrigger value="new-documents" className="text-xs gap-1.5">
                <File className="h-3.5 w-3.5" /> Documents (0)
              </TabsTrigger>
              <TabsTrigger value="new-urls" className="text-xs gap-1.5">
                <Link className="h-3.5 w-3.5" /> URLs (0)
              </TabsTrigger>
              <TabsTrigger value="new-apis" className="text-xs gap-1.5">
                <Plug className="h-3.5 w-3.5" /> APIs (0)
              </TabsTrigger>
              <TabsTrigger value="new-settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="new-documents" className="mt-4 flex flex-col gap-3">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs w-fit">
                <Upload className="h-3.5 w-3.5" /> Upload Documents
              </Button>
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-10 text-muted-foreground">
                <FileText className="h-8 w-8 opacity-30" />
                <p className="text-xs">No documents added yet. Upload files to get started.</p>
              </div>
            </TabsContent>

            <TabsContent value="new-urls" className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input placeholder="https://help.acme.com/..." className="h-8 text-xs flex-1" />
                <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add URL
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-10 text-muted-foreground">
                <Globe className="h-8 w-8 opacity-30" />
                <p className="text-xs">No URLs added yet.</p>
              </div>
            </TabsContent>

            <TabsContent value="new-apis" className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Connect private database APIs.</p>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs shrink-0"
                  onClick={() => {
                    setApiForm(emptyApiForm())
                    setEditingApi(null)
                    setShowApiForm(true)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add API Source
                </Button>
              </div>

              {showApiForm && (
                <div className="rounded-md border border-border bg-muted/20 p-4 flex flex-col gap-3">
                  <p className="text-xs font-medium">{editingApi ? 'Edit API Source' : 'New API Source'}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">API Name</Label>
                      <Input className="h-8 text-xs" value={apiForm.name} onChange={e => setApiForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Endpoint</Label>
                      <Input className="h-8 text-xs font-mono" value={apiForm.endpoint} onChange={e => setApiForm(f => ({ ...f, endpoint: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Auth Method</Label>
                      <Select value={apiForm.authMethod} onValueChange={(v) => v && setApiForm(f => ({ ...f, authMethod: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api-key" className="text-xs">API Key</SelectItem>
                          <SelectItem value="bearer" className="text-xs">Bearer Token</SelectItem>
                          <SelectItem value="basic" className="text-xs">Basic Auth</SelectItem>
                          <SelectItem value="none" className="text-xs">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">API Key / Token</Label>
                      <div className="relative">
                        <Input
                          className="h-8 text-xs font-mono pr-8"
                          type={showKey ? 'text' : 'password'}
                          value={apiForm.apiKey}
                          onChange={e => setApiForm(f => ({ ...f, apiKey: e.target.value }))}
                        />
                        <button type="button" onClick={() => setShowKey(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="h-8 text-xs" onClick={() => setShowApiForm(false)}>Connect API</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowApiForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {!showApiForm && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-10 text-muted-foreground">
                  <Plug className="h-8 w-8 opacity-30" />
                  <p className="text-xs">No API sources connected yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="new-settings" className="mt-4">
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Chunk Size</Label>
                  <Input defaultValue="512" className="h-8 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Overlap</Label>
                  <Input defaultValue="64" className="h-8 text-sm" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!newKbName.trim()}>
            Save Knowledge Base
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}