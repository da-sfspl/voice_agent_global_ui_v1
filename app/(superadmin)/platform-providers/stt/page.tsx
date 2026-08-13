'use client'

import { useState } from 'react'
import { Plus, Settings2, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type STTProvider = {
  id: string
  name: string
  models: string
  langs: string
  orgs: number
  usage: string
  cost: number
  latency: number
  error: number
  status: string
  baseUrl?: string
  timeout?: number
  rateLimit?: number
}

const sttProviders: STTProvider[] = [
  { id: 'deepgram', name: 'Deepgram', models: 'Nova-3, Nova-2', langs: 'en-US, en-GB, es, fr', orgs: 5, usage: '391k min', cost: 28000, latency: 320, error: 0.8, status: 'active', baseUrl: 'https://api.deepgram.com/v1', timeout: 10000, rateLimit: 500 },
  { id: 'sarvam', name: 'Sarvam AI', models: 'Sarvam-1, Sarvam-2', langs: 'en-IN, hi-IN, ta-IN, te-IN', orgs: 2, usage: '125k min', cost: 8500, latency: 450, error: 1.2, status: 'warning', baseUrl: 'https://api.sarvam.ai/v1', timeout: 15000, rateLimit: 300 },
  { id: 'assembly', name: 'AssemblyAI', models: 'Universal-2', langs: 'en-US, en-GB', orgs: 1, usage: '45k min', cost: 3200, latency: 380, error: 0.4, status: 'active', baseUrl: 'https://api.assemblyai.com/v2', timeout: 10000, rateLimit: 400 },
  { id: 'azure', name: 'Azure Speech', models: 'Standard, Neural', langs: '100+ languages', orgs: 3, usage: '180k min', cost: 12400, latency: 410, error: 0.5, status: 'active', baseUrl: 'https://eastus.api.cognitive.microsoft.com', timeout: 10000, rateLimit: 600 },
]

export default function STTProvidersPage() {
  const [providers, setProviders] = useState(sttProviders)
  const [showKey, setShowKey] = useState(false)
  const [editingProvider, setEditingProvider] = useState<STTProvider | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const toggleStatus = (id: string) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p))
  }

  const openEdit = (provider: STTProvider) => {
    setEditingProvider(provider)
    setShowEditDialog(true)
  }

  const handleSaveEdit = () => {
    if (!editingProvider) return
    setProviders(prev => prev.map(p => p.id === editingProvider.id ? editingProvider : p))
    setShowEditDialog(false)
    setEditingProvider(null)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">STT Providers</h1>
          <p className="text-sm text-muted-foreground">Manage Speech-to-Text providers and language support across the platform.</p>
        </div>
        <Dialog>
          <DialogTrigger
            className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors gap-2"
          >
            <Plus className="h-4 w-4" />
            Add STT Provider
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure STT Provider</DialogTitle>
              <DialogDescription>Add a new Speech-to-Text provider to the platform registry.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Provider Name</Label>
                  <Input placeholder="e.g. Deepgram" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Base URL</Label>
                  <Input placeholder="https://api.deepgram.com/v1" className="font-mono text-xs" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input type={showKey ? 'text' : 'password'} placeholder="api-key-..." className="font-mono text-xs flex-1" />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="inline-flex items-center justify-center rounded-md border border-border h-9 w-9 hover:bg-accent transition-colors"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Available Models</Label>
                <Textarea placeholder="e.g. Nova-3, Nova-2, Enhanced" rows={2} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Supported Languages</Label>
                <Textarea placeholder="e.g. en-US, en-GB, es, fr, de" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Timeout (ms)</Label>
                  <Input type="number" defaultValue={10000} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Rate Limit (req/min)</Label>
                  <Input type="number" defaultValue={500} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save Provider</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Models</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead className="text-right">Orgs</TableHead>
                <TableHead className="text-right">Usage (30d)</TableHead>
                <TableHead className="text-right">Cost (INR)</TableHead>
                <TableHead className="text-right">Latency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={p.status === 'active' ? 'border-[var(--status-active)]/30 text-[var(--status-active)]' : p.status === 'warning' ? 'border-[var(--status-warning)]/30 text-[var(--status-warning)]' : 'text-muted-foreground'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{p.models}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.langs}</TableCell>
                  <TableCell className="text-right">{p.orgs}</TableCell>
                  <TableCell className="text-right">{p.usage}</TableCell>
                  <TableCell className="text-right tabular-nums">₹{p.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.latency}ms</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Settings2 className="h-4 w-4" />
                      </button>
                      <Switch checked={p.status === 'active'} onCheckedChange={() => toggleStatus(p.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit STT Provider</DialogTitle>
            <DialogDescription>Update configuration for {editingProvider?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Provider Name</Label>
                <Input value={editingProvider?.name || ''} readOnly className="bg-muted" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Base URL</Label>
                <Input
                  value={editingProvider?.baseUrl || ''}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, baseUrl: e.target.value } : null)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input type="password" value="****************************" readOnly className="font-mono text-xs flex-1 bg-muted" />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="inline-flex items-center justify-center rounded-md border border-border h-9 w-9 hover:bg-accent transition-colors"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">API keys cannot be viewed once saved. Leave blank to keep existing key.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Available Models</Label>
              <Textarea
                value={editingProvider?.models || ''}
                onChange={(e) => setEditingProvider(prev => prev ? { ...prev, models: e.target.value } : null)}
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Supported Languages</Label>
              <Textarea
                value={editingProvider?.langs || ''}
                onChange={(e) => setEditingProvider(prev => prev ? { ...prev, langs: e.target.value } : null)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Timeout (ms)</Label>
                <Input
                  type="number"
                  value={editingProvider?.timeout || 10000}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, timeout: parseInt(e.target.value) || 10000 } : null)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Rate Limit (req/min)</Label>
                <Input
                  type="number"
                  value={editingProvider?.rateLimit || 500}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, rateLimit: parseInt(e.target.value) || 500 } : null)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}