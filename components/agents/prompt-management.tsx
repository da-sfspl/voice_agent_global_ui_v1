'use client'

import { useState } from 'react'
import { prompts, agents, type Prompt } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  MessageSquareText,
  Plus,
  Search,
  Clock,
  User,
  Hash,
  ChevronRight,
  Save,
  Copy,
  RotateCcw,
  Tag,
} from 'lucide-react'

const typeStyles: Record<Prompt['type'], string> = {
  system:     'bg-[var(--sidebar-primary)]/15 text-[var(--sidebar-primary)] border-[var(--sidebar-primary)]/25',
  welcome:    'bg-[var(--status-active)]/10 text-[var(--status-active)] border-[var(--status-active)]/20',
  fallback:   'bg-[var(--status-warning)]/10 text-[var(--status-warning)] border-[var(--status-warning)]/20',
  escalation: 'bg-destructive/10 text-destructive border-destructive/20',
  closing:    'bg-muted text-muted-foreground border-border',
}

export function PromptManagement() {
  const [search, setSearch] = useState('')
  const [filterAgent, setFilterAgent] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selected, setSelected] = useState<Prompt>(prompts[0])
  const [editContent, setEditContent] = useState(prompts[0].content)
  const [isDirty, setIsDirty] = useState(false)

  const filtered = prompts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.agentName.toLowerCase().includes(search.toLowerCase())
    const matchAgent = filterAgent === 'all' || p.agentId === filterAgent
    const matchType  = filterType  === 'all' || p.type === filterType
    return matchSearch && matchAgent && matchType
  })

  function selectPrompt(p: Prompt) {
    setSelected(p)
    setEditContent(p.content)
    setIsDirty(false)
  }

  function handleContentChange(val: string) {
    setEditContent(val)
    setIsDirty(val !== selected.content)
  }

  const wordCount = editContent.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquareText className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Prompt Management</h1>
            <p className="text-sm text-muted-foreground">Author and version system prompts across all agents</p>
          </div>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>

      <div className="flex gap-5 min-h-0">
        {/* Left panel — prompt list */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          {/* Filters */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterAgent} onValueChange={(v) => setFilterAgent(v ?? 'all')}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(v) => setFilterType(v ?? 'all')}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(['system','welcome','fallback','escalation','closing'] as const).map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt list */}
          <div className="flex flex-col gap-1">
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No prompts match your filters.</p>
            )}
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPrompt(p)}
                className={cn(
                  'flex flex-col gap-1 rounded-md border px-3 py-2.5 text-left transition-colors',
                  selected?.id === p.id
                    ? 'border-[var(--sidebar-primary)]/40 bg-[var(--sidebar-primary)]/8'
                    : 'border-transparent hover:border-border hover:bg-accent'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 capitalize', typeStyles[p.type])}>
                    {p.type}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground truncate">{p.agentName}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Hash className="h-2.5 w-2.5" />
                  <span>{p.tokens} tokens</span>
                  <span className="mx-1">·</span>
                  <span>v{p.version}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — editor */}
        {selected && (
          <div className="flex-1 min-w-0 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            {/* Editor header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">{selected.name}</h2>
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 capitalize', typeStyles[selected.type])}>
                    {selected.type}
                  </Badge>
                  {isDirty && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-[var(--status-warning)] border-[var(--status-warning)]/30">
                      Unsaved
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {selected.agentName}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selected.modifiedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(selected.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    v{selected.version}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { setEditContent(selected.content); setIsDirty(false) }}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Revert
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-xs" disabled={!isDirty}>
                  <Save className="h-3.5 w-3.5" />
                  Save Version
                </Button>
              </div>
            </div>

            <Separator />

            {/* Prompt fields */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label className="text-xs">Prompt Name</Label>
                  <Input defaultValue={selected.name} className="h-8 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select defaultValue={selected.type}>
                    <SelectTrigger className="h-8 text-sm w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['system','welcome','fallback','escalation','closing'] as const).map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Agent</Label>
                  <Select defaultValue={selected.agentId}>
                    <SelectTrigger className="h-8 text-sm w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Prompt Content</Label>
                  <span className="text-[11px] text-muted-foreground">
                    ~{selected.tokens} tokens · {wordCount} words
                  </span>
                </div>
                <Textarea
                  value={editContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="flex-1 resize-none font-mono text-sm min-h-[340px] leading-relaxed"
                  placeholder="Enter the prompt content..."
                />
              </div>

              {/* Variables hint */}
              <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Variables: </span>
                  Use <code className="font-mono bg-muted px-1 rounded">{'{{customer_name}}'}</code>,{' '}
                  <code className="font-mono bg-muted px-1 rounded">{'{{account_id}}'}</code>,{' '}
                  <code className="font-mono bg-muted px-1 rounded">{'{{current_date}}'}</code> for dynamic injection at runtime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
