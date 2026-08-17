'use client'

import Link from 'next/link'
import { agentTemplates } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Bot, FileText, Settings2, Mic2, ChevronLeft, ChevronRight, Check,
  PhoneIncoming, PhoneOutgoing, ArrowLeftRight, MessageSquareText, Brain,
  BookOpen, Wrench, Zap, Shield, ShieldAlert, Database, Send, Layers,
  Play, Workflow, Info, Phone, Sparkles, SlidersHorizontal, Mic,
  AudioLines, Volume2, Radio, Globe, Brain as BrainIcon, Mic2 as Mic2Icon,
  Lock, CheckCircle2, XCircle, ArrowRight, Plus, Edit, Trash2, AlertCircle,
  Settings2 as SettingsIcon, Rocket, Eye, Pencil, ArrowDown
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AddToolDialog, AddPreCallActionDialog, AddRuleDialog,
  AddExtractionFieldDialog, AddPostCallActionDialog, AddGuardrailDialog,
  type ToolItem, type PreCallAction, type RuleItem,
  type ExtractionField, type PostCallAction, type GuardrailItem
} from '@/components/agents/dialogs'
import { NewKnowledgeBaseDialog } from '@/components/agents/dialogs/new-knowledge-base-dialog'
import { type AgentTemplate, type KnowledgeBase } from '@/lib/data'
import { DeterministicFlowStrip } from '@/components/agents/dialogs/deterministic-flow-dialog'
import { type PreCallCondition } from '@/components/agents/dialogs/add-precall-action-dialog'
// Import mock data
import { knowledgeBases } from '@/lib/data'

// ─── Wizard Steps ───────────────────────────────────────────────────────────
const steps = [
  { id: 1, label: 'Info', icon: Bot },
  { id: 2, label: 'Template', icon: FileText },
  { id: 3, label: 'Instructions', icon: MessageSquareText },
  { id: 4, label: 'Providers', icon: Settings2 },
  { id: 5, label: 'Voice', icon: Mic2 },
  // { id: 6, label: 'Memory', icon: Brain },
  { id: 6, label: 'Knowledge', icon: BookOpen },
  { id: 7, label: 'Tools', icon: Wrench },
  { id: 8, label: 'Pre-Call', icon: Zap },
  { id: 9, label: 'Rules', icon: Shield },
  { id: 10, label: 'Guardrails', icon: ShieldAlert },
  { id: 11, label: 'Extraction', icon: Database },
  { id: 12, label: 'Post-Call', icon: Send },
  { id: 13, label: 'Intelligence', icon: Layers },
]


const ttsProviderVoices: Record<string, { id: string; name: string; language: string }[]> = {
  elevenlabs: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'en-US' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', language: 'en-US' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'en-US' },
  ],
  azure: [
    { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US' },
    { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US' },
  ],
  google: [
    { id: 'en-US-Standard-A', name: 'Standard A', language: 'en-US' },
    { id: 'en-US-Standard-C', name: 'Standard C', language: 'en-US' },
  ],
  aws: [
    { id: 'Joanna', name: 'Joanna', language: 'en-US' },
    { id: 'Matthew', name: 'Matthew', language: 'en-US' },
  ],
}

const providerFeatures: Record<string, {
  stability: boolean; similarityBoost: boolean; pitch: boolean;
  volume: boolean; style: boolean; expressiveness: boolean
}> = {
  elevenlabs: { stability: true, similarityBoost: true, pitch: false, volume: false, style: true, expressiveness: true },
  azure: { stability: false, similarityBoost: false, pitch: true, volume: true, style: true, expressiveness: false },
  google: { stability: false, similarityBoost: false, pitch: true, volume: true, style: false, expressiveness: false },
  aws: { stability: false, similarityBoost: false, pitch: true, volume: true, style: false, expressiveness: false },
}

const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'multi', label: 'Multi-language' },
]

const emotionStyles = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'empathetic', label: 'Empathetic' },
]

// ─── Helper Components ──────────────────────────────────────────────────────
function WizardSection({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode
}) {
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



// ─── Main Wizard Component ──────────────────────────────────────────────────
export function CreateAgentWizard() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [agentType, setAgentType] = useState<'inbound' | 'outbound' | 'hybrid'>('inbound')
  const [wizardMode, setWizardMode] = useState<'create' | 'preview'>('create')

  const [ttsProvider, setTtsProvider] = useState('elevenlabs')
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM')

   // Read template from URL on mount
  useEffect(() => {
    const templateId = searchParams.get('template')
    const mode = searchParams.get('mode')

    if (templateId && agentTemplates.some(t => t.id === templateId)) {
      setSelectedTemplate(templateId)
      setStep(14) // Jump to review step
      
      if (mode === 'preview') {
        setWizardMode('preview')
      }
      
      // Set agent type from template
      const tpl = agentTemplates.find(t => t.id === templateId)
      if (tpl) setAgentType(tpl.type)
    }
  }, [searchParams])

  // If a template is selected, we force the wizard to the final "Review" step (14/14)
  const isUsingTemplate = selectedTemplate !== null
  const currentStep = isUsingTemplate ? 14 : step
  const selectedTemplateData = agentTemplates.find(t => t.id === selectedTemplate)

  function handleTemplateSelect(id: string | null) {
    setSelectedTemplate(id)
    if (id) {
      setStep(14)
      const tpl = agentTemplates.find(t => t.id === id)
      if (tpl) setAgentType(tpl.type)
    } else {
      setStep(2)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/agents" />} nativeButton={false} className="h-8 px-2 text-muted-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Agents
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-xl font-semibold">Create New Agent</h1>
      </div>

      {/* Progress Steps (Hide detailed steps if using template, just show start and end) */}
      <div className="flex items-center gap-0 flex-wrap">
        {isUsingTemplate ? (
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <CheckCircle2 className="h-5 w-5" />
            Template Configuration Loaded — Ready to Create
          </div>
        ) : (
          steps.map((s, idx) => {
            const Icon = s.icon
            const isDone = step > s.id
            const isActive = step === s.id
            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => isDone && setStep(s.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-2 text-xs transition-colors',
                    isActive ? 'text-foreground font-medium' : isDone ? 'text-primary cursor-pointer' : 'text-muted-foreground',
                  )}
                >
                  <span className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0',
                    isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-primary/20 text-primary' : 'bg-accent text-muted-foreground',
                  )}>
                    {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {idx < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-0.5" />}
              </div>
            )
          })
        )}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Main Content Area */}
        <div className="rounded-lg border border-border bg-card">
          
          {/* CONDITIONAL RENDERING: Template Review vs Step-by-Step */}
          {isUsingTemplate && selectedTemplateData ? (
            <TemplateReviewView 
              template={selectedTemplateData} 
              mode={wizardMode}
              onBack={() => handleTemplateSelect(null)} 
            />
          ) : (
            <>
              {step === 1 && <StepAgentInfo agentType={agentType} onTypeChange={setAgentType} />}
              {step === 2 && <StepTemplate selected={selectedTemplate} onSelect={handleTemplateSelect} />}
              {step === 3 && <StepPrompt />}
              {step === 4 && (
                <StepProviders
                  ttsProvider={ttsProvider}
                  setTtsProvider={setTtsProvider}
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                />
              )}
              
              {step === 5 && (
                <StepVoice
                  ttsProvider={ttsProvider}
                  selectedVoice={selectedVoice}
                />
              )}             
         {/* {step === 6 && <StepMemory />} */}
              {step === 6 && <StepKnowledge />}
              {step === 7 && <StepTools />}
              {step === 8 && <StepPreCallActions />}
              {step === 9 && <StepRules />}
              {step === 10 && <StepGuardrails />}
              {step === 11 && <StepDataExtraction />}
              {step === 12 && <StepPostCallActions />}
              {step === 13 && <StepIntelligence />}

              {/* Standard Nav Buttons (Only for Blank Agent) */}
              <div className="border-t border-border px-6 py-4 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                {step < steps.length ? (
                  <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" render={<Link href="/agents/agt-001/config" />}>Create Agent</Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Agent Summary</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <SummaryRow label="Type" value={isUsingTemplate ? selectedTemplateData?.type || '-' : agentType} />
              <SummaryRow label="Template" value={selectedTemplateData ? selectedTemplateData.name : 'Blank'} />
              <SummaryRow label="Step" value={`${currentStep} / ${steps.length}`} />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Progress</h3>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className={cn("h-2 rounded-full transition-all", isUsingTemplate ? "bg-[var(--status-active)]" : "bg-primary")} 
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isUsingTemplate 
                ? 'Template loaded. Review the predefined configuration and click Create Agent.'
                : `Step ${step} of ${steps.length}: ${steps[step - 1]?.label}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NEW: Template Review View (Read-Only Summary) ──────────────────────────
function TemplateReviewView({ 
  template, 
  mode, 
  onBack 
}: { 
  template: AgentTemplate
  mode: 'create' | 'preview'
  onBack: () => void 
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {mode === 'create' ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--status-active)]" />
            ) : (
              <Eye className="h-5 w-5 text-primary" />
            )}
            <h2 className="text-lg font-semibold">
              {mode === 'create' ? 'Template Configuration Review' : 'Template Preview'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'create'
              ? `This agent will be created with the predefined settings for "${template.name}". Settings are locked but can be modified after creation.`
              : `Previewing the predefined configuration for "${template.name}". This template can be used to create a new agent.`
            }
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-2 py-1 capitalize">{template.type}</Badge>
      </div>

      <Separator />


      <div className="grid grid-cols-2 gap-4">
        <ReviewCard title="Instructions" icon={MessageSquareText}>
          <p className="text-xs text-muted-foreground"><strong>Role:</strong> {template.config.instructions.role}</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>Tone:</strong> <span className="capitalize">{template.config.instructions.tone.replace('-', ' ')}</span></p>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{template.config.instructions.behavior}</p>
        </ReviewCard>

        <ReviewCard title="AI Providers" icon={Settings2}>
          <p className="text-xs text-muted-foreground"><strong>LLM:</strong> {template.config.providers.llmProvider} ({template.config.providers.llmModel})</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>STT:</strong> {template.config.providers.sttProvider}</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>TTS:</strong> {template.config.providers.ttsProvider}</p>
        </ReviewCard>

        <ReviewCard title="Voice Profile" icon={Mic2Icon}>
          <p className="text-xs text-muted-foreground"><strong>Speed:</strong> {template.config.voice.speed}x | <strong>Emotion:</strong> {template.config.voice.emotion}</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>Interrupt:</strong> {template.config.voice.interruptHandling ? 'Allowed' : 'Disabled'}</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>Silence Detection:</strong> {template.config.voice.silenceDetection ? 'Enabled' : 'Disabled'}</p>
        </ReviewCard>

        <ReviewCard title="Memory & Context" icon={Brain}>
          <p className="text-xs text-muted-foreground"><strong>Enabled:</strong> {template.config.memory.enabled ? 'Yes' : 'No'}</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>Scope:</strong> <span className="capitalize">{template.config.memory.scope}</span></p>
          <p className="text-xs text-muted-foreground mt-1"><strong>Retention:</strong> {template.config.memory.ttlDays} days</p>
        </ReviewCard>

        <ReviewCard title="Tools & Functions" icon={Wrench}>
          <div className="flex flex-wrap gap-1 mt-1">
            {template.config.tools.map(t => (
              <Badge key={t.id} variant="secondary" className="text-[10px] font-mono">{t.name}</Badge>
            ))}
            {template.config.tools.length === 0 && <p className="text-xs text-muted-foreground">No tools configured</p>}
          </div>
        </ReviewCard>

        <ReviewCard title="Rules & Policies" icon={Shield}>
          <div className="flex flex-wrap gap-1 mt-1">
            {template.config.rules.map(r => (
              <Badge key={r.id} variant="secondary" className="text-[10px]">{r.name}</Badge>
            ))}
            {template.config.rules.length === 0 && <p className="text-xs text-muted-foreground">No rules configured</p>}
          </div>
        </ReviewCard>

        <ReviewCard title="Guardrails" icon={ShieldAlert}>
          <div className="flex flex-wrap gap-1 mt-1">
            {template.config.guardrails.map(g => (
              <Badge key={g.id} variant="secondary" className="text-[10px]">{g.name}</Badge>
            ))}
            {template.config.guardrails.length === 0 && <p className="text-xs text-muted-foreground">No guardrails configured</p>}
          </div>
        </ReviewCard>

        <ReviewCard title="Intelligence Layer" icon={Layers}>
          <p className="text-xs text-muted-foreground"><strong>Conversation Flow:</strong> {template.config.intelligence.useFlow ? 'Enabled' : 'Disabled'}</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>Sentiment:</strong> {template.config.intelligence.sentiment ? 'On' : 'Off'}</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>Summarization:</strong> {template.config.intelligence.summarization ? 'On' : 'Off'}</p>
        </ReviewCard>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> 
          {mode === 'create' ? 'Choose Different Template' : 'Back to Templates'}
        </Button>
        
        {mode === 'create' ? (
          <Button size="sm" className="gap-2" render={<Link href="/agents/agt-001/config" />} nativeButton={false}>
            <Rocket className="h-4 w-4" />
            Create Agent from Template
          </Button>
        ) : (
          <Button size="sm" className="gap-2" render={<Link href={`/agents/new?template=${template.id}&mode=create`} />} nativeButton={false}>
            <Rocket className="h-4 w-4" />
            Use This Template
          </Button>
        )}
      </div>
    </div>
  )
}

// Helper for Review Cards
function ReviewCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right capitalize truncate max-w-[180px]">{value}</span>
    </div>
  )
}

// ─── Step 1: Agent Info (existing) ──────────────────────────────────────────
function StepAgentInfo({ agentType, onTypeChange }: {
  agentType: 'inbound' | 'outbound' | 'hybrid'
  onTypeChange: (t: 'inbound' | 'outbound' | 'hybrid') => void
}) {
  return (
    <WizardSection title="Agent Information" description="Define the basic details for your new agent.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Agent Name <span className="text-destructive">*</span></Label>
          <Input placeholder="e.g. Customer Support Agent" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Description</Label>
          <Textarea placeholder="Describe what this agent does..." rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Agent Type <span className="text-destructive">*</span></Label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { type: 'inbound' as const, icon: PhoneIncoming, label: 'Inbound', desc: 'Handles incoming calls' },
              { type: 'outbound' as const, icon: PhoneOutgoing, label: 'Outbound', desc: 'Initiates outgoing calls' },
              { type: 'hybrid' as const, icon: ArrowLeftRight, label: 'Hybrid', desc: 'Both inbound & outbound' },
            ]).map(({ type, icon: Icon, label, desc }) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={cn(
                  'flex flex-col gap-1.5 rounded-lg border p-4 text-left transition-colors',
                  agentType === type ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80',
                )}
              >
                <Icon className={cn('h-5 w-5', agentType === type ? 'text-primary' : 'text-muted-foreground')} />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>
        </div>
        <FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Language</Label>
            <Select defaultValue="en-US">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es-US">Spanish (US)</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="multi">Multi-language</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <Input placeholder="support, inbound, crm" />
          </div>
        </FieldRow>
      </div>
    </WizardSection>
  )
}

// ─── Step 2: Template (existing) ────────────────────────────────────────────
function StepTemplate({ selected, onSelect }: { selected: string | null; onSelect: (id: string | null) => void }) {
  return (
    <WizardSection title="Start from a Template" description="Select a pre-built template or start from scratch.">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
          selected === null ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80',
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
          <Bot className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Blank Agent</p>
          <p className="text-xs text-muted-foreground">Start with a clean slate and configure everything manually.</p>
        </div>
        {selected === null && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
      </button>
      <div className="flex flex-col gap-2 mt-2">
        {agentTemplates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
              selected === tpl.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80',
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">{tpl.name}</p>
                <Badge variant="outline" className="text-[10px] px-1.5">{tpl.category}</Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 capitalize border-primary/20 text-primary">{tpl.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tpl.description}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                <span>{tpl.llmModel}</span>
                <span>·</span>
                <span>{tpl.voice}</span>
                <span>·</span>
                <span>{tpl.language}</span>
                <span>·</span>
                <span>{tpl.useCount} uses</span>
              </div>
            </div>
            {selected === tpl.id && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
          </button>
        ))}
      </div>
    </WizardSection>
  )
}

// ─── Step 3: System Instructions (NEW) ──────────────────────────────────────
function StepPrompt() {
  return (
    <WizardSection title="System Instructions" description="Define the agent's role, behavior, and communication style.">
      <div className="flex flex-col gap-4">
        <FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Agent Role</Label>
            <Input placeholder="e.g. Customer Support Agent" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Primary Objective</Label>
            <Input placeholder="What should the agent achieve?" />
          </div>
        </FieldRow>

        <div className="flex flex-col gap-1.5">
          <Label>General Behavior</Label>
          <Textarea rows={4} placeholder="Describe how the agent should behave..." />
        </div>

        <FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Tone / Communication Style</Label>
            <Select defaultValue="professional-friendly">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional-formal">Professional & Formal</SelectItem>
                <SelectItem value="professional-friendly">Professional & Friendly</SelectItem>
                <SelectItem value="casual">Casual & Conversational</SelectItem>
                <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Response Length</Label>
            <Select defaultValue="concise">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="very-concise">Very Concise</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldRow>

        <div className="flex flex-col gap-1.5">
          <Label>General Constraints</Label>
          <Textarea rows={3} placeholder="What should the agent never do?" />
        </div>

        <Separator />

        <FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Welcome Message</Label>
            <Textarea rows={3} defaultValue="Thank you for calling. How can I help you today?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fallback Message</Label>
            <Textarea rows={3} defaultValue="I apologize, could you please repeat that?" />
          </div>
        </FieldRow>
      </div>
    </WizardSection>
  )
}

// ─── Step 4: Providers (existing) ───────────────────────────────────────────
function StepProviders({
  ttsProvider,
  setTtsProvider,
  selectedVoice,
  setSelectedVoice,
}: {
  ttsProvider: string
  setTtsProvider: (provider: string) => void
  selectedVoice: string
  setSelectedVoice: (voice: string) => void
}) {
  const availableVoices = ttsProviderVoices[ttsProvider] ?? []

  function handleTtsProviderChange(provider: string | null) {
    if (!provider) return
    setTtsProvider(provider)
    const voices = ttsProviderVoices[provider]
    if (voices?.length > 0) setSelectedVoice(voices[0].id)
  }

  return (
    <WizardSection title="AI Provider Configuration" description="Select the LLM, STT, and TTS providers.">
      <div className="flex flex-col gap-4">
        {/* LLM */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">LLM (Large Language Model)</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue="openai">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google Vertex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Model</Label>
              <Select defaultValue="gpt-4o">
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
            <Input type="number" defaultValue="0.4" min="0" max="1" step="0.05" />
            <p className="text-xs text-muted-foreground">
              Controls randomness in responses. Lower values (0-0.3) are more focused and deterministic, while higher values (0.7-1) are more creative and varied.
            </p>
          </div>
        </div>

        {/* STT */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Mic2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">STT (Speech-to-Text)</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue="deepgram">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepgram">Deepgram</SelectItem>
                  <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Model</Label>
              <Select defaultValue="nova-3">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nova-3">Nova-3</SelectItem>
                  <SelectItem value="nova-2">Nova-2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
        </div>

        {/* TTS */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">TTS (Text-to-Speech)</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select value={ttsProvider} onValueChange={handleTtsProviderChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  <SelectItem value="azure">Azure TTS</SelectItem>
                  <SelectItem value="google">Google TTS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Voice</Label>
              <Select value={selectedVoice} onValueChange={(v) => v && setSelectedVoice(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
        </div>
      </div>
    </WizardSection>
  )
}

// ─── Step 5: Voice (existing - unchanged) ───────────────────────────────────
function StepVoice({
  ttsProvider,
  selectedVoice,
}: {
  ttsProvider: string
  selectedVoice: string
}) {
  // Local tuning state
  const [language, setLanguage] = useState('en-US')
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0)
  const [stability, setStability] = useState(0.5)
  const [similarityBoost, setSimilarityBoost] = useState(0.75)
  const [fillerWords, setFillerWords] = useState('minimal')
  const [pitch, setPitch] = useState(0)
  const [loudness, setLoudness] = useState(0.8)
  const [emotionStyle, setEmotionStyle] = useState('neutral')
  const [expressiveness, setExpressiveness] = useState(0.6)
  const [interruptHandling, setInterruptHandling] = useState(true)
  const [silenceDetection, setSilenceDetection] = useState(true)
  const [backgroundNoiseSuppression, setBackgroundNoiseSuppression] = useState(true)

  // Get features for the selected TTS provider (from previous step)
  const features = providerFeatures[ttsProvider]

  // Find selected voice name for display
  const availableVoices = ttsProviderVoices[ttsProvider] ?? []
  const selectedVoiceName = availableVoices.find(v => v.id === selectedVoice)?.name ?? 'Unknown Voice'

  return (
    <WizardSection title="Voice Profile" description="Configure how your agent sounds.">
      <div className="flex flex-col gap-5">
        {/* Selected Voice Info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">{selectedVoiceName}</p>
              <p className="text-xs text-muted-foreground">
                {ttsProvider === 'elevenlabs' ? 'ElevenLabs' : ttsProvider === 'azure' ? 'Azure TTS' : 'Google TTS'}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Change the voice in the previous step (Providers).
          </p>
        </div>

        {/* Voice Tuning */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Voice Tuning</h3>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Language</Label>
              <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Speaking Speed ({speakingSpeed.toFixed(2)}×)</Label>
              <input type="range" min="0.5" max="2.0" step="0.05" value={speakingSpeed}
                onChange={(e) => setSpeakingSpeed(parseFloat(e.target.value))}
                className="w-full accent-primary" />
            </div>
          </FieldRow>
          <FieldRow>
            <div className={cn('flex flex-col gap-1.5', !features.pitch && 'opacity-50')}>
              <Label>Pitch ({pitch} semitones)</Label>
              <input type="range" min="-12" max="12" step="1" value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
                disabled={!features.pitch} className="w-full accent-primary" />
            </div>
            <div className={cn('flex flex-col gap-1.5', !features.stability && 'opacity-50')}>
              <Label>Stability ({(stability * 100).toFixed(0)}%)</Label>
              <input type="range" min="0" max="1" step="0.05" value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                disabled={!features.stability} className="w-full accent-primary" />
            </div>
          </FieldRow>
          <FieldRow>
            <div className={cn('flex flex-col gap-1.5', !features.similarityBoost && 'opacity-50')}>
              <Label>Similarity Boost ({(similarityBoost * 100).toFixed(0)}%)</Label>
              <input type="range" min="0" max="1" step="0.05" value={similarityBoost}
                onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                disabled={!features.similarityBoost} className="w-full accent-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Filler Words</Label>
              <Select value={fillerWords} onValueChange={(v) => v && setFillerWords(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <Separator />
          <div className={cn('flex flex-col gap-1.5', !features.style && 'opacity-50')}>
            <Label>Emotion / Style</Label>
            <Select value={emotionStyle} onValueChange={(v) => v && setEmotionStyle(v)} disabled={!features.style}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {emotionStyles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversation Audio */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Conversation Audio</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <p className="text-sm font-medium">Interrupt Handling</p>
              <Switch checked={interruptHandling} onCheckedChange={setInterruptHandling} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <p className="text-sm font-medium">Silence Detection</p>
              <Switch checked={silenceDetection} onCheckedChange={setSilenceDetection} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <p className="text-sm font-medium">Noise Suppression</p>
              <Switch checked={backgroundNoiseSuppression} onCheckedChange={setBackgroundNoiseSuppression} />
            </div>
          </div>
        </div>
      </div>
    </WizardSection>
  )
}

// ─── Step 6: Memory (NEW) ───────────────────────────────────────────────────
// function StepMemory() {
//   return (
//     <WizardSection title="Memory & Context" description="Control how the agent retains and uses conversation history.">
//       <div className="flex flex-col gap-4">
//         <div className="flex items-center justify-between rounded-lg border border-border p-4">
//           <div>
//             <p className="text-sm font-semibold">Conversation Memory</p>
//             <p className="text-xs text-muted-foreground">Remember caller preferences across sessions.</p>
//           </div>
//           <Switch defaultChecked />
//         </div>
//         <FieldRow>
//           <div className="flex flex-col gap-1.5">
//             <Label>Memory Scope</Label>
//             <Select defaultValue="workspace">
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="session">Session only</SelectItem>
//                 <SelectItem value="caller">Per caller ID</SelectItem>
//                 <SelectItem value="workspace">Workspace-wide</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <Label>Memory TTL (days)</Label>
//             <Select defaultValue="30">
//               <SelectTrigger><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="7">7 days</SelectItem>
//                 <SelectItem value="30">30 days</SelectItem>
//                 <SelectItem value="90">90 days</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </FieldRow>
//         <div className="flex flex-col gap-1.5">
//           <Label>Context Window Strategy</Label>
//           <Select defaultValue="sliding">
//             <SelectTrigger><SelectValue /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="sliding">Sliding window</SelectItem>
//               <SelectItem value="summarize">Auto-summarize older turns</SelectItem>
//               <SelectItem value="full">Full history</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     </WizardSection>
//   )
// }

// ─── Step 7: Knowledge (NEW) ────────────────────────────────────────────────
function StepKnowledge() {
  const [showNewKbDialog, setShowNewKbDialog] = useState(false)
  const [editingKb, setEditingKb] = useState<KnowledgeBase | null>(null)
  const [linkedIds, setLinkedIds] = useState<string[]>([])

  const linked = knowledgeBases.filter((kb) => linkedIds.includes(kb.id))
  const unlinked = knowledgeBases.filter((kb) => !linkedIds.includes(kb.id))

  function openEdit(kb: KnowledgeBase) {
    setEditingKb(kb)
    setShowNewKbDialog(true)
  }

  function openCreate() {
    setEditingKb(null)
    setShowNewKbDialog(true)
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setShowNewKbDialog(false)
      setEditingKb(null)
    }
  }

  return (
    <WizardSection title="Knowledge Base" description="Attach knowledge bases for document and URL access.">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attached ({linked.length})
        </p>
        {linked.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No knowledge bases attached yet.</p>
        )}
        {linked.map((kb) => (
          <div key={kb.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{kb.name}</p>
              <p className="text-xs text-muted-foreground">{kb.documents} docs · {kb.urls} URLs</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 gap-1"
              onClick={() => openEdit(kb)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="text-xs">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive h-7 px-2"
              onClick={() => setLinkedIds(prev => prev.filter(id => id !== kb.id))}
            >
              Detach
            </Button>
          </div>
        ))}

        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">
          Available ({unlinked.length})
        </p>
        {unlinked.map((kb) => (
          <div key={kb.id} className="flex items-center gap-3 rounded-lg border border-dashed border-border/60 p-3 opacity-70">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{kb.name}</p>
              <p className="text-xs text-muted-foreground">{kb.documents} docs · {kb.urls} URLs</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 gap-1"
              onClick={() => openEdit(kb)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="text-xs">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs"
              onClick={() => setLinkedIds(prev => [...prev, kb.id])}
            >
              Attach
            </Button>
          </div>
        ))}

        <Button
          size="sm"
          variant="outline"
          className="self-start gap-1.5 mt-1"
          onClick={openCreate}
        >
          <BookOpen className="h-4 w-4" /> Create New Knowledge Base
        </Button>
      </div>

      <NewKnowledgeBaseDialog
        open={showNewKbDialog}
        onOpenChange={handleDialogClose}
        editing={editingKb}
      />
    </WizardSection>
  )
}

// ─── Step 8: Tools (NEW) ────────────────────────────────────────────────────
function StepTools() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ToolItem | null>(null)
  const [tools, setTools] = useState<ToolItem[]>([
    { id: '1', name: 'lookup_order', description: 'Look up order status', type: 'REST API' },
    { id: '2', name: 'create_ticket', description: 'Create support ticket', type: 'REST API' },
    { id: '3', name: 'transfer_call', description: 'Transfer to human', type: 'Built-in' },
  ])

  return (
    <WizardSection title="Tools & Functions" description="Define functions the agent can call.">
      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <div key={tool.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold">{tool.name}</code>
                <Badge variant="outline" className="text-[10px] px-1.5">{tool.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(tool); setShowDialog(true) }}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1"
          onClick={() => { setEditingItem(null); setShowDialog(true) }}>
          <Wrench className="h-4 w-4" /> Add Custom Function
        </Button>
      </div>
      <AddToolDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(tool) => {
          if (editingItem) setTools(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...tool } : t))
          else setTools(prev => [...prev, { ...tool, id: `tool-${Date.now()}` }])
        }} />
    </WizardSection>
  )
}

// ─── Step 9: Pre-Call Actions (IMPROVED) ────────────────────────────────────
function StepPreCallActions() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PreCallAction | null>(null)
  const [actions, setActions] = useState<PreCallAction[]>([
    {
      id: '1',
      name: 'Customer Lookup',
      required: true,
      source: 'CRM Connection',
      sourceType: 'CRM API',
      lookupField: 'Phone Number',
      callerField: 'caller.phone_e164',
      targetField: 'phone',
      conditions: [{ field: 'Account Type', operator: 'equals', value: 'Customer' }],
      loadData: ['Customer name', 'Account status', 'Outstanding balance', 'Last interaction'],
      timeout: 3000,
      failureBehavior: 'proceed-partial'
    },
    {
      id: '2',
      name: 'Account Status',
      required: true,
      source: 'Billing API',
      sourceType: 'REST API',
      lookupField: 'Account ID',
      callerField: 'customer.account_id',
      targetField: 'id',
      conditions: [],
      loadData: ['Balance', 'Payment status', 'Due date'],
      timeout: 2000,
      failureBehavior: 'proceed-without'
    },
  ])

  return (
    <WizardSection title="Pre-Call Actions" description="Retrieve customer and context data before the call starts.">
      <DeterministicFlowStrip />
      
      <div className="flex flex-col gap-1">
        {actions.map((action, idx) => (
          <div key={action.id}>
            <div className="flex gap-3 rounded-lg border border-border p-4 bg-card">
              {/* Execution Order */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {idx + 1}
                </div>
              </div>

              {/* Action Details */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{action.name}</span>
                      <Badge variant={action.required ? 'default' : 'outline'} className="text-[10px]">
                        {action.required ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {action.sourceType} · {action.source}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => { setEditingItem(action); setShowDialog(true) }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* WHEN */}
                {action.conditions.length > 0 && (
                  <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                    <span className="font-semibold text-primary">WHEN</span>
                    <div className="mt-1 space-y-1">
                      {action.conditions.map((cond: PreCallCondition, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          {i > 0 && <span className="text-muted-foreground font-medium">AND</span>}
                          <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                            {cond.field} {cond.operator} {cond.value}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LOOKUP */}
                <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <span className="font-semibold text-primary">LOOKUP</span>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                      {action.callerField}
                    </code>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                      {action.targetField}
                    </code>
                  </div>
                </div>

                {/* LOAD INTO CONTEXT */}
                <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <span className="font-semibold text-primary">LOAD INTO CONTEXT</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {action.loadData.map((field: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* IF LOOKUP FAILS */}
                <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <span className="font-semibold text-primary">IF LOOKUP FAILS</span>
                  <div className="mt-1 text-muted-foreground">
                    {action.failureBehavior === 'proceed-partial' && 'Proceed with partial context'}
                    {action.failureBehavior === 'proceed-without' && 'Proceed without enrichment'}
                    {action.failureBehavior === 'stop' && 'Stop / fail pre-call'}
                  </div>
                </div>

                {/* Timeout */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Timeout: {(action.timeout / 1000).toFixed(1)}s</span>
                </div>
              </div>
            </div>

            {/* Connector */}
            {idx < actions.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {actions.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No pre-call actions configured
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className="self-start gap-1.5 mt-3"
          onClick={() => { setEditingItem(null); setShowDialog(true) }}
        >
          <Zap className="h-4 w-4" /> Add Pre-Call Action
        </Button>
      </div>

      <AddPreCallActionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editingItem={editingItem}
        onSave={(a) => {
          if (editingItem) {
            setActions(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...a } : x))
          } else {
            setActions(prev => [...prev, { ...a, id: `pre-${Date.now()}` }])
          }
        }}
      />
    </WizardSection>
  )
}

// ─── Step 10: Rules (NEW) ───────────────────────────────────────────────────
// ─── Step 10: Rules (IMPROVED) ──────────────────────────────────────────────
function StepRules() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<RuleItem | null>(null)
  const [testResult, setTestResult] = useState<{ ruleId: string; matched: boolean } | null>(null)
  const [rules, setRules] = useState<RuleItem[]>([
    {
      id: '1',
      name: 'Human Request',
      description: 'Transfer to human when requested',
      priority: 1,
      enabled: true,
      conditions: [
        { category: 'caller-request', field: 'request_type', operator: 'equals', value: 'human' }
      ],
      actionType: 'transfer',
      actionTarget: 'Support Queue'
    },
    {
      id: '2',
      name: 'Collections Escalation',
      description: 'Escalate overdue accounts',
      priority: 2,
      enabled: true,
      conditions: [
        { category: 'crm-context', field: 'days_overdue', operator: '>=', value: '30' },
        { category: 'crm-context', field: 'account_status', operator: 'equals', value: 'Overdue' }
      ],
      actionType: 'transfer',
      actionTarget: 'Collections Supervisor'
    },
  ])

  function testRule(rule: RuleItem) {
    // Dummy test evaluation
    const dummyContext = {
      days_overdue: 45,
      account_status: 'Overdue',
      request_type: 'human',
    }

    let matched = true
    for (const cond of rule.conditions) {
      const contextValue = (dummyContext as any)[cond.field]
      if (contextValue === undefined) {
        matched = false
        break
      }
      
      if (cond.operator === 'equals' && String(contextValue) !== cond.value) matched = false
      if (cond.operator === '>=') {
        const numVal = Number(contextValue)
        const threshold = Number(cond.value)
        if (isNaN(numVal) || isNaN(threshold) || numVal < threshold) matched = false
      }
    }

    setTestResult({ ruleId: rule.id, matched })
    setTimeout(() => setTestResult(null), 3000)
  }

  return (
    <WizardSection title="Rules & Policies" description="Deterministic WHEN → THEN decisions that govern agent behavior.">
      <div className="flex flex-col gap-3">
        {rules.map((rule) => (
          <div key={rule.id} className="flex gap-3 rounded-lg border border-border p-4 bg-card">
            {/* Priority */}
            <div className="flex flex-col items-center gap-1">
              <Badge variant="outline" className="text-xs font-semibold px-2">
                P{rule.priority}
              </Badge>
            </div>

            {/* Rule Details */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{rule.name}</span>
                    <Badge variant={rule.enabled ? 'default' : 'outline'} className="text-[10px]">
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  {rule.description && (
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 gap-1"
                    onClick={() => testRule(rule)}
                  >
                    <Play className="h-3 w-3" />
                    <span className="text-xs">Test</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => { setEditingItem(rule); setShowDialog(true) }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Test Result */}
              {testResult?.ruleId === rule.id && testResult !== null && (
                <div className={cn(
                  'rounded border p-2 text-xs',
                  testResult.matched
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700'
                    : 'border-muted bg-muted/30 text-muted-foreground'
                )}>
                  <div className="flex items-center gap-2">
                    {testResult.matched ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    <span className="font-medium">
                      {testResult.matched ? 'Condition matched' : 'Condition not matched'}
                    </span>
                  </div>
                </div>
              )}

              {/* WHEN */}
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">WHEN</span>
                <div className="mt-1 space-y-1">
                  {rule.conditions.map((cond: PreCallCondition, i: number) => (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      {i > 0 && <span className="text-muted-foreground font-medium">AND</span>}
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                        {cond.field}
                      </code>
                      <span className="text-muted-foreground">{cond.operator}</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                        {cond.value}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* THEN */}
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">THEN</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground capitalize">{rule.actionType}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                    {rule.actionTarget}
                  </code>
                </div>
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No rules configured
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className="self-start gap-1.5 mt-1"
          onClick={() => { setEditingItem(null); setShowDialog(true) }}
        >
          <Shield className="h-4 w-4" /> Add Rule
        </Button>
      </div>

      <AddRuleDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editingItem={editingItem}
        onSave={(r) => {
          if (editingItem) {
            setRules(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...r } : x))
          } else {
            setRules(prev => [...prev, { ...r, id: `rule-${Date.now()}` }])
          }
        }}
      />
    </WizardSection>
  )
}

// ─── Step 11: Guardrails (NEW) ──────────────────────────────────────────────
// ─── Step 11: Guardrails (IMPROVED) ─────────────────────────────────────────
function StepGuardrails() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<GuardrailItem | null>(null)
  const [testResult, setTestResult] = useState<{ guardrailId: string; triggered: boolean } | null>(null)
  const [guardrails, setGuardrails] = useState<GuardrailItem[]>([
    {
      id: '1',
      name: 'PII Protection',
      description: 'Prevent collection of sensitive personal information',
      priority: 1,
      enabled: true,
      protectedData: ['SSN', 'Card number', 'Bank account'],
      conditions: [],
      checkBefore: true,
      checkAfter: true,
      action: 'block',
      safeResponse: "I can't collect that information for security reasons. Let me help you with something else."
    },
    {
      id: '2',
      name: 'Profanity Filter',
      description: 'Block inappropriate language',
      priority: 2,
      enabled: true,
      protectedData: ['Profanity'],
      conditions: [],
      checkBefore: false,
      checkAfter: true,
      action: 'redact',
      safeResponse: "Let's keep our conversation professional."
    },
  ])

  function testGuardrail(guardrail: GuardrailItem) {
    // Dummy test - check if input would trigger
    const dummyInput = "I want to give you my card number..."
    const triggered = guardrail.protectedData.some((p: string) =>
      dummyInput.toLowerCase().includes(p.toLowerCase())
    )
    setTestResult({ guardrailId: guardrail.id, triggered })
    setTimeout(() => setTestResult(null), 3000)
  }

  return (
    <WizardSection title="Guardrails" description="Deterministic policies that protect and restrict agent behavior.">
      <div className="flex flex-col gap-3">
        {guardrails.map((g) => (
          <div key={g.id} className="flex gap-3 rounded-lg border border-border p-4 bg-card">
            {/* Priority */}
            <div className="flex flex-col items-center gap-1">
              <Badge variant="outline" className="text-xs font-semibold px-2">
                P{g.priority}
              </Badge>
            </div>

            {/* Guardrail Details */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{g.name}</span>
                    <Badge variant={g.enabled ? 'default' : 'outline'} className="text-[10px]">
                      {g.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  {g.description && (
                    <p className="text-xs text-muted-foreground">{g.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 gap-1"
                    onClick={() => testGuardrail(g)}
                  >
                    <Play className="h-3 w-3" />
                    <span className="text-xs">Test</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => { setEditingItem(g); setShowDialog(true) }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Test Result */}
              {testResult?.guardrailId === g.id && testResult !== null &&(
                <div className={cn(
                  'rounded border p-2 text-xs',
                  testResult.triggered
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700'
                    : 'border-muted bg-muted/30 text-muted-foreground'
                )}>
                  <div className="flex items-center gap-2">
                    {testResult.triggered ? (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    <span className="font-medium">
                      {testResult.triggered ? 'Guardrail triggered' : 'No violation detected'}
                    </span>
                  </div>
                </div>
              )}

              {/* Protects */}
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">PROTECTS</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {g.protectedData.map((data: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {data}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">ACTION</span>
                <div className="mt-1 capitalize text-muted-foreground">
                  {g.action === 'block' && 'Block response'}
                  {g.action === 'redact' && 'Redact content'}
                  {g.action === 'replace' && 'Replace with safe response'}
                  {g.action === 'transfer' && 'Transfer to human'}
                  {g.action === 'end-call' && 'End call'}
                </div>
              </div>

              {/* Checks */}
              <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                <span className="font-semibold text-primary">CHECKS</span>
                <div className="mt-1 flex flex-wrap gap-2 text-muted-foreground">
                  {g.checkBefore && <span>Pre-generation</span>}
                  {g.checkBefore && g.checkAfter && <span>·</span>}
                  {g.checkAfter && <span>Post-generation</span>}
                </div>
              </div>

              {/* Safe Response Preview */}
              {g.safeResponse && (
                <div className="rounded border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <span className="font-semibold text-primary">SAFE RESPONSE</span>
                  <p className="mt-1 text-muted-foreground italic">"{g.safeResponse}"</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {guardrails.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No guardrails configured
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className="self-start gap-1.5 mt-1"
          onClick={() => { setEditingItem(null); setShowDialog(true) }}
        >
          <ShieldAlert className="h-4 w-4" /> Add Guardrail
        </Button>
      </div>

      <AddGuardrailDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editingItem={editingItem}
        onSave={(g) => {
          if (editingItem) {
            setGuardrails(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...g } : x))
          } else {
            setGuardrails(prev => [...prev, { ...g, id: `guard-${Date.now()}` }])
          }
        }}
      />
    </WizardSection>
  )
}

// ─── Step 12: Data Extraction (NEW) ─────────────────────────────────────────
function StepDataExtraction() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ExtractionField | null>(null)
  const [fields, setFields] = useState<ExtractionField[]>([
    { id: '1', name: 'customer_name', type: 'String', description: '', confidence: 95, lowConfidenceBehavior: 'clarify', required: true },
    { id: '2', name: 'order_id', type: 'String', description: '', confidence: 92, lowConfidenceBehavior: 'clarify', required: true },
  ])

  return (
    <WizardSection title="Data Extraction" description="Fields to extract from conversations.">
      <div className="flex flex-col gap-3">
        {fields.map((f) => (
          <div key={f.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Database className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold">{f.name}</code>
                <Badge variant="outline" className="text-[10px] px-1.5">{f.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Confidence: {f.confidence}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(f); setShowDialog(true) }}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"
                onClick={() => setFields(prev => prev.filter(x => x.id !== f.id))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1"
          onClick={() => { setEditingItem(null); setShowDialog(true) }}>
          <Database className="h-4 w-4" /> Add Field
        </Button>
      </div>
      <AddExtractionFieldDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(f) => {
          if (editingItem) setFields(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...f } : x))
          else setFields(prev => [...prev, { ...f, id: `field-${Date.now()}` }])
        }} />
    </WizardSection>
  )
}

// ─── Step 13: Post-Call Actions (NEW) ───────────────────────────────────────
function StepPostCallActions() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PostCallAction | null>(null)
  const [actions, setActions] = useState<PostCallAction[]>([
    { id: '1', name: 'Update CRM', actionType: 'CRM Update', trigger: 'Call Completed', payload: '{}', retryBehavior: '3', failureHandling: 'log' },
    { id: '2', name: 'Save Outcome', actionType: 'Function', trigger: 'Call Completed', payload: '{}', retryBehavior: '3', failureHandling: 'log' },
  ])

  return (
    <WizardSection title="Post-Call Actions" description="Actions after the call finishes.">
      <div className="flex flex-col gap-3">
        {actions.map((a) => (
          <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Send className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{a.name}</span>
                <Badge variant="outline" className="text-[10px] px-1.5">{a.actionType}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Trigger: {a.trigger}</p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingItem(a); setShowDialog(true) }}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1"
          onClick={() => { setEditingItem(null); setShowDialog(true) }}>
          <Send className="h-4 w-4" /> Add Post-Call Action
        </Button>
      </div>
      <AddPostCallActionDialog open={showDialog} onOpenChange={setShowDialog} editingItem={editingItem}
        onSave={(a) => {
          if (editingItem) setActions(prev => prev.map(x => x.id === editingItem.id ? { ...x, ...a } : x))
          else setActions(prev => [...prev, { ...a, id: `post-${Date.now()}` }])
        }} />
    </WizardSection>
  )
}

// ─── Step 14: Intelligence (NEW) ────────────────────────────────────────────
function StepIntelligence() {
  const [useFlow, setUseFlow] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState('')

  const flows = [
    { id: 'appointment-booking', name: 'Appointment Booking' },
    { id: 'customer-support', name: 'Customer Support' },
    { id: 'lead-qualification', name: 'Lead Qualification' },
    { id: 'payment-collection', name: 'Payment Collection' },
  ]

  return (
    <WizardSection title="Intelligence Layer" description="Advanced reasoning and conversation patterns.">
      <div className="flex flex-col gap-4">
        {/* Conversation Flow */}
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Workflow className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Use Conversation Flow</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Follow a structured conversation pattern (optional).
              </p>
            </div>
            <Switch checked={useFlow} onCheckedChange={setUseFlow} />
          </div>
          {useFlow && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <Label className="text-xs font-medium">Select Pattern</Label>
              <Select value={selectedFlow} onValueChange={(v) => v && setSelectedFlow(v)}>
                <SelectTrigger><SelectValue placeholder="Choose pattern..." /></SelectTrigger>
                <SelectContent>
                  {flows.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Intelligence Features */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Intelligence Features
          </p>
          {[
            { label: 'Sentiment Analysis', desc: 'Detect caller sentiment in real-time.', enabled: true },
            { label: 'Intent Classification', desc: 'Classify intent at each turn.', enabled: true },
            { label: 'Call Summarization', desc: 'Generate call summary at end.', enabled: true },
            { label: 'Real-time Coaching', desc: 'Live suggestions for human agents.', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.enabled} />
            </div>
          ))}
        </div>
      </div>
    </WizardSection>
  )
}