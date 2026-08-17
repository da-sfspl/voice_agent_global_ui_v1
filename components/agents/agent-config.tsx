'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type Agent, knowledgeBases, prompts } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'

import {
  Bot, MessageSquareText, Settings2, Mic2, Brain, BookOpen, Wrench, ShieldAlert,
  Layers, ChevronLeft, Save, Rocket, Plus, Trash2, Edit, Copy, Play, Pause,
  CheckCircle2, XCircle, AlertTriangle, Info, Phone, Users, User, PhoneForwarded,
  Zap, Database, Globe, SlidersHorizontal, Volume2, Radio, Sparkles, Code2,
  ArrowRight, Clock, Hash, Tag, FileText, Calendar, Send, Webhook, Shield,
  Eye, Lock, AlertCircle, Workflow, ArrowDown
} from 'lucide-react'
import { NewKnowledgeBaseDialog } from '@/components/agents/dialogs/new-knowledge-base-dialog'
import {
  AddToolDialog, AddPreCallActionDialog, AddRuleDialog,
  AddExtractionFieldDialog, AddPostCallActionDialog,
  type ToolItem, type PreCallAction, type RuleItem,
  type ExtractionField, type PostCallAction, type GuardrailItem
} from '@/components/agents/dialogs'
import { KnowledgeBase } from '@/lib/data'
import { AddGuardrailDialog } from '@/components/agents/dialogs/add-guardrail-dialog'
import { type PreCallCondition } from '@/components/agents/dialogs/add-precall-action-dialog'

// ─── Provider Capabilities (READ-ONLY metadata) ─────────────────────────────
const ttsProviderCapabilities: Record<string, {
  stability: boolean
  similarityBoost: boolean
  pitch: boolean
  volume: boolean
  style: boolean
  expressiveness: boolean
  voiceCloning: boolean
  multilingual: boolean
  lowLatency: boolean
}> = {
  elevenlabs: {
    stability: true, similarityBoost: true, pitch: false, volume: false,
    style: true, expressiveness: true, voiceCloning: true, multilingual: true, lowLatency: true
  },
  'azure-tts': {
    stability: false, similarityBoost: false, pitch: true, volume: true,
    style: true, expressiveness: false, voiceCloning: false, multilingual: true, lowLatency: false
  },
  'google-tts': {
    stability: false, similarityBoost: false, pitch: true, volume: true,
    style: false, expressiveness: false, voiceCloning: false, multilingual: true, lowLatency: false
  },
  'amazon-polly': {
    stability: false, similarityBoost: false, pitch: true, volume: true,
    style: false, expressiveness: false, voiceCloning: false, multilingual: true, lowLatency: false
  },
}


// ─── Types (only what's needed locally) ─────────────────────────────────────
// type ToolItem = {
//   id: string; name: string; description: string; type: string
//   endpoint?: string; httpMethod?: string; authentication?: string
//   timeout?: number; retryPolicy?: string
// }

// type ExtractionField = {
//   id: string; name: string; type: string; description: string
//   confidence: number; lowConfidenceBehavior: string; required: boolean
// }

// type PostCallAction = {
//   id: string; name: string; actionType: string; trigger: string
//   payload: string; retryBehavior: string; failureHandling: string
// }

// ─── Sections Nav ───────────────────────────────────────────────────────────
const sections = [
  { id: 'info', label: 'Agent Info', icon: Bot },
  { id: 'prompt', label: 'System Instructions', icon: Brain },
  { id: 'providers', label: 'AI Providers', icon: Settings2 },
  { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
  { id: 'memory', label: 'Memory & Context', icon: Database },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'tools', label: 'Tools & Functions', icon: Wrench },
  { id: 'precall', label: 'Pre-Call Actions', icon: Zap },
  { id: 'rules', label: 'Rules & Policies', icon: Shield },
  { id: 'guardrails', label: 'Guardrails', icon: ShieldAlert },
  { id: 'extraction', label: 'Data Extraction', icon: Database },
  { id: 'postcall', label: 'Post-Call Actions', icon: Send },
  { id: 'intelligence', label: 'Intelligence Layer', icon: Workflow },
]

