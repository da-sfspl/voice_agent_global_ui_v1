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
import { ChevronLeft, CheckCircle2, FileText, Settings2, Eye } from 'lucide-react'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'

const typeStyles: Record<Prompt['type'], string> = {
  system:     'bg-[var(--sidebar-primary)]/15 text-[var(--sidebar-primary)] border-[var(--sidebar-primary)]/25',
  welcome:    'bg-[var(--status-active)]/10 text-[var(--status-active)] border-[var(--status-active)]/20',
  fallback:   'bg-[var(--status-warning)]/10 text-[var(--status-warning)] border-[var(--status-warning)]/20',
  escalation: 'bg-destructive/10 text-destructive border-destructive/20',
  closing:    'bg-muted text-muted-foreground border-border',
}

const promptTypes = ['system', 'welcome', 'fallback', 'escalation', 'closing'] as const

const wizardSteps = [
  { id: 1, label: 'Details',  icon: Settings2 },
  { id: 2, label: 'Content',  icon: FileText },
  { id: 3, label: 'Review',   icon: Eye },
]

export function PromptManagement() {
  const [search, setSearch] = useState('')
  const [filterAgent, setFilterAgent] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selected, setSelected] = useState<Prompt>(prompts[0])
  const [editContent, setEditContent] = useState(prompts[0].content)
  const [isDirty, setIsDirty] = useState(false)
  const [promptList, setPromptList] = useState<Prompt[]>(prompts)

  // 👇 NEW: Wizard state
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardForm, setWizardForm] = useState({
    name: '',
    type: 'system' as Prompt['type'],
    agentId: '',
    content: '',
  })


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

   function openWizard() {
    setWizardForm({ name: '', type: 'system', agentId: '', content: '' })
    setWizardStep(1)
    setShowWizard(true)
  }

  function closeWizard() {
    setShowWizard(false)
    setWizardStep(1)
    setWizardForm({ name: '', type: 'system', agentId: '', content: '' })
  }

  function wizardNext() {
    if (wizardStep < 3) setWizardStep(s => s + 1)
  }

  function wizardBack() {
    if (wizardStep > 1) setWizardStep(s => s - 1)
  }

  function canProceed(): boolean {
    if (wizardStep === 1) return wizardForm.name.trim() !== '' && wizardForm.agentId !== ''
    if (wizardStep === 2) return wizardForm.content.trim() !== ''
    return true
  }

  function handleWizardSave() {
    const selectedAgent = agents.find(a => a.id === wizardForm.agentId)
    const tokenEstimate = Math.round(wizardForm.content.split(/\s+/).filter(Boolean).length * 1.3)

    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      name: wizardForm.name,
      type: wizardForm.type,
      agentId: wizardForm.agentId,
      agentName: selectedAgent?.name ?? 'Unknown Agent',
      content: wizardForm.content,
      tokens: tokenEstimate,
      version: "1.0",
      modifiedBy: 'Current User',
      lastModified: new Date().toISOString(),
    }

    setPromptList(prev => [newPrompt, ...prev])
    setSelected(newPrompt)
    setEditContent(newPrompt.content)
    setIsDirty(false)
    closeWizard()
  }

  const wordCount = editContent.trim().split(/\s+/).filter(Boolean).length
  const wizardWordCount = wizardForm.content.trim().split(/\s+/).filter(Boolean).length
  const wizardTokenEstimate = Math.round(wizardWordCount * 1.3)

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
        <Button size="sm" className="gap-2" onClick={openWizard}>
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
                  <Input 
                    key={`name-${selected.id}`} 
                    defaultValue={selected.name} 
                    className="h-8 text-sm" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select key={`type-${selected.id}`} defaultValue={selected.type}>
                    <SelectTrigger className="h-8 text-sm w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {promptTypes.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Agent</Label>
                  <Select key={`agent-${selected.id}`} defaultValue={selected.agentId}>
                    <SelectTrigger className="h-8 text-sm w-52"><SelectValue /></SelectTrigger>
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

      <Dialog open={showWizard} onOpenChange={(open) => { if (!open) closeWizard() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>Follow the steps to author a new prompt for your agents.</DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0 py-2">
            {wizardSteps.map((step, i) => {
              const StepIcon = step.icon
              const isCurrent = wizardStep === step.id
              const isDone = wizardStep > step.id
              return (
                <div key={step.id} className="flex items-center">
                  {i > 0 && (
                    <div className={cn('h-px w-12 mx-1', isDone || isCurrent ? 'bg-primary' : 'bg-border')} />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                      isDone ? 'border-primary bg-primary text-primary-foreground' :
                      isCurrent ? 'border-primary bg-primary/10 text-primary' :
                      'border-border text-muted-foreground'
                    )}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </div>
                    <span className={cn('text-[10px] font-medium', isCurrent ? 'text-primary' : 'text-muted-foreground')}>
                      {step.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator />

          {/* ─── Step 1: Details ─────────────────────────────────────────── */}
          {wizardStep === 1 && (
            <div className="flex flex-col gap-4 py-2 min-h-[280px]">
              <div className="flex flex-col gap-1.5">
                <Label>Prompt Name</Label>
                <Input
                  placeholder="e.g. Customer Support System Prompt"
                  value={wizardForm.name}
                  onChange={(e) => setWizardForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Prompt Type</Label>
                  <Select
                    value={wizardForm.type}
                    onValueChange={(v) => v && setWizardForm(f => ({ ...f, type: v as Prompt['type'] }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {promptTypes.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Determines when this prompt is used in the conversation.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Assigned Agent</Label>
                  <Select
                    value={wizardForm.agentId}
                    onValueChange={(v) => v && setWizardForm(f => ({ ...f, agentId: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select an agent" /></SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">The agent this prompt will be attached to.</p>
                </div>
              </div>

              {/* Type preview */}
              <div className="rounded-md border border-border bg-muted/30 p-3 mt-auto">
                <p className="text-[11px] text-muted-foreground mb-2">Type descriptions:</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { type: 'system', desc: 'Core instructions defining agent behaviour and persona.' },
                    { type: 'welcome', desc: 'Greeting message played when the call starts.' },
                    { type: 'fallback', desc: 'Response when the agent cannot understand or fulfil a request.' },
                    { type: 'escalation', desc: 'Message used when transferring to a human agent.' },
                    { type: 'closing', desc: 'Farewell message played before the call ends.' },
                  ].map((t) => (
                    <div key={t.type} className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 capitalize shrink-0', typeStyles[t.type as Prompt['type']])}>
                        {t.type}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Content ─────────────────────────────────────────── */}
          {wizardStep === 2 && (
            <div className="flex flex-col gap-4 py-2 min-h-[280px]">
              <div className="flex items-center justify-between">
                <Label>Prompt Content</Label>
                <span className="text-[11px] text-muted-foreground">
                  ~{wizardTokenEstimate} tokens · {wizardWordCount} words
                </span>
              </div>
              <Textarea
                value={wizardForm.content}
                onChange={(e) => setWizardForm(f => ({ ...f, content: e.target.value }))}
                className="flex-1 resize-none font-mono text-sm min-h-[260px] leading-relaxed"
                placeholder={`You are a friendly customer support agent for Acme Corp.\n\nWhen a customer calls:\n1. Greet them by name if available: {{customer_name}}\n2. Ask how you can help\n3. Look up their account: {{account_id}}\n4. Provide resolution or escalate\n\nToday's date is {{current_date}}.`}
                autoFocus
              />

              {/* Variables hint */}
              <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Available variables: </span>
                  <code className="font-mono bg-muted px-1 rounded">{'{{customer_name}}'}</code>{' '}
                  <code className="font-mono bg-muted px-1 rounded">{'{{account_id}}'}</code>{' '}
                  <code className="font-mono bg-muted px-1 rounded">{'{{current_date}}'}</code>{' '}
                  <code className="font-mono bg-muted px-1 rounded">{'{{agent_name}}'}</code>{' '}
                  <code className="font-mono bg-muted px-1 rounded">{'{{order_id}}'}</code>
                </p>
              </div>
            </div>
          )}

          {/* ─── Step 3: Review ──────────────────────────────────────────── */}
          {wizardStep === 3 && (
            <div className="flex flex-col gap-4 py-2 min-h-[280px]">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--status-active)]">
                <CheckCircle2 className="h-4 w-4" />
                Ready to create — review your prompt below
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/30 px-3 py-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Name</span>
                  <span className="text-sm font-medium">{wizardForm.name || '—'}</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/30 px-3 py-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</span>
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 capitalize w-fit mt-0.5', typeStyles[wizardForm.type])}>
                    {wizardForm.type}
                  </Badge>
                </div>
                <div className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/30 px-3 py-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Agent</span>
                  <span className="text-sm font-medium">{agents.find(a => a.id === wizardForm.agentId)?.name ?? '—'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Content Preview</Label>
                  <span className="text-[11px] text-muted-foreground">~{wizardTokenEstimate} tokens · {wizardWordCount} words</span>
                </div>
                <div className="flex-1 rounded-md border border-border bg-muted/20 p-3 overflow-y-auto max-h-[200px]">
                  <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/80">
                    {wizardForm.content || 'No content provided.'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ─── Wizard Footer ───────────────────────────────────────────── */}
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div>
              {wizardStep > 1 && (
                <Button variant="outline" onClick={wizardBack} className="gap-1.5">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={closeWizard}>Cancel</Button>
              {wizardStep < 3 ? (
                <Button onClick={wizardNext} disabled={!canProceed()} className="gap-1.5">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleWizardSave} className="gap-1.5">
                  <Save className="h-4 w-4" /> Create Prompt
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
