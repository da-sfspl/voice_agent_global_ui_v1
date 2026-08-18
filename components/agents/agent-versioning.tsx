'use client'

import Link from 'next/link'
import { type Agent, agentVersions } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  GitBranch,
  CheckCircle2,
  Archive,
  RotateCcw,
  Plus,
  Clock,
  User,
  PhoneCall,
  Diff,
} from 'lucide-react'

const statusStyle: Record<string, { border: string; text: string; bg: string }> = {
  deployed: { border: 'border-[var(--status-active)]/30', text: 'text-[var(--status-active)]', bg: 'bg-[var(--status-active)]/10' },
  staging: { border: 'border-[var(--status-warning)]/30', text: 'text-[var(--status-warning)]', bg: 'bg-[var(--status-warning)]/10' },
  archived: { border: 'border-border', text: 'text-muted-foreground', bg: 'bg-accent' },
}

export function AgentVersioning({ agent }: { agent: Agent }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" render={<Link href={`/agents/${agent.id}`} />} className="h-8 px-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {agent.name}
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-xl font-semibold">Version History</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Diff className="h-4 w-4" />
            Compare Versions
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create Version
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Version Timeline */}
        <div className="flex flex-col gap-0">
          {agentVersions.map((v, i) => {
            const style = statusStyle[v.status]
            const isLast = i === agentVersions.length - 1
            return (
              <div key={v.version} className="flex items-start gap-4">
                {/* Timeline spine */}
                <div className="flex flex-col items-center shrink-0 w-8">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-full border', style.bg, style.border)}>
                    {v.status === 'deployed' ? (
                      <CheckCircle2 className={cn('h-4 w-4', style.text)} />
                    ) : v.status === 'archived' ? (
                      <Archive className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <GitBranch className={cn('h-4 w-4', style.text)} />
                    )}
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-0 min-h-[2rem]" />}
                </div>

                {/* Version Card */}
                <div className={cn('flex-1 rounded-lg border bg-card mb-4', i === 0 ? 'border-primary/30' : 'border-border')}>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-mono">v{v.version}</span>
                        <Badge
                          variant="outline"
                          className={cn('capitalize text-xs', style.border, style.text)}
                        >
                          {v.status}
                        </Badge>
                        {i === 0 && <Badge variant="outline" className="text-[10px]">Current</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {v.status !== 'deployed' && (
                          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                            <RotateCcw className="h-3.5 w-3.5" />
                            Rollback
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" render={<Link href={`/agents/${agent.id}/config`} />}>
                          View Config
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{v.notes}</p>

                    <div className="flex items-center gap-5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(v.deployedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {v.deployedBy}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PhoneCall className="h-3.5 w-3.5" />
                        {v.calls.toLocaleString()} calls served
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Current Deployment</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <Row label="Version" value={`v${agent.version}`} mono />
              <Row label="Environment" value="Production" />
              <Row label="LLM" value={`${agent.llmModel}`} />
              <Row label="Total Calls" value={agent.totalCalls.toLocaleString()} />
              <Row label="Success Rate" value={`${agent.successRate}%`} />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Versioning Policy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each published deployment creates a new immutable version snapshot. Previous versions are retained for 180 days and can be rolled back instantly. Archived versions older than 180 days are deleted automatically.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Version Stats</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <Row label="Total Versions" value={String(agentVersions.length)} />
              <Row label="Deployed" value={String(agentVersions.filter((v) => v.status === 'deployed').length)} />
              <Row label="Archived" value={String(agentVersions.filter((v) => v.status === 'archived').length)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}
