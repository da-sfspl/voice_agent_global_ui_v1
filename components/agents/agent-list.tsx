'use client'

import { useState } from 'react'
import Link from 'next/link'
import { agents, type Agent, type AgentStatus } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bot,
  Plus,
  Search,
  MoreHorizontal,
  PhoneIncoming,
  PhoneOutgoing,
  ArrowLeftRight,
  Settings2,
  Copy,
  Trash2,
  BarChart2,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusStyle: Record<AgentStatus, string> = {
  active: 'border-[var(--status-active)]/30 text-[var(--status-active)]',
  inactive: 'border-border text-muted-foreground',
  draft: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]',
  archived: 'border-border text-muted-foreground',
}

const typeIcon: Record<string, React.ElementType> = {
  inbound: PhoneIncoming,
  outbound: PhoneOutgoing,
  hybrid: ArrowLeftRight,
}

const typeStyle: Record<string, string> = {
  inbound: 'text-blue-400',
  outbound: 'text-violet-400',
  hybrid: 'text-teal-400',
}

export function AgentList() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = agents.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.includes(search.toLowerCase()))
    const matchFilter = filter === 'all' || a.status === filter || a.type === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">AI Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage inbound, outbound, and hybrid voice AI agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" render={<Link href="/agents/templates" />}nativeButton={false}>
            Browse Templates
          </Button>
          <Button size="sm" render={<Link href="/agents/new" />}nativeButton={false} className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Agent
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: agents.length },
          { label: 'Active', value: agents.filter((a) => a.status === 'active').length },
          { label: 'Draft', value: agents.filter((a) => a.status === 'draft').length },
          { label: 'Total Calls (30d)', value: agents.reduce((s, a) => s + a.totalCalls, 0).toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {['all', 'active', 'draft', 'inactive', 'inbound', 'outbound', 'hybrid'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card py-16">
            <Bot className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No agents match your criteria.</p>
            <Button size="sm" variant="outline" render={<Link href="/agents/new" />}nativeButton={false}>
              Create Agent
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  const TypeIcon = typeIcon[agent.type]

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/agents/${agent.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
              {agent.name}
            </Link>
            <Badge variant="outline" className={statusStyle[agent.status]}>{agent.status}</Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <TypeIcon className={cn('h-3 w-3', typeStyle[agent.type])} />
              {agent.type}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">v{agent.version}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{agent.description}</p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {agent.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-8 shrink-0">
          <Stat label="Calls" value={agent.totalCalls > 0 ? agent.totalCalls.toLocaleString() : '—'} />
          <Stat label="Avg Duration" value={agent.avgDuration} />
          <div className="flex flex-col gap-1 w-24">
            <div className="flex justify-between">
              <span className="text-[11px] text-muted-foreground">Success</span>
              <span className="text-[11px] font-medium tabular-nums">{agent.successRate > 0 ? `${agent.successRate}%` : '—'}</span>
            </div>
            {agent.successRate > 0 && (
              <Progress value={agent.successRate} className="h-1" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">LLM</span>
            <span className="text-xs font-medium">{agent.llmModel}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="ghost" render={<Link href={`/agents/${agent.id}/config`} />} nativeButton={false} className="h-8 px-2.5">
            <Settings2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2" render={<Link href={`/agents/${agent.id}`} />}>
                <ExternalLink className="h-3.5 w-3.5" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Settings2 className="h-3.5 w-3.5" /> Configure</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><BarChart2 className="h-3.5 w-3.5" /> Analytics</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Copy className="h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              {agent.status === 'active' ? (
                <DropdownMenuItem className="gap-2"><Pause className="h-3.5 w-3.5" /> Deactivate</DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="gap-2"><Play className="h-3.5 w-3.5" /> Activate</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  )
}