// ─── Main Component ─────────────────────────────────────────────────────────
export function AgentConfig({ agent }: { agent: Agent }) {
  const [activeSection, setActiveSection] = useState('info')
  const agentPrompt = prompts.find((p) => p.agentId === agent.id && p.type === 'system')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" render={<Link href={`/agents/${agent.id}`} />} nativeButton={false} className="h-8 px-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />{agent.name}
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-xl font-semibold">Configure Agent</h1>
          <Badge variant="outline" className="font-mono text-xs">v{agent.version}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Save className="h-4 w-4" />Save Draft
          </Button>
          <Button size="sm" render={<Link href={`/agents/${agent.id}/publish`} />} nativeButton={false} className="gap-1.5">
            <Rocket className="h-4 w-4" />Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        {/* Section Nav */}
        <nav className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={cn('flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left',
                  activeSection === s.id ? 'bg-primary/10 text-foreground font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}>
                <Icon className={cn('h-4 w-4 shrink-0', activeSection === s.id && 'text-primary')} />
                {s.label}
              </button>
            )
          })}
        </nav>

        {/* Section Content */}
        <div className="rounded-lg border border-border bg-card">
          {activeSection === 'info' && <SectionInfo agent={agent} />}
          {activeSection === 'prompt' && <SectionPrompt prompt={agentPrompt?.content ?? ''} />}
          {activeSection === 'providers' && <SectionProviders agent={agent} />}
          {activeSection === 'voice' && <SectionVoice agent={agent} />}
          {activeSection === 'memory' && <SectionMemory agent={agent} />}
          {activeSection === 'knowledge' && <SectionKnowledge agent={agent} />}
          {activeSection === 'tools' && <SectionTools />}
          {activeSection === 'precall' && <SectionPreCallActions />}
          {activeSection === 'rules' && <SectionRules />}
          {activeSection === 'guardrails' && <SectionGuardrails />}
          {activeSection === 'extraction' && <SectionDataExtraction />}
          {activeSection === 'postcall' && <SectionPostCallActions />}
          {activeSection === 'intelligence' && <SectionIntelligence />}

          <div className="border-t border-border px-6 py-3 flex justify-end gap-2">
            <Button variant="outline" size="sm">Discard</Button>
            <Button size="sm"><Save className="h-4 w-4 mr-1.5" />Save Section</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function ConfigSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}

function UnsupportedBadge({ feature }: { feature: string }) {
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground border-dashed gap-1">
      <Info className="h-2.5 w-2.5" />Not supported by {feature}
    </Badge>
  )
}

