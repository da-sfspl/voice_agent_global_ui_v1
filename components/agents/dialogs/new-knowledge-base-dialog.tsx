'use client'

import { useState, useEffect } from 'react'
import {
  File, Link, Plug, Upload, Plus, FileText, Globe, Eye, EyeOff, Clock, Trash2
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
import type { KnowledgeBase, DocumentItem, UrlItem, ApiItem } from '@/lib/data'



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

// ─── Updated onSave signature ───────────────────────────────────────────────
type KbSavePayload = {
  name: string
  description: string
  documentItems: DocumentItem[]
  urlItems: UrlItem[]
  apiItems: ApiItem[]
}

type NewKnowledgeBaseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: KnowledgeBase | null
  onSave?: (kb: KbSavePayload) => void
}

export function NewKnowledgeBaseDialog({
  open,
  onOpenChange,
  onSave,
  editing,
}: NewKnowledgeBaseDialogProps) {
  const [newKbName, setNewKbName] = useState('')
  const [newKbDescription, setNewKbDescription] = useState('')

  // Editable content state
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [urls, setUrls] = useState<UrlItem[]>([])
  const [apis, setApis] = useState<ApiItem[]>([])

  // URL input
  const [newUrl, setNewUrl] = useState('')

  // API form
  const [showApiForm, setShowApiForm] = useState(false)
  const [editingApi, setEditingApi] = useState<ApiItem | null>(null)
  const [apiForm, setApiForm] = useState<ApiForm>(emptyApiForm())
  const [showKey, setShowKey] = useState(false)

  const isEditing = !!editing

  useEffect(() => {
    if (open) {
      if (editing) {
        setNewKbName(editing.name ?? '')
        setNewKbDescription(editing.description ?? '')
        // Pre-fill from the KB's stored items (or generate dummy if missing)
        setDocuments(editing.documentItems ?? [])
        setUrls(editing.urlItems ?? [])
        setApis(editing.apiItems ?? [])
      } else {
        setNewKbName('')
        setNewKbDescription('')
        setDocuments([])
        setUrls([])
        setApis([])
      }
      setNewUrl('')
      setShowApiForm(false)
      setEditingApi(null)
      setApiForm(emptyApiForm())
      setShowKey(false)
    }
  }, [open, editing])

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setNewKbName('')
      setNewKbDescription('')
      setDocuments([])
      setUrls([])
      setApis([])
      setNewUrl('')
      setShowApiForm(false)
      setEditingApi(null)
      setApiForm(emptyApiForm())
      setShowKey(false)
    }
    onOpenChange(isOpen)
  }

  function handleSave() {
    if (!newKbName.trim()) return
    onSave?.({
      name: newKbName,
      description: newKbDescription,
      documentItems: documents,
      urlItems: urls,
      apiItems: apis,
    })
    handleOpenChange(false)
  }

  // ─── Document actions ────────────────────────────────────────────────────
  function deleteDocument(id: string) {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  // ─── URL actions ─────────────────────────────────────────────────────────
  function addUrl() {
    const trimmed = newUrl.trim()
    if (!trimmed) return
    setUrls(prev => [...prev, {
      id: `url-${Date.now()}`,
      url: trimmed,
      title: trimmed.split('/').filter(Boolean).pop() || trimmed,
    }])
    setNewUrl('')
  }

  function deleteUrl(id: string) {
    setUrls(prev => prev.filter(u => u.id !== id))
  }

  // ─── API actions ─────────────────────────────────────────────────────────
  function deleteApi(id: string) {
    setApis(prev => prev.filter(a => a.id !== id))
  }

  function editApi(api: ApiItem) {
    setEditingApi(api)
    setApiForm({
      name: api.name,
      endpoint: api.endpoint,
      authMethod: api.authMethod,
      apiKey: '',
      requestMethod: api.requestMethod,
      headers: '',
      schema: '',
      syncFrequency: api.syncFrequency,
    })
    setShowApiForm(true)
  }

  function saveApiForm() {
    if (!apiForm.name.trim() || !apiForm.endpoint.trim()) return
    if (editingApi) {
      setApis(prev => prev.map(a => a.id === editingApi.id ? {
        ...a,
        name: apiForm.name,
        endpoint: apiForm.endpoint,
        authMethod: apiForm.authMethod,
        requestMethod: apiForm.requestMethod,
        syncFrequency: apiForm.syncFrequency,
      } : a))
    } else {
      setApis(prev => [...prev, {
        id: `api-${Date.now()}`,
        name: apiForm.name,
        endpoint: apiForm.endpoint,
        authMethod: apiForm.authMethod,
        requestMethod: apiForm.requestMethod,
        syncFrequency: apiForm.syncFrequency,
      }])
    }
    setShowApiForm(false)
    setEditingApi(null)
    setApiForm(emptyApiForm())
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Knowledge Base' : 'Create New Knowledge Base'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update documents, URLs, and API sources for this knowledge base.'
              : 'Set up your new knowledge base by adding documents, URLs, and API sources.'}
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

          <Tabs defaultValue="documents" className="flex-1">
            <TabsList className="h-8">
              <TabsTrigger value="documents" className="text-xs gap-1.5">
                <File className="h-3.5 w-3.5" /> Documents ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="urls" className="text-xs gap-1.5">
                <Link className="h-3.5 w-3.5" /> URLs ({urls.length})
              </TabsTrigger>
              <TabsTrigger value="apis" className="text-xs gap-1.5">
                <Plug className="h-3.5 w-3.5" /> APIs ({apis.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>

            {/* ─── Documents Tab ─── */}
            <TabsContent value="documents" className="mt-4 flex flex-col gap-3">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs w-fit">
                <Upload className="h-3.5 w-3.5" /> Upload Documents
              </Button>

              {documents.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-10 text-muted-foreground">
                  <FileText className="h-8 w-8 opacity-30" />
                  <p className="text-xs">No documents added yet. Upload files to get started.</p>
                </div>
              )}
            </TabsContent>

            {/* ─── URLs Tab ─── */}
            <TabsContent value="urls" className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://help.acme.com/..."
                  className="h-8 text-xs flex-1"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                />
                <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={addUrl}>
                  <Plus className="h-3.5 w-3.5" /> Add URL
                </Button>
              </div>

              {urls.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {urls.map(url => (
                    <div key={url.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                      <Globe className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{url.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{url.url}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => deleteUrl(url.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-10 text-muted-foreground">
                  <Globe className="h-8 w-8 opacity-30" />
                  <p className="text-xs">No URLs added yet.</p>
                </div>
              )}
            </TabsContent>

            {/* ─── APIs Tab ─── */}
            <TabsContent value="apis" className="mt-4 flex flex-col gap-3">
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
                      <Label className="text-xs">Request Method</Label>
                      <Select value={apiForm.requestMethod} onValueChange={(v) => v && setApiForm(f => ({ ...f, requestMethod: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET" className="text-xs">GET</SelectItem>
                          <SelectItem value="POST" className="text-xs">POST</SelectItem>
                          <SelectItem value="PUT" className="text-xs">PUT</SelectItem>
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
                          placeholder={editingApi ? '(unchanged)' : 'Enter key...'}
                        />
                        <button type="button" onClick={() => setShowKey(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Sync Frequency</Label>
                      <Select value={apiForm.syncFrequency} onValueChange={(v) => v && setApiForm(f => ({ ...f, syncFrequency: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime" className="text-xs">Real-time</SelectItem>
                          <SelectItem value="hourly" className="text-xs">Hourly</SelectItem>
                          <SelectItem value="daily" className="text-xs">Daily</SelectItem>
                          <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="h-8 text-xs" onClick={saveApiForm}>
                      {editingApi ? 'Update API' : 'Connect API'}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => {
                      setShowApiForm(false)
                      setEditingApi(null)
                      setApiForm(emptyApiForm())
                    }}>Cancel</Button>
                  </div>
                </div>
              )}

              {apis.length > 0 && (
                <div className="flex flex-col gap-2">
                  {apis.map(api => (
                    <div key={api.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                      <Plug className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{api.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {api.requestMethod} {api.endpoint} · {api.authMethod} · {api.syncFrequency}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => editApi(api)}>
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteApi(api.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showApiForm && apis.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-10 text-muted-foreground">
                  <Plug className="h-8 w-8 opacity-30" />
                  <p className="text-xs">No API sources connected yet.</p>
                </div>
              )}
            </TabsContent>

            {/* ─── Settings Tab ─── */}
            <TabsContent value="settings" className="mt-4">
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
            {isEditing ? 'Save Changes' : 'Save Knowledge Base'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}