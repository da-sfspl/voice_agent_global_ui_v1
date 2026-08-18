'use client'

import { useState } from 'react'
import { agentTemplates, type AgentTemplate } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  FileText,
  Search,
  PhoneIncoming,
  PhoneOutgoing,
  ArrowLeftRight,
  Tag,
  Users,
  Bot,
  ChevronRight,
} from 'lucide-react'

const typeIcon: Record<AgentTemplate['type'], React.ElementType> = {
  inbound: PhoneIncoming,
  outbound: PhoneOutgoing,
  hybrid: ArrowLeftRight,
}

const typeStyle: Record<AgentTemplate['type'], string> = {
  inbound:  'text-[var(--status-active)] border-[var(--status-active)]/25 bg-[var(--status-active)]/8',
  outbound: 'text-[var(--sidebar-primary)] border-[var(--sidebar-primary)]/25 bg-[var(--sidebar-primary)]/8',
  hybrid:   'text-[var(--status-warning)] border-[var(--status-warning)]/25 bg-[var(--status-warning)]/8',
}

const categories = ['All', ...Array.from(new Set(agentTemplates.map((t) => t.category)))]

export function AgentTemplates() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<AgentTemplate | null>(null)

  const filtered = agentTemplates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || t.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Agent Templates</h1>
            <p className="text-sm text-muted-foreground">Preconfigured agent blueprints to accelerate deployment</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Submit Template
        </Button>
      </div>

      <div className="flex gap-5">
        {/* Left panel */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Search + categories */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  category === c
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((t) => {
              const TypeIcon = typeIcon[t.type]
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={cn(
                    'flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent',
                    selected?.id === t.id ? 'border-[var(--sidebar-primary)]/40 bg-[var(--sidebar-primary)]/5' : 'border-border'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background">
                      <TypeIcon className="h-4.5 w-4.5 text-muted-foreground" />
                    </div>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 capitalize shrink-0', typeStyle[t.type])}>
                      {t.type}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-snug">{t.name}</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{t.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Tag className="h-2.5 w-2.5" />
                      <span>{t.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-2.5 w-2.5" />
                      <span>{t.useCount} uses</span>
                    </div>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No templates match your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — detail */}
        {selected && (
          <div className="w-72 shrink-0 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Template Detail</span>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xs">
                Close
              </button>
            </div>
            <Separator />

            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold leading-snug">{selected.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{selected.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{selected.type}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{selected.category}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{selected.language}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">Default Model</span>
                <span className="font-medium font-mono text-[11px]">{selected.llmModel}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">Default Voice</span>
                <span className="font-medium">{selected.voice}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">Total Uses</span>
                <span className="font-medium">{selected.useCount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Tags</span>
              <div className="flex flex-wrap gap-1">
                {selected.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Button size="sm" className="w-full gap-2">
                <Bot className="h-4 w-4" />
                Create Agent from Template
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <ChevronRight className="h-4 w-4" />
                Preview Template
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