function DeterministicFlowStrip() {
  return (
    <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><Zap className="h-4 w-4 text-primary" /></div>
          <p className="text-[10px] font-semibold text-center">PRE-CALL</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><Shield className="h-4 w-4 text-primary" /></div>
          <p className="text-[10px] font-semibold text-center">RULES</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><Bot className="h-4 w-4 text-primary" /></div>
          <p className="text-[10px] font-semibold text-center">RESPONSE</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><ShieldAlert className="h-4 w-4 text-primary" /></div>
          <p className="text-[10px] font-semibold text-center">GUARDRAILS</p>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Agent Info (unchanged) ────────────────────────────────────────
function SectionInfo({ agent }: { agent: Agent }) {
  return (
    <ConfigSection title="Agent Information" description="Core identity and classification.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><Label>Agent Name</Label><Input defaultValue={agent.name} /></div>
        <div className="flex flex-col gap-1.5"><Label>Description</Label><Textarea defaultValue={agent.description} rows={3} /></div>
        <FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select defaultValue={agent.type}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Language</Label>
            <Select defaultValue={agent.language}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es-US">Spanish (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldRow>
        <div className="flex flex-col gap-1.5"><Label>Tags</Label><Input defaultValue={agent.tags.join(', ')} /></div>
      </div>
    </ConfigSection>
  )
}

// ─── Section: Prompt (unchanged) ────────────────────────────────────────────
function SectionPrompt({ prompt }: { prompt: string }) {
  return (
    <ConfigSection title="System Instructions" description="Define the agent's role and behavior.">
      <div className="flex flex-col gap-4">
        <FieldRow>
          <div className="flex flex-col gap-1.5"><Label>Agent Role</Label><Input defaultValue="Customer Support Agent" /></div>
          <div className="flex flex-col gap-1.5"><Label>Primary Objective</Label><Input defaultValue="Resolve inquiries efficiently" /></div>
        </FieldRow>
        <div className="flex flex-col gap-1.5">
          <Label>General Behavior</Label>
          <Textarea rows={4} defaultValue="Be helpful, patient, and professional." />
        </div>
        <Separator />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label>System Prompt (Advanced)</Label>
            <span className="text-xs text-muted-foreground">{prompt.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <Textarea defaultValue={prompt} rows={10} className="font-mono text-xs" />
        </div>
      </div>
    </ConfigSection>
  )
}

// ─── Section: Providers (unchanged) ─────────────────────────────────────────
function SectionProviders({ agent }: { agent: Agent }) {
  return (
    <ConfigSection title="AI Provider Configuration" description="Configure LLM, STT, and TTS providers.">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">LLM</h3></div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue={agent.llmProvider.toLowerCase()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Model</Label>
              <Select defaultValue={agent.llmModel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <div className="flex flex-col gap-1.5 max-w-xs">
            <Label>Temperature</Label>
            <Input type="number" defaultValue={agent.temperature} min="0" max="1" step="0.05" />
            <p className="text-xs text-muted-foreground">Lower = focused, Higher = creative.</p>
          </div>
        </div>
        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2"><Mic2 className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">STT</h3></div>
          <FieldRow>
            <div className="flex flex-col gap-1.5"><Label>Provider</Label><Select defaultValue="deepgram"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="deepgram">Deepgram</SelectItem></SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label>Model</Label><Select defaultValue="nova-3"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nova-3">Nova-3</SelectItem></SelectContent></Select></div>
          </FieldRow>
        </div>
        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">TTS</h3></div>
          <FieldRow>
            <div className="flex flex-col gap-1.5"><Label>Provider</Label><Select defaultValue="elevenlabs"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="elevenlabs">ElevenLabs</SelectItem></SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label>Voice</Label><Select defaultValue="rachel"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rachel">Rachel</SelectItem><SelectItem value="dorothy">Dorothy</SelectItem></SelectContent></Select></div>
          </FieldRow>
        </div>
      </div>
    </ConfigSection>
  )
}

// ─── Section: Voice (unchanged) ─────────────────────────────────────────────
function SectionVoice({ agent }: { agent: Agent }) {
  return (
    <ConfigSection title="Voice & Audio" description="Fine-tune vocal characteristics.">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <FieldRow>
            <div className="flex flex-col gap-1.5"><Label>Speed</Label><Select defaultValue="normal"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="slow">Slow</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="fast">Fast</SelectItem></SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label>Pitch</Label><Input type="number" defaultValue="0" min="-12" max="12" /></div>
          </FieldRow>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Interrupt Handling', 'Silence Detection', 'Noise Suppression'].map(label => (
            <div key={label} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <p className="text-sm font-medium">{label}</p>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>
    </ConfigSection>
  )
}

// ─── Section: Memory (unchanged) ────────────────────────────────────────────
function SectionMemory({ agent }: { agent: Agent }) {
  return (
    <ConfigSection title="Memory & Context" description="Conversation history retention.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div><p className="text-sm font-semibold">Conversation Memory</p><p className="text-xs text-muted-foreground">Remember context across sessions.</p></div>
          <Switch defaultChecked={agent.memoryEnabled} />
        </div>
        <FieldRow>
          <div className="flex flex-col gap-1.5"><Label>Scope</Label><Select defaultValue="workspace"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="session">Session</SelectItem><SelectItem value="caller">Per caller</SelectItem><SelectItem value="workspace">Workspace</SelectItem></SelectContent></Select></div>
          <div className="flex flex-col gap-1.5"><Label>TTL</Label><Select defaultValue="30"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">7 days</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem></SelectContent></Select></div>
        </FieldRow>
      </div>
    </ConfigSection>
  )
}

// ─── Section: Knowledge (unchanged) ─────────────────────────────────────────
function SectionKnowledge({ agent }: { agent: Agent }) {
  const [showNewKbDialog, setShowNewKbDialog] = useState(false)
  const [editingKb, setEditingKb] = useState<KnowledgeBase | null>(null)
  const [linkedIds, setLinkedIds] = useState<string[]>(agent.knowledgeBases)
  const linked = knowledgeBases.filter(kb => linkedIds.includes(kb.id))
  const unlinked = knowledgeBases.filter(kb => !linkedIds.includes(kb.id))

  return (
    <ConfigSection title="Knowledge Base" description="Attach knowledge bases.">
      <div className="flex flex-col gap-3">
        {linked.map(kb => (
          <div key={kb.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1"><p className="text-sm font-medium">{kb.name}</p><p className="text-xs text-muted-foreground">{kb.documents} docs</p></div>
            <Button size="sm" variant="ghost" className="h-7 px-2 gap-1" onClick={() => { setEditingKb(kb); setShowNewKbDialog(true) }}><Edit className="h-3.5 w-3.5" /><span className="text-xs">Edit</span></Button>
            <Button size="sm" variant="ghost" className="text-destructive h-7 px-2" onClick={() => setLinkedIds(prev => prev.filter(id => id !== kb.id))}>Detach</Button>
          </div>
        ))}
        {unlinked.map(kb => (
          <div key={kb.id} className="flex items-center gap-3 rounded-lg border border-dashed border-border/60 p-3 opacity-70">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1"><p className="text-sm font-medium">{kb.name}</p></div>
            <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => setLinkedIds(prev => [...prev, kb.id])}>Attach</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={() => { setEditingKb(null); setShowNewKbDialog(true) }}>
          <BookOpen className="h-4 w-4" /> Create New
        </Button>
      </div>
      <NewKnowledgeBaseDialog open={showNewKbDialog} onOpenChange={(open) => { if (!open) { setShowNewKbDialog(false); setEditingKb(null) } }} editing={editingKb} />
    </ConfigSection>
  )
}

// ─── Section: Tools (unchanged) ─────────────────────────────────────────────
function SectionTools() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ToolItem | null>(null)
  const [tools, setTools] = useState<ToolItem[]>([
    { id: '1', name: 'lookup_order', description: 'Look up order status', type: 'REST API' },
    { id: '2', name: 'create_ticket', description: 'Create support ticket', type: 'REST API' },
    { id: '3', name: 'transfer_call', description: 'Transfer to human', type: 'Built-in' },
  ])

  return (
    <ConfigSection title="Tools & Functions" description="Functions the agent can call.">
      <div className="flex flex-col gap-3">
        {tools.map(tool => (
          <div key={tool.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <code className="text-sm font-mono font-semibold">{tool.name}</code>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(tool); setShowDialog(true) }}><Edit className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5" onClick={() => { setEditingItem(null); setShowDialog(true) }}><Wrench className="h-4 w-4" /> Add Function</Button>
      </div>
      <AddToolDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(tool) => { if (editingItem) setTools(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...tool } : t)); else setTools(prev => [...prev, { ...tool, id: `tool-${Date.now()}` }]) }} />
    </ConfigSection>
  )
}

// ─── Section 8: Pre-Call Actions (IMPROVED) ─────────────────────────────────
function SectionPreCallActions() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PreCallAction | null>(null)
  const [actions, setActions] = useState<PreCallAction[]>([
    { id: '1', name: 'Customer Lookup', required: true, source: 'CRM Connection', sourceType: 'CRM API', lookupField: 'Phone Number', callerField: 'caller.phone_e164', targetField: 'phone', conditions: [{ field: 'Account Type', operator: 'equals', value: 'Customer' }], loadData: ['Customer name', 'Account status', 'Outstanding balance'], timeout: 3000, failureBehavior: 'proceed-partial' },
    { id: '2', name: 'Account Status', required: true, source: 'Billing API', sourceType: 'REST API', lookupField: 'Account ID', callerField: 'customer.account_id', targetField: 'id', conditions: [], loadData: ['Balance', 'Payment status'], timeout: 2000, failureBehavior: 'proceed-without' },
  ])

  return (
    <ConfigSection title="Pre-Call Actions" description="Retrieve customer and context data before the call starts.">
      <DeterministicFlowStrip />
      <div className="flex flex-col gap-1">
        {actions.map((action, idx) => (
          <div key={action.id}>
            <div className="flex gap-3 rounded-lg border border-border p-4 bg-card">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">{idx + 1}</div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{action.name}</span>
                      <Badge variant={action.required ? 'default' : 'outline'} className="text-[10px]">{action.required ? 'Required' : 'Optional'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{action.sourceType} · {action.source}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(action); setShowDialog(true) }}><Edit className="h-3.5 w-3.5" /></Button>
                </div>
                {Array.isArray(action.conditions) && action.conditions.length > 0 && (
                  <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                    <span className="font-semibold text-primary">WHEN</span>
                    <div className="mt-1 space-y-1">{action.conditions.map((c, i) => <div key={i} className="flex items-center gap-2">{i > 0 && <span className="text-muted-foreground font-medium">AND</span>}<code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{c.field} {c.operator} {c.value}</code></div>)}</div>
                  </div>
                )}
                <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <span className="font-semibold text-primary">LOOKUP</span>
                  <div className="mt-1 flex items-center gap-2"><code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{action.callerField}</code><ArrowRight className="h-3 w-3 text-muted-foreground" /><code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{action.targetField}</code></div>
                </div>
                <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <span className="font-semibold text-primary">LOAD INTO CONTEXT</span>
                  <div className="mt-1 flex flex-wrap gap-1">{(Array.isArray(action.loadData) ? action.loadData : []).map((f, i) => <Badge key={i} variant="secondary" className="text-[10px]">{f}</Badge>)}</div>
                </div>
                <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <span className="font-semibold text-primary">IF LOOKUP FAILS</span>
                  <div className="mt-1 text-muted-foreground">
                    {action.failureBehavior === 'proceed-partial' && 'Proceed with partial context'}
                    {action.failureBehavior === 'proceed-without' && 'Proceed without enrichment'}
                    {action.failureBehavior === 'stop' && 'Stop / fail pre-call'}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Timeout: {(action.timeout / 1000).toFixed(1)}s</div>
              </div>
            </div>
            {idx < actions.length - 1 && <div className="flex justify-center py-2"><ArrowDown className="h-4 w-4 text-muted-foreground" /></div>}
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-3" onClick={() => { setEditingItem(null); setShowDialog(true) }}><Zap className="h-4 w-4" /> Add Pre-Call Action</Button>
      </div>
      <AddPreCallActionDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(a) => { if (editingItem) setActions(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...a } : x)); else setActions(prev => [...prev, { ...a, id: `pre-${Date.now()}` }]) }} />
    </ConfigSection>
  )
}

// ─── Section 9: Rules (IMPROVED) ────────────────────────────────────────────
function SectionRules() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<RuleItem | null>(null)
  const [testResult, setTestResult] = useState<{ ruleId: string; matched: boolean } | null>(null)
  const [rules, setRules] = useState<RuleItem[]>([
    { id: '1', name: 'Human Request', description: 'Transfer when requested', priority: 1, enabled: true, conditions: [{ category: 'caller', field: 'request_type', operator: 'equals', value: 'human' }], actionType: 'transfer', actionTarget: 'Support Queue' },
    { id: '2', name: 'Collections Escalation', description: 'Escalate overdue accounts', priority: 2, enabled: true, conditions: [{ category: 'crm', field: 'days_overdue', operator: '>=', value: '30' }, { category: 'crm', field: 'account_status', operator: 'equals', value: 'Overdue' }], actionType: 'transfer', actionTarget: 'Collections Supervisor' },
  ])

  function testRule(rule: RuleItem) {
    const ctx: Record<string, any> = { days_overdue: 45, account_status: 'Overdue', request_type: 'human' }
    let matched = true
    for (const c of rule.conditions) {
      const v = ctx[c.field]
      if (v === undefined) { matched = false; break }
      if (c.operator === 'equals' && String(v) !== c.value) matched = false
      if (c.operator === '>=' && Number(v) < Number(c.value)) matched = false
      if (c.operator === '>' && Number(v) <= Number(c.value)) matched = false
    }
    setTestResult({ ruleId: rule.id, matched })
    setTimeout(() => setTestResult(null), 3000)
  }

  return (
    <ConfigSection title="Rules & Policies" description="Deterministic WHEN → THEN decisions.">
      <div className="flex flex-col gap-3">
        {rules.map(rule => (
          <div key={rule.id} className="flex gap-3 rounded-lg border border-border p-4 bg-card">
            <Badge variant="outline" className="text-xs font-semibold px-2 h-fit shrink-0">P{rule.priority}</Badge>
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{rule.name}</span>
                    <Badge variant={rule.enabled ? 'default' : 'outline'} className="text-[10px]">{rule.enabled ? 'Enabled' : 'Disabled'}</Badge>
                  </div>
                  {rule.description && <p className="text-xs text-muted-foreground">{rule.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2 gap-1" onClick={() => testRule(rule)}><Play className="h-3 w-3" /><span className="text-xs">Test</span></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(rule); setShowDialog(true) }}><Edit className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {testResult && testResult.ruleId === rule.id && (
                <div className={cn('rounded border p-2 text-xs', testResult.matched ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700' : 'border-muted bg-muted/30 text-muted-foreground')}>
                  <div className="flex items-center gap-2">
                    {testResult.matched ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span className="font-medium">{testResult.matched ? 'Condition matched' : 'Condition not matched'}</span>
                  </div>
                </div>
              )}
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">WHEN</span>
                <div className="mt-1 space-y-1">
                  {(Array.isArray(rule.conditions) ? rule.conditions : []).map((c: PreCallCondition, i: number) => (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      {i > 0 && <span className="text-muted-foreground font-medium">AND</span>}
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{c.field}</code>
                      <span className="text-muted-foreground">{c.operator}</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{c.value}</code>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">THEN</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground capitalize">{rule.actionType}</span>
                  {rule.actionTarget && <><ArrowRight className="h-3 w-3 text-muted-foreground" /><code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{rule.actionTarget}</code></>}
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5" onClick={() => { setEditingItem(null); setShowDialog(true) }}><Shield className="h-4 w-4" /> Add Rule</Button>
      </div>
      <AddRuleDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(r) => { if (editingItem) setRules(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...r } : x)); else setRules(prev => [...prev, { ...r, id: `rule-${Date.now()}` }]) }} />
    </ConfigSection>
  )
}

// ─── Section 10: Guardrails (IMPROVED) ──────────────────────────────────────
function SectionGuardrails() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<GuardrailItem | null>(null)
  const [testResult, setTestResult] = useState<{ guardrailId: string; triggered: boolean } | null>(null)
  const [guardrails, setGuardrails] = useState<GuardrailItem[]>([
    { id: '1', name: 'PII Protection', description: 'Prevent sensitive data collection', priority: 1, enabled: true, protectedData: ['SSN', 'Card number', 'Bank account'], conditions: [], checkBefore: true, checkAfter: true, action: 'block', safeResponse: "I can't collect that information." },
    { id: '2', name: 'Profanity Filter', description: 'Block inappropriate language', priority: 2, enabled: true, protectedData: ['Profanity'], conditions: [], checkBefore: false, checkAfter: true, action: 'redact', safeResponse: "Let's keep our conversation professional." },
  ])

  function testGuardrail(g: GuardrailItem) {
    const input = "I want to give you my card number..."
    const triggered = (Array.isArray(g.protectedData) ? g.protectedData : []).some((p: string) => input.toLowerCase().includes(p.toLowerCase()))
    setTestResult({ guardrailId: g.id, triggered })
    setTimeout(() => setTestResult(null), 3000)
  }

  return (
    <ConfigSection title="Guardrails" description="Deterministic policies that protect agent behavior.">
      <div className="flex flex-col gap-3">
        {guardrails.map(g => (
          <div key={g.id} className="flex gap-3 rounded-lg border border-border p-4 bg-card">
            <Badge variant="outline" className="text-xs font-semibold px-2 h-fit shrink-0">P{g.priority}</Badge>
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{g.name}</span>
                    <Badge variant={g.enabled ? 'default' : 'outline'} className="text-[10px]">{g.enabled ? 'Enabled' : 'Disabled'}</Badge>
                  </div>
                  {g.description && <p className="text-xs text-muted-foreground">{g.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2 gap-1" onClick={() => testGuardrail(g)}><Play className="h-3 w-3" /><span className="text-xs">Test</span></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(g); setShowDialog(true) }}><Edit className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {testResult && testResult.guardrailId === g.id && (
                <div className={cn('rounded border p-2 text-xs', testResult.triggered ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700' : 'border-muted bg-muted/30 text-muted-foreground')}>
                  <div className="flex items-center gap-2">
                    {testResult.triggered ? <ShieldAlert className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span className="font-medium">{testResult.triggered ? 'Guardrail triggered' : 'No violation detected'}</span>
                  </div>
                </div>
              )}
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">PROTECTS</span>
                <div className="mt-1 flex flex-wrap gap-1">{(Array.isArray(g.protectedData) ? g.protectedData : []).map((d, i) => <Badge key={i} variant="secondary" className="text-[10px]">{d}</Badge>)}</div>
              </div>
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">ACTION</span>
                <div className="mt-1 capitalize text-muted-foreground">
                  {g.action === 'block' && 'Block response'}{g.action === 'redact' && 'Redact content'}{g.action === 'replace' && 'Replace with safe response'}{g.action === 'transfer' && 'Transfer to human'}{g.action === 'end-call' && 'End call'}
                </div>
              </div>
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">CHECKS</span>
                <div className="mt-1 flex gap-2 text-muted-foreground">{g.checkBefore && <span>Pre-generation</span>}{g.checkBefore && g.checkAfter && <span>·</span>}{g.checkAfter && <span>Post-generation</span>}</div>
              </div>
              {g.safeResponse && (
                <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <span className="font-semibold text-primary">SAFE RESPONSE</span>
                  <p className="mt-1 text-muted-foreground italic">"{g.safeResponse}"</p>
                </div>
              )}
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5" onClick={() => { setEditingItem(null); setShowDialog(true) }}><ShieldAlert className="h-4 w-4" /> Add Guardrail</Button>
      </div>
      <AddGuardrailDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(g) => { if (editingItem) setGuardrails(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...g } : x)); else setGuardrails(prev => [...prev, { ...g, id: `guard-${Date.now()}` }]) }} />
    </ConfigSection>
  )
}

// ─── Section 11: Data Extraction (unchanged) ────────────────────────────────
function SectionDataExtraction() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ExtractionField | null>(null)
  const [fields, setFields] = useState<ExtractionField[]>([
    { id: '1', name: 'customer_name', type: 'String', description: '', confidence: 95, lowConfidenceBehavior: 'clarify', required: true },
    { id: '2', name: 'order_id', type: 'String', description: '', confidence: 92, lowConfidenceBehavior: 'clarify', required: true },
  ])

  return (
    <ConfigSection title="Data Extraction" description="Fields to extract from conversations.">
      <div className="flex flex-col gap-3">
        {fields.map(f => (
          <div key={f.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Database className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <code className="text-sm font-mono font-semibold">{f.name}</code>
              <p className="text-xs text-muted-foreground mt-0.5">Confidence: {f.confidence}%</p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(f); setShowDialog(true) }}><Edit className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5" onClick={() => { setEditingItem(null); setShowDialog(true) }}><Database className="h-4 w-4" /> Add Field</Button>
      </div>
      <AddExtractionFieldDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(f) => { if (editingItem) setFields(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...f } : x)); else setFields(prev => [...prev, { ...f, id: `field-${Date.now()}` }]) }} />
    </ConfigSection>
  )
}

// ─── Section 12: Post-Call Actions (unchanged) ──────────────────────────────
function SectionPostCallActions() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PostCallAction | null>(null)
  const [actions, setActions] = useState<PostCallAction[]>([
    { id: '1', name: 'Update CRM', actionType: 'CRM Update', trigger: 'Call Completed', payload: '{}', retryBehavior: '3', failureHandling: 'log' },
    { id: '2', name: 'Send SMS', actionType: 'SMS', trigger: 'Specific Outcome', payload: '{}', retryBehavior: '3', failureHandling: 'alert' },
  ])

  return (
    <ConfigSection title="Post-Call Actions" description="Actions after the call finishes.">
      <div className="flex flex-col gap-3">
        {actions.map(a => (
          <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Send className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-semibold">{a.name}</span>
              <p className="text-xs text-muted-foreground mt-0.5">Trigger: {a.trigger}</p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(a); setShowDialog(true) }}><Edit className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5" onClick={() => { setEditingItem(null); setShowDialog(true) }}><Send className="h-4 w-4" /> Add Action</Button>
      </div>
      <AddPostCallActionDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(a) => { if (editingItem) setActions(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...a } : x)); else setActions(prev => [...prev, { ...a, id: `post-${Date.now()}` }]) }} />
    </ConfigSection>
  )
}

// ─── Section 13: Intelligence (unchanged) ───────────────────────────────────
function SectionIntelligence() {
  const [useFlow, setUseFlow] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState('')

  return (
    <ConfigSection title="Intelligence Layer" description="Advanced reasoning and conversation patterns.">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><Workflow className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Use Conversation Flow</p></div>
              <p className="text-xs text-muted-foreground">Follow a structured pattern (optional).</p>
            </div>
            <Switch checked={useFlow} onCheckedChange={setUseFlow} />
          </div>
          {useFlow && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <Select value={selectedFlow} onValueChange={(v) => v && setSelectedFlow(v)}>
                <SelectTrigger><SelectValue placeholder="Choose pattern..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">Appointment Booking</SelectItem>
                  <SelectItem value="support">Customer Support</SelectItem>
                  <SelectItem value="collection">Payment Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          {['Sentiment Analysis', 'Intent Classification', 'Call Summarization', 'Real-time Coaching'].map(label => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-border p-4">
              <p className="text-sm font-medium">{label}</p>
              <Switch defaultChecked={label !== 'Real-time Coaching'} />
            </div>
          ))}
        </div>
      </div>
    </ConfigSection>
  )
}