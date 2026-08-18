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

type LLMProvider = {
  id: string
  name: string
  status: string
  models: string
  orgs: number
  reqs: number
  cost: number
  latency: number
  error: number
  baseUrl?: string
  defaultModel?: string
  timeout?: number
  rateLimit?: number
}

const initialProviders: LLMProvider[] = [
  { id: 'openai', name: 'OpenAI', status: 'active', models: 'gpt-4o, gpt-4o-mini, gpt-3.5', orgs: 5, reqs: 1250000, cost: 45000, latency: 850, error: 0.1, baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o', timeout: 30000, rateLimit: 1000 },
  { id: 'anthropic', name: 'Anthropic', status: 'active', models: 'claude-3.5-sonnet, claude-3-haiku', orgs: 3, reqs: 420000, cost: 18500, latency: 920, error: 0.05, baseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-3.5-sonnet', timeout: 30000, rateLimit: 800 },
  { id: 'google', name: 'Google Vertex', status: 'active', models: 'gemini-1.5-pro, gemini-1.5-flash', orgs: 2, reqs: 180000, cost: 8200, latency: 780, error: 0.2, baseUrl: 'https://vertexai.googleapis.com/v1', defaultModel: 'gemini-1.5-pro', timeout: 30000, rateLimit: 600 },
  { id: 'mistral', name: 'Mistral AI', status: 'inactive', models: 'mistral-large, mistral-medium', orgs: 0, reqs: 0, cost: 0, latency: 0, error: 0, baseUrl: 'https://api.mistral.ai/v1', defaultModel: 'mistral-large', timeout: 30000, rateLimit: 500 },
]

export default function LLMProvidersPage() {
  const [providers, setProviders] = useState(initialProviders)
  const [showKey, setShowKey] = useState(false)
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const toggleStatus = (id: string) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p))
  }

  const openEdit = (provider: LLMProvider) => {
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
          <h1 className="text-2xl font-semibold tracking-tight">LLM Providers</h1>
          <p className="text-sm text-muted-foreground">Manage Large Language Model providers available across the platform.</p>
        </div>
        <Dialog>
          <DialogTrigger
            className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors gap-2"
          >
            <Plus className="h-4 w-4" />
            Add LLM Provider
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure LLM Provider</DialogTitle>
              <DialogDescription>Add a new LLM provider to the platform registry.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Provider Name</Label>
                  <Input placeholder="e.g. OpenAI" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Base URL</Label>
                  <Input placeholder="https://api.openai.com/v1" className="font-mono text-xs" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input type={showKey ? 'text' : 'password'} placeholder="sk-..." className="font-mono text-xs flex-1" />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="inline-flex items-center justify-center rounded-md border border-border h-9 w-9 hover:bg-accent transition-colors"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Default Model</Label>
                  <Input placeholder="gpt-4o" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Timeout (ms)</Label>
                  <Input type="number" defaultValue={30000} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Rate Limit (req/min)</Label>
                <Input type="number" defaultValue={1000} />
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
                <TableHead className="text-right">Orgs Using</TableHead>
                <TableHead className="text-right">Requests (30d)</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
                <TableHead className="text-right">Latency</TableHead>
                <TableHead className="text-right">Error Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={p.status === 'active' ? 'border-[var(--status-active)]/30 text-[var(--status-active)]' : 'text-muted-foreground'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{p.models}</TableCell>
                  <TableCell className="text-right">{p.orgs}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.reqs.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">₹{p.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.latency}ms</TableCell>
                  <TableCell className="text-right tabular-nums">{p.error}%</TableCell>
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
            <DialogTitle>Edit LLM Provider</DialogTitle>
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
                <Input type={showKey ? 'text' : 'password'} value="sk-****************************" readOnly className="font-mono text-xs flex-1 bg-muted" />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Default Model</Label>
                <Input
                  value={editingProvider?.defaultModel || ''}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, defaultModel: e.target.value } : null)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Timeout (ms)</Label>
                <Input
                  type="number"
                  value={editingProvider?.timeout || 30000}
                  onChange={(e) => setEditingProvider(prev => prev ? { ...prev, timeout: parseInt(e.target.value) || 30000 } : null)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Rate Limit (req/min)</Label>
              <Input
                type="number"
                value={editingProvider?.rateLimit || 1000}
                onChange={(e) => setEditingProvider(prev => prev ? { ...prev, rateLimit: parseInt(e.target.value) || 1000 } : null)}
              />
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