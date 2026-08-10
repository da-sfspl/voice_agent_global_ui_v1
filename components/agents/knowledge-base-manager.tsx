'use client'

import { useState } from 'react'
import { knowledgeBases, agents, type KnowledgeBase } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Plus,
  FileText,
  Link,
  Upload,
  Search,
  Database,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  Bot,
  Trash2,
  RefreshCw,
  ExternalLink,
  File,
  Globe,
} from 'lucide-react'

const statusStyles: Record<KnowledgeBase['status'], { label: string; icon: React.ElementType; cls: string }> = {
  ready:      { label: 'Ready',      icon: CheckCircle2, cls: 'text-[var(--status-active)]' },
  processing: { label: 'Processing', icon: Loader2,      cls: 'text-[var(--status-warning)] animate-spin' },
  error:      { label: 'Error',      icon: XCircle,      cls: 'text-destructive' },
}

const badgeStyles: Record<KnowledgeBase['status'], string> = {
  ready:      'text-[var(--status-active)] border-[var(--status-active)]/25 bg-[var(--status-active)]/8',
  processing: 'text-[var(--status-warning)] border-[var(--status-warning)]/25 bg-[var(--status-warning)]/8',
  error:      'text-destructive border-destructive/25 bg-destructive/8',
}

const mockDocuments = [
  { name: 'Product FAQ v4.2.pdf', size: '2.4 MB', pages: 48,  status: 'ready',      added: '2026-08-05' },
  { name: 'Return Policy 2026.pdf', size: '320 KB', pages: 8, status: 'ready',      added: '2026-07-20' },
  { name: 'Support Runbook Q3.docx', size: '1.1 MB', pages: 22, status: 'ready',   added: '2026-07-15' },
  { name: 'Shipping Partners Overview.pdf', size: '880 KB', pages: 14, status: 'ready', added: '2026-06-30' },
  { name: 'Incident Response Guide.pdf', size: '560 KB', pages: 11, status: 'processing', added: '2026-08-07' },
]

const mockUrls = [
  { url: 'https://help.acme.com/categories/orders', lastCrawled: '2026-08-05T10:00:00Z', pages: 12, status: 'ready' },
  { url: 'https://help.acme.com/categories/returns', lastCrawled: '2026-08-05T10:00:00Z', pages: 7, status: 'ready' },
  { url: 'https://acme.com/shipping', lastCrawled: '2026-07-22T08:00:00Z', pages: 3, status: 'ready' },
  { url: 'https://acme.com/blog/product-updates', lastCrawled: '2026-08-07T08:00:00Z', pages: 6, status: 'processing' },
]

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function KnowledgeBaseManager() {
  const [selected, setSelected] = useState<KnowledgeBase>(knowledgeBases[0])
  const [newUrl, setNewUrl] = useState('')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Knowledge Base</h1>
            <p className="text-sm text-muted-foreground">Manage document and URL ingestion for agent retrieval</p>
          </div>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Knowledge Base
        </Button>
      </div>

      <div className="flex gap-5">
        {/* Left: KB list */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
            Knowledge Bases ({knowledgeBases.length})
          </span>
          {knowledgeBases.map((kb) => {
            const s = statusStyles[kb.status]
            const StatusIcon = s.icon
            return (
              <button
                key={kb.id}
                onClick={() => setSelected(kb)}
                className={cn(
                  'flex flex-col gap-2 rounded-md border px-3 py-3 text-left transition-colors',
                  selected?.id === kb.id
                    ? 'border-[var(--sidebar-primary)]/40 bg-[var(--sidebar-primary)]/7'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-snug">{kb.name}</span>
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 shrink-0', badgeStyles[kb.status])}>
                    {s.label}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{kb.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-2.5 w-2.5" />
                    {kb.documents} docs
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-2.5 w-2.5" />
                    {kb.urls} URLs
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="h-2.5 w-2.5" />
                    {formatTokens(kb.tokens)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right: KB detail */}
        {selected && (
          <div className="flex-1 min-w-0 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            {/* KB header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">{selected.name}</h2>
                  {(() => {
                    const s = statusStyles[selected.status]
                    const Icon = s.icon
                    return <Icon className={cn('h-4 w-4', s.cls)} />
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">{selected.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Re-index
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Documents', value: String(selected.documents), icon: FileText },
                { label: 'URLs',      value: String(selected.urls),      icon: Globe },
                { label: 'Tokens',    value: formatTokens(selected.tokens), icon: Database },
                { label: 'Agents',    value: String(selected.usedByAgents.length), icon: Bot },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1 rounded-md border border-border bg-muted/40 px-3 py-2.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <s.icon className="h-3 w-3" />
                    {s.label}
                  </span>
                  <span className="text-lg font-semibold tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Agent usage */}
            {selected.usedByAgents.length > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">Used by agents:</span>
                <div className="flex flex-wrap gap-1">
                  {selected.usedByAgents.map((aId) => {
                    const agent = agents.find((a) => a.id === aId)
                    return agent ? (
                      <Badge key={aId} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {agent.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Tabs: Documents / URLs / Settings */}
            <Tabs defaultValue="documents">
              <TabsList className="h-8">
                <TabsTrigger value="documents" className="text-xs gap-1.5">
                  <File className="h-3.5 w-3.5" />
                  Documents ({selected.documents})
                </TabsTrigger>
                <TabsTrigger value="urls" className="text-xs gap-1.5">
                  <Link className="h-3.5 w-3.5" />
                  URLs ({selected.urls})
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
              </TabsList>

              {/* Documents tab */}
              <TabsContent value="documents" className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Documents
                  </Button>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search documents..." className="pl-8 h-8 text-xs" />
                  </div>
                </div>

                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">File Name</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Size</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Pages</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Status</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Added</th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {mockDocuments.map((doc, i) => {
                        const StatusIcon = doc.status === 'processing' ? Loader2 : CheckCircle2
                        return (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-xs font-medium truncate max-w-[220px]">{doc.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">{doc.size}</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">{doc.pages}</td>
                            <td className="px-3 py-2.5">
                              <span className={cn('flex items-center gap-1 text-xs', doc.status === 'processing' ? 'text-[var(--status-warning)]' : 'text-[var(--status-active)]')}>
                                <StatusIcon className={cn('h-3 w-3', doc.status === 'processing' && 'animate-spin')} />
                                <span className="capitalize">{doc.status}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{doc.added}</td>
                            <td className="px-3 py-2.5">
                              <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* URLs tab */}
              <TabsContent value="urls" className="mt-4 flex flex-col gap-3">
                {/* Add URL */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="https://help.acme.com/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0">
                    <Plus className="h-3.5 w-3.5" />
                    Add URL
                  </Button>
                </div>

                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">URL</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Pages</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Last Crawled</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Status</th>
                        <th className="px-3 py-2 w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {mockUrls.map((u, i) => {
                        const StatusIcon = u.status === 'processing' ? Loader2 : CheckCircle2
                        return (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-xs font-mono truncate max-w-[260px]">{u.url}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">{u.pages}</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(u.lastCrawled).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={cn('flex items-center gap-1 text-xs', u.status === 'processing' ? 'text-[var(--status-warning)]' : 'text-[var(--status-active)]')}>
                                <StatusIcon className={cn('h-3 w-3', u.status === 'processing' && 'animate-spin')} />
                                <span className="capitalize">{u.status}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1">
                                <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                                <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Settings tab */}
              <TabsContent value="settings" className="mt-4">
                <div className="grid grid-cols-2 gap-4 max-w-lg">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Chunk Size (tokens)</Label>
                    <Input defaultValue="512" className="h-8 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Chunk Overlap</Label>
                    <Input defaultValue="64" className="h-8 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Top-K Results</Label>
                    <Input defaultValue="5" className="h-8 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Similarity Threshold</Label>
                    <Input defaultValue="0.72" className="h-8 text-sm" />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Label className="text-xs">Embedding Model</Label>
                    <Input defaultValue="text-embedding-3-large" className="h-8 text-sm font-mono" />
                  </div>
                  <div className="col-span-2">
                    <Button size="sm" className="h-8 gap-2 text-xs">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
