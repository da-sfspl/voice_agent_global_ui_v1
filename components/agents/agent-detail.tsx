'use client'

import Link from 'next/link'
import { type Agent, agentVersions, knowledgeBases } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  Bot,
  Settings2,
  GitBranch,
  BarChart2,
  PhoneIncoming,
  PhoneOutgoing,
  ArrowLeftRight,
  Brain,
  AudioLines,
  Volume2,
  BookOpen,
  Thermometer,
  MessageSquare,
  Clock,
  CalendarDays,
  User,
  CheckCircle2,
  XCircle,
  Archive,
  Rocket,
} from 'lucide-react'

const typeIcon: Record<string, React.ElementType> = {
  inbound: PhoneIncoming,
  outbound: PhoneOutgoing,
  hybrid: ArrowLeftRight,
}

const statusStyle: Record<string, string> = {
  active: 'border-[var(--status-active)]/30 text-[var(--status-active)]',
  inactive: 'border-border text-muted-foreground',
  draft: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]',
  archived: 'border-border text-muted-foreground',
}

const versionStatusStyle: Record<string, string> = {
  deployed: 'text-[var(--status-active)]',
  staging: 'text-[var(--status-warning)]',
  archived: 'text-muted-foreground',
}

export function AgentDetail({ agent }: { agent: Agent }) {
  const TypeIcon = typeIcon[agent.type]
  const linkedKBs = knowledgeBases.filter((kb) => agent.knowledgeBases.includes(kb.id))

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" render={<Link href="/agents" />} nativeButton={false} className="h-8 px-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Agents
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-xl font-semibold">{agent.name}</h1>
          <Badge variant="outline" className={statusStyle[agent.status]}>{agent.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" render={<Link href={`/agents/${agent.id}/version`} />} nativeButton={false} className="gap-1.5">
            <GitBranch className="h-4 w-4" />
            v{agent.version}
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`/agents/${agent.id}/config`} />} nativeButton={false} className="gap-1.5">
            <Settings2 className="h-4 w-4" />
            Configure
          </Button>
          <Button size="sm" render={<Link href={`/agents/${agent.id}/publish`} />} nativeButton={false} className="gap-1.5">
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Hero Summary */}
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1 text-xs">
                  <TypeIcon className="h-3 w-3" />
                  {agent.type}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">v{agent.version}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{agent.language}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 w-[380px]">
          <MetricCard label="Total Calls" value={agent.totalCalls.toLocaleString()} icon={MessageSquare} />
          <MetricCard label="Avg Duration" value={agent.avgDuration} icon={Clock} />
          <MetricCard
            label="Success Rate"
            value={`${agent.successRate}%`}
            icon={CheckCircle2}
            extra={<Progress value={agent.successRate} className="h-1 mt-2" />}
          />
          <MetricCard label="Last Deployed" value={agent.lastDeployed !== '—' ? new Date(agent.lastDeployed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} icon={CalendarDays} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="border-b border-border w-full justify-start rounded-none bg-transparent px-0 h-auto gap-0">
          {['overview', 'versions', 'knowledge-base', 'activity'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none border-b-2 border-transparent pb-2.5 pt-0 px-4 text-sm capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
            >
              {tab.replace('-', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Provider Config */}
            <div className="col-span-2 flex flex-col gap-4">
              <Section title="Provider Configuration">
                <div className="grid grid-cols-2 gap-4">
                  <ProviderRow icon={Brain} label="LLM Provider" provider={agent.llmProvider} detail={agent.llmModel} />
                  <ProviderRow icon={AudioLines} label="STT Provider" provider={agent.sttProvider} />
                  <ProviderRow icon={Volume2} label="TTS Provider" provider={agent.ttsProvider} detail={`Voice: ${agent.voice}`} />
                </div>
              </Section>
              <Section title="Model Parameters">
                <div className="grid grid-cols-3 gap-4">
                  <ParamRow label="Temperature" value={String(agent.temperature)} />
                  <ParamRow label="Context Window" value={`${agent.contextWindow.toLocaleString()} tokens`} />
                  <ParamRow label="Memory" value={agent.memoryEnabled ? 'Enabled' : 'Disabled'} />
                </div>
              </Section>
            </div>
            {/* Meta */}
            <div className="flex flex-col gap-4">
              <Section title="Agent Metadata">
                <div className="flex flex-col gap-3">
                  <MetaRow label="Agent ID" value={agent.id} mono />
                  <MetaRow label="Created By" value={agent.createdBy} icon={User} />
                  <MetaRow label="Created" value={new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                  <MetaRow label="Current Version" value={agent.version} mono />
                </div>
              </Section>
              <Section title="Linked Knowledge Bases">
                {linkedKBs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {linkedKBs.map((kb) => (
                      <Link key={kb.id} href="/agents/knowledge" className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent transition-colors">
                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-xs">{kb.name}</p>
                          <p className="text-[11px] text-muted-foreground">{kb.documents} docs · {(kb.tokens / 1000).toFixed(0)}k tokens</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No knowledge bases attached.</p>
                )}
              </Section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {agentVersions.map((v, i) => (
              <div key={v.version} className="flex items-start gap-4 px-5 py-4">
                <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  v.status === 'deployed' ? 'bg-[var(--status-active)]/20 text-[var(--status-active)]' :
                  v.status === 'staging' ? 'bg-[var(--status-warning)]/20 text-[var(--status-warning)]' :
                  'bg-accent text-muted-foreground'
                )}>
                  {v.status === 'deployed' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                   v.status === 'archived' ? <Archive className="h-3.5 w-3.5" /> :
                   v.version.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold font-mono">v{v.version}</span>
                    <span className={cn('text-xs font-medium capitalize', versionStatusStyle[v.status])}>{v.status}</span>
                    {i === 0 && <Badge variant="outline" className="text-[10px]">Current</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.notes}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(v.deployedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>by {v.deployedBy}</span>
                    <span>{v.calls.toLocaleString()} calls</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7" disabled={v.status === 'deployed'}>
                  {v.status === 'archived' ? 'Restore' : 'Rollback'}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="knowledge-base" className="mt-4">
          <div className="flex flex-col gap-3">
            {linkedKBs.map((kb) => (
              <div key={kb.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{kb.name}</p>
                      <p className="text-xs text-muted-foreground">{kb.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{kb.documents} documents</span>
                    <span>{kb.urls} URLs</span>
                    <span>{(kb.tokens / 1000).toFixed(0)}k tokens</span>
                    <Badge variant="outline" className="border-(--status-active)/30 text-(--status-active)]">{kb.status}</Badge>
                    <Button size="sm" variant="outline" className="text-xs h-7 text-destructive hover:text-destructive">Detach</Button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="self-start gap-1.5">
              <BookOpen className="h-4 w-4" /> Attach Knowledge Base
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {[
              { action: 'Agent deployed', user: 'Sara Miller', time: '2026-08-01T10:00:00Z', icon: Rocket, color: 'text-[var(--status-active)]' },
              { action: 'System prompt updated', user: 'Sara Miller', time: '2026-08-01T09:45:00Z', icon: MessageSquare, color: 'text-primary' },
              { action: 'Knowledge base KB-002 attached', user: 'Priya Nair', time: '2026-07-25T14:30:00Z', icon: BookOpen, color: 'text-primary' },
              { action: 'Version 3.1.0 archived', user: 'Sara Miller', time: '2026-08-01T10:00:00Z', icon: Archive, color: 'text-muted-foreground' },
              { action: 'LLM model changed to gpt-4o', user: 'Sara Miller', time: '2026-07-10T08:30:00Z', icon: Brain, color: 'text-violet-400' },
              { action: 'Agent created', user: 'Sara Miller', time: '2024-03-10T09:00:00Z', icon: Bot, color: 'text-primary' },
            ].map((ev, i) => {
              const Icon = ev.icon
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', ev.color)} />
                  <div className="flex-1">
                    <p className="text-sm">{ev.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">by {ev.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(ev.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, extra }: {
  label: string; value: string; icon: React.ElementType; extra?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
      {extra}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      {children}
    </div>
  )
}

function ProviderRow({ icon: Icon, label, provider, detail }: {
  icon: React.ElementType; label: string; provider: string; detail?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{provider}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
    </div>
  )
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}

function MetaRow({ label, value, icon: Icon, mono }: {
  label: string; value: string; icon?: React.ElementType; mono?: boolean
}) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className={cn('font-medium text-right', mono && 'font-mono text-xs')}>{value}</span>
      </div>
    </div>
  )
}
