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
  Eye, Lock, AlertCircle, Workflow
} from 'lucide-react'
import { NewKnowledgeBaseDialog } from '@/components/agents/dialogs/new-knowledge-base-dialog'
import {
  AddToolDialog, AddPreCallActionDialog, AddRuleDialog,
  AddExtractionFieldDialog, AddPostCallActionDialog,
  type ToolItem, type PreCallAction, type RuleItem,
  type ExtractionField, type PostCallAction
} from '@/components/agents/dialogs'


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

const sections = [
  { id: 'info', label: 'Agent Info', icon: Bot },
  { id: 'prompt', label: 'System Instructions', icon: MessageSquareText },
  { id: 'providers', label: 'AI Providers', icon: Settings2 },
  { id: 'voice', label: 'Voice & Audio', icon: Mic2 },
  { id: 'memory', label: 'Memory & Context', icon: Brain },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'tools', label: 'Tools & Functions', icon: Wrench },
  { id: 'precall', label: 'Pre-Call Actions', icon: Zap },
  { id: 'rules', label: 'Rules & Policies', icon: Shield },
  { id: 'guardrails', label: 'Guardrails', icon: ShieldAlert },
  { id: 'extraction', label: 'Data Extraction', icon: Database },
  { id: 'postcall', label: 'Post-Call Actions', icon: Send },
  { id: 'intelligence', label: 'Intelligence Layer', icon: Layers },
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
            <ChevronLeft className="h-4 w-4 mr-1" />
            {agent.name}
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-xl font-semibold">Configure Agent</h1>
          <Badge variant="outline" className="font-mono text-xs">v{agent.version}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button size="sm" render={<Link href={`/agents/${agent.id}/publish`} />} nativeButton={false} className="gap-1.5">
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        {/* Section Nav */}
        <nav className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left',
                  activeSection === s.id
                    ? 'bg-primary/10 text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
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
            <Button size="sm">
              <Save className="h-4 w-4 mr-1.5" />
              Save Section
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helper Components ──────────────────────────────────────────────────────
function ConfigSection({ title, description, children }: {
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

function UnsupportedBadge({ feature }: { feature: string }) {
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground border-dashed gap-1">
      <Info className="h-2.5 w-2.5" />
      Not supported by {feature}
    </Badge>
  )
}

// ─── Section 1: Agent Info ──────────────────────────────────────────────────
function SectionInfo({ agent }: { agent: Agent }) {
  const [callingSettings, setCallingSettings] = useState({
    callingHoursStart: '09:00',
    callingHoursEnd: '18:00',
    callingDays: 'weekdays',
    defaultVoice: 'neural-female-en',
    maxCallDuration: 15,
    callRecording: true,
    transcription: true,
  })

  function updateCallingSetting<K extends keyof typeof callingSettings>(
    key: K,
    value: typeof callingSettings[K]
  ) {
    setCallingSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <ConfigSection title="Agent Information" description="Core identity, classification, and calling configuration.">
      <div className="flex flex-col gap-4">
        {/* Basic Info */}
        <div className="flex flex-col gap-1.5">
          <Label>Agent Name</Label>
          <Input defaultValue={agent.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Description</Label>
          <Textarea defaultValue={agent.description} rows={3} />
        </div>
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
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="de-DE">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldRow>
        <div className="flex flex-col gap-1.5">
          <Label>Tags</Label>
          <Input defaultValue={agent.tags.join(', ')} placeholder="Comma-separated tags" />
        </div>

        <Separator />

        {/* Calling & Voice Configuration */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Calling & Voice Configuration</h3>
          </div>

          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Calling Hours Start</Label>
              <Input 
                type="time" 
                value={callingSettings.callingHoursStart}
                onChange={(e) => updateCallingSetting('callingHoursStart', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Calling Hours End</Label>
              <Input 
                type="time" 
                value={callingSettings.callingHoursEnd}
                onChange={(e) => updateCallingSetting('callingHoursEnd', e.target.value)}
              />
            </div>
          </FieldRow>

          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Calling Days</Label>
              <Select 
                value={callingSettings.callingDays} 
                onValueChange={(v) => v && updateCallingSetting('callingDays', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekdays">Weekdays (Mon–Fri)</SelectItem>
                  <SelectItem value="all">All days</SelectItem>
                  <SelectItem value="custom">Custom schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Default Voice</Label>
              <Select 
                value={callingSettings.defaultVoice} 
                onValueChange={(v) => v && updateCallingSetting('defaultVoice', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="neural-female-en">Neural Female (English)</SelectItem>
                  <SelectItem value="neural-male-en">Neural Male (English)</SelectItem>
                  <SelectItem value="elevenlabs-rachel">ElevenLabs — Rachel</SelectItem>
                  <SelectItem value="elevenlabs-adam">ElevenLabs — Adam</SelectItem>
                  <SelectItem value="azure-aria">Azure Neural — Aria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>

          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Max Call Duration (minutes)</Label>
              <Input 
                type="number" 
                value={callingSettings.maxCallDuration}
                onChange={(e) => updateCallingSetting('maxCallDuration', parseInt(e.target.value) || 15)}
              />
              <p className="text-xs text-muted-foreground">Maximum duration before automatic call termination</p>
            </div>
          </FieldRow>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Call Recording</p>
                <p className="text-xs text-muted-foreground">Record all calls by default</p>
              </div>
              <Switch 
                checked={callingSettings.callRecording} 
                onCheckedChange={(v) => updateCallingSetting('callRecording', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Transcription</p>
                <p className="text-xs text-muted-foreground">Transcribe all calls by default</p>
              </div>
              <Switch 
                checked={callingSettings.transcription} 
                onCheckedChange={(v) => updateCallingSetting('transcription', v)}
              />
            </div>
          </div>
        </div>
      </div>
    </ConfigSection>
  )
}

// ─── Section 2: System Instructions ─────────────────────────────────────────
function SectionPrompt({ prompt }: { prompt: string }) {
  return (
    <ConfigSection title="System Instructions" description="Define the agent's role, behavior, and communication style.">
      <div className="flex flex-col gap-4">
        <FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Agent Role</Label>
            <Input defaultValue="Customer Support Agent" placeholder="e.g. Sales Representative, Technical Support" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Primary Objective</Label>
            <Input defaultValue="Resolve customer inquiries efficiently and maintain high satisfaction" placeholder="What should the agent achieve?" />
          </div>
        </FieldRow>

        <div className="flex flex-col gap-1.5">
          <Label>General Behavior</Label>
          <Textarea
            rows={4}
            defaultValue="Be helpful, patient, and professional. Always verify customer identity before accessing account information. Provide clear, concise responses and confirm understanding before proceeding."
            placeholder="Describe how the agent should behave in general..."
          />
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
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldRow>

        <div className="flex flex-col gap-1.5">
          <Label>General Constraints</Label>
          <Textarea
            rows={3}
            defaultValue="Never provide medical, legal, or financial advice. Do not make promises about specific outcomes. Always offer to transfer to a human agent if the issue cannot be resolved."
            placeholder="What should the agent never do?"
          />
        </div>

        <Separator />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label>System Prompt (Advanced)</Label>
            <span className="text-xs text-muted-foreground">
              {prompt.split(/\s+/).filter(Boolean).length} words · est. {Math.ceil(prompt.length / 4)} tokens
            </span>
          </div>
          <Textarea defaultValue={prompt} rows={12} className="font-mono text-xs leading-relaxed" />
          <p className="text-xs text-muted-foreground">
            Full system prompt for advanced control. This overrides the structured fields above when provided.
          </p>
        </div>

        <Separator />

        <FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Welcome Message</Label>
            <Textarea rows={3} defaultValue="Thank you for calling Acme Corp. My name is Alex, and I'm here to help you today. Could I please get your name and order number to get started?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fallback Message</Label>
            <Textarea rows={3} defaultValue="I apologize, I didn't quite catch that. Could you please repeat your question?" />
          </div>
        </FieldRow>
      </div>
    </ConfigSection>
  )
}

// ─── Section 3: AI Providers ────────────────────────────────────────────────
function SectionProviders({ agent }: { agent: Agent }) {
  const [ttsProvider, setTtsProvider] = useState(agent.ttsProvider.toLowerCase().replace(' ', '-'))
  const capabilities = ttsProviderCapabilities[ttsProvider] ?? ttsProviderCapabilities.elevenlabs

  return (
    <ConfigSection title="AI Provider Configuration" description="Configure LLM, STT, and TTS providers with routing and fallback settings.">
      <div className="flex flex-col gap-4">
        {/* LLM */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Large Language Model (LLM)</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue={agent.llmProvider.toLowerCase()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google Vertex</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
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
                  <SelectItem value="claude-3.5-sonnet">claude-3.5-sonnet</SelectItem>
                  <SelectItem value="claude-3-haiku">claude-3-haiku</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Temperature</Label>
              <Input type="number" defaultValue={agent.temperature} min="0" max="1" step="0.05" />
              <p className="text-xs text-muted-foreground">Lower = more deterministic. Higher = more creative.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Context Window (tokens)</Label>
              <Select defaultValue={String(agent.contextWindow)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4096">4,096</SelectItem>
                  <SelectItem value="8192">8,192</SelectItem>
                  <SelectItem value="16384">16,384</SelectItem>
                  <SelectItem value="32768">32,768</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Fallback Provider</Label>
            <Select defaultValue="none">
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="anthropic">Anthropic — claude-3-haiku</SelectItem>
                <SelectItem value="google">Google Vertex — gemini-1.5-flash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* STT */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Mic2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Speech-to-Text (STT)</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue={agent.sttProvider.toLowerCase().replace(' ', '-')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepgram">Deepgram</SelectItem>
                  <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                  <SelectItem value="google-stt">Google STT</SelectItem>
                  <SelectItem value="azure-speech">Azure Speech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Model Tier</Label>
              <Select defaultValue="nova-3">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nova-3">Nova-3 (Latest)</SelectItem>
                  <SelectItem value="nova-2">Nova-2</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
        </div>

        {/* TTS */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Text-to-Speech (TTS)</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select value={ttsProvider} onValueChange={(v) => v && setTtsProvider(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  <SelectItem value="azure-tts">Azure TTS</SelectItem>
                  <SelectItem value="google-tts">Google TTS</SelectItem>
                  <SelectItem value="amazon-polly">Amazon Polly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Voice</Label>
              <Select defaultValue={agent.voice.toLowerCase()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rachel">Rachel</SelectItem>
                  <SelectItem value="dorothy">Dorothy</SelectItem>
                  <SelectItem value="james">James</SelectItem>
                  <SelectItem value="aria">Aria</SelectItem>
                  <SelectItem value="elli">Elli</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>

          {/* Provider Capabilities */}
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Provider Capabilities (determines available voice settings)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <CapIndicator label="Stability" supported={capabilities.stability} />
              <CapIndicator label="Similarity Boost" supported={capabilities.similarityBoost} />
              <CapIndicator label="Pitch Control" supported={capabilities.pitch} />
              <CapIndicator label="Volume Control" supported={capabilities.volume} />
              <CapIndicator label="Emotion/Style" supported={capabilities.style} />
              <CapIndicator label="Expressiveness" supported={capabilities.expressiveness} />
              <CapIndicator label="Voice Cloning" supported={capabilities.voiceCloning} />
              <CapIndicator label="Multilingual" supported={capabilities.multilingual} />
              <CapIndicator label="Low-latency" supported={capabilities.lowLatency} />
            </div>
          </div>
        </div>
      </div>
    </ConfigSection>
  )
}

function CapIndicator({ label, supported }: { label: string; supported: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 text-[11px]',
      supported ? 'text-foreground' : 'text-muted-foreground opacity-60',
    )}>
      {supported ? (
        <CheckCircle2 className="h-3 w-3 text-[var(--status-active)]" />
      ) : (
        <XCircle className="h-3 w-3 text-muted-foreground" />
      )}
      <span>{label}</span>
    </div>
  )
}

// ─── Section 4: Voice & Audio ───────────────────────────────────────────────
function SectionVoice({ agent }: { agent: Agent }) {
  const [ttsProvider] = useState(agent.ttsProvider.toLowerCase().replace(' ', '-'))
  const capabilities = ttsProviderCapabilities[ttsProvider] ?? ttsProviderCapabilities.elevenlabs

  return (
    <ConfigSection title="Voice & Audio Configuration" description="Fine-tune the agent's vocal characteristics and speech patterns.">
      <div className="flex flex-col gap-5">
        {/* Voice Selection */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Voice Selection</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>TTS Provider</Label>
              <Select defaultValue={ttsProvider} disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  <SelectItem value="azure-tts">Azure TTS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Voice</Label>
              <Select defaultValue={agent.voice.toLowerCase()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rachel">Rachel</SelectItem>
                  <SelectItem value="dorothy">Dorothy</SelectItem>
                  <SelectItem value="james">James</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Voice ID</Label>
              <Input defaultValue="21m00Tcm4TlvDq8ikWAM" className="font-mono text-xs" readOnly />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Language</Label>
              <Select defaultValue={agent.language}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <div className="rounded-md border border-border bg-accent/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Voice Preview</p>
                <p className="text-xs text-muted-foreground mt-0.5">"Thank you for calling Acme Corp. My name is Alex."</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Play className="h-3.5 w-3.5" />
                Play
              </Button>
            </div>
          </div>
        </div>

        {/* Speech Characteristics */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Speech Characteristics</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Speaking Speed (1.0×)</Label>
              <Select defaultValue="normal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow (0.85×)</SelectItem>
                  <SelectItem value="normal">Normal (1.0×)</SelectItem>
                  <SelectItem value="fast">Fast (1.15×)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={cn('flex flex-col gap-1.5', !capabilities.pitch && 'opacity-50 pointer-events-none')}>
              <div className="flex items-center justify-between">
                <Label>Pitch (0 semitones)</Label>
                {!capabilities.pitch && <UnsupportedBadge feature={ttsProvider} />}
              </div>
              <Input type="number" defaultValue="0" min="-12" max="12" disabled={!capabilities.pitch} />
            </div>
          </FieldRow>
          <FieldRow>
            <div className={cn('flex flex-col gap-1.5', !capabilities.volume && 'opacity-50 pointer-events-none')}>
              <div className="flex items-center justify-between">
                <Label>Volume (80%)</Label>
                {!capabilities.volume && <UnsupportedBadge feature={ttsProvider} />}
              </div>
              <Input type="number" defaultValue="80" min="0" max="100" disabled={!capabilities.volume} />
            </div>
            <div className={cn('flex flex-col gap-1.5', !capabilities.stability && 'opacity-50 pointer-events-none')}>
              <div className="flex items-center justify-between">
                <Label>Stability (0.5)</Label>
                {!capabilities.stability && <UnsupportedBadge feature={ttsProvider} />}
              </div>
              <Input type="number" defaultValue="0.5" min="0" max="1" step="0.05" disabled={!capabilities.stability} />
            </div>
          </FieldRow>
          <FieldRow>
            <div className={cn('flex flex-col gap-1.5', !capabilities.similarityBoost && 'opacity-50 pointer-events-none')}>
              <div className="flex items-center justify-between">
                <Label>Similarity Boost (0.75)</Label>
                {!capabilities.similarityBoost && <UnsupportedBadge feature={ttsProvider} />}
              </div>
              <Input type="number" defaultValue="0.75" min="0" max="1" step="0.05" disabled={!capabilities.similarityBoost} />
            </div>
            <div className={cn('flex flex-col gap-1.5', !capabilities.style && 'opacity-50 pointer-events-none')}>
              <div className="flex items-center justify-between">
                <Label>Emotion / Style</Label>
                {!capabilities.style && <UnsupportedBadge feature={ttsProvider} />}
              </div>
              <Select defaultValue="neutral" disabled={!capabilities.style}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <FieldRow>
            <div className={cn('flex flex-col gap-1.5', !capabilities.expressiveness && 'opacity-50 pointer-events-none')}>
              <div className="flex items-center justify-between">
                <Label>Expressiveness (0.6)</Label>
                {!capabilities.expressiveness && <UnsupportedBadge feature={ttsProvider} />}
              </div>
              <Input type="number" defaultValue="0.6" min="0" max="1" step="0.05" disabled={!capabilities.expressiveness} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Filler Words</Label>
              <Select defaultValue="minimal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="minimal">Minimal (uh, um)</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
        </div>

        {/* Conversation Audio */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Conversation Audio</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Interrupt Handling</p>
                <p className="text-[11px] text-muted-foreground">Allow barge-in</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Silence Detection</p>
                <p className="text-[11px] text-muted-foreground">5s timeout</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Noise Suppression</p>
                <p className="text-[11px] text-muted-foreground">Background noise</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Turn Detection</Label>
              <Select defaultValue="automatic">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic (AI-driven)</SelectItem>
                  <SelectItem value="vad">VAD-based</SelectItem>
                  <SelectItem value="manual">Manual (timeout only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>VAD Sensitivity (70%)</Label>
              <Input type="number" defaultValue="70" min="0" max="100" />
            </div>
          </FieldRow>
        </div>

        {/* Multilingual */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Multilingual Support</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Primary Language</Label>
              <Select defaultValue={agent.language}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-US">Spanish (US)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Supported Languages</Label>
              <Input defaultValue="en-US, es-US, fr-FR" placeholder="Comma-separated" />
            </div>
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Auto Language Detection</p>
                <p className="text-[11px] text-muted-foreground">Detect caller language</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Mid-call Switching</p>
                <p className="text-[11px] text-muted-foreground">Allow language change</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </ConfigSection>
  )
}

// ─── Section 5: Memory & Context (unchanged) ────────────────────────────────
function SectionMemory({ agent }: { agent: Agent }) {
  return (
    <ConfigSection title="Memory & Context" description="Control how the agent retains and uses conversation history.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-semibold">Conversation Memory</p>
            <p className="text-xs text-muted-foreground">Remember caller preferences and history across sessions.</p>
          </div>
          <Switch defaultChecked={agent.memoryEnabled} />
        </div>
        <FieldRow>
          <div className="flex flex-col gap-1.5">
            <Label>Memory Scope</Label>
            <Select defaultValue="workspace">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="session">Session only</SelectItem>
                <SelectItem value="caller">Per caller ID</SelectItem>
                <SelectItem value="workspace">Workspace-wide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Memory TTL (days)</Label>
            <Select defaultValue="30">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldRow>
        <div className="flex flex-col gap-1.5">
          <Label>Context Window Strategy</Label>
          <Select defaultValue="sliding">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sliding">Sliding window (keep most recent)</SelectItem>
              <SelectItem value="summarize">Auto-summarize older turns</SelectItem>
              <SelectItem value="full">Full history (up to context limit)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ConfigSection>
  )
}

// ─── Section 6: Knowledge Base (unchanged) ──────────────────────────────────
function SectionKnowledge({ agent }: { agent: Agent }) {
  const [showNewKbDialog, setShowNewKbDialog] = useState(false)
  const [linkedIds, setLinkedIds] = useState<string[]>(agent.knowledgeBases)

  const linked = knowledgeBases.filter((kb) => linkedIds.includes(kb.id))
  const unlinked = knowledgeBases.filter((kb) => !linkedIds.includes(kb.id))

  function handleAttach(kbId: string) {
    setLinkedIds(prev => [...prev, kbId])
  }

  function handleDetach(kbId: string) {
    setLinkedIds(prev => prev.filter(id => id !== kbId))
  }

  function handleCreateNewKb(data: { name: string; description: string }) {
    // In a real app, this would create the KB via API and add it to linkedIds
    console.log('Creating new KB:', data)
    alert(`Knowledge base "${data.name}" would be created and attached to this agent.`)
  }

  return (
    <ConfigSection title="Knowledge Base" description="Attach knowledge bases to give the agent access to documents and URLs.">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attached ({linked.length})
        </p>
        {linked.map((kb) => (
          <div key={kb.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{kb.name}</p>
              <p className="text-xs text-muted-foreground">
                {kb.documents} docs · {kb.urls} URLs · {(kb.tokens / 1000).toFixed(0)}k tokens
              </p>
            </div>
            <Badge variant="outline" className="border-[var(--status-active)]/30 text-[var(--status-active)] text-[10px]">
              {kb.status}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive h-7 px-2"
              onClick={() => handleDetach(kb.id)}
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
            <div className="flex-1">
              <p className="text-sm font-medium">{kb.name}</p>
              <p className="text-xs text-muted-foreground">{kb.documents} docs · {kb.urls} URLs</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs"
              onClick={() => handleAttach(kb.id)}
            >
              Attach
            </Button>
          </div>
        ))}

        <Button
          size="sm"
          variant="outline"
          className="self-start gap-1.5 mt-1"
          onClick={() => setShowNewKbDialog(true)}
        >
          <BookOpen className="h-4 w-4" />
          Create New Knowledge Base
        </Button>
      </div>

      {/* Reusable dialog */}
      <NewKnowledgeBaseDialog
        open={showNewKbDialog}
        onOpenChange={setShowNewKbDialog}
        onSave={handleCreateNewKb}
      />
    </ConfigSection>
  )
}

// ─── Section 7: Tools & Functions ───────────────────────────────────────────
function SectionTools() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ToolItem | null>(null)
  const [tools, setTools] = useState<ToolItem[]>([
    { id: 'lookup_order', name: 'lookup_order', description: 'Look up order status by order ID or email address.', type: 'REST API', endpoint: '/api/orders', httpMethod: 'GET', authentication: 'api-key', timeout: 5000, retryPolicy: '3' },
    { id: 'create_ticket', name: 'create_ticket', description: 'Create a support ticket in the CRM system.', type: 'REST API', endpoint: '/api/tickets', httpMethod: 'POST', authentication: 'bearer', timeout: 5000, retryPolicy: '3' },
    { id: 'transfer_call', name: 'transfer_call', description: 'Transfer the active call to a specified queue or agent.', type: 'Built-in' },
    { id: 'get_calendar', name: 'get_calendar', description: 'Retrieve available appointment slots from the scheduling system.', type: 'REST API', endpoint: '/api/calendar', httpMethod: 'GET', authentication: 'api-key', timeout: 5000, retryPolicy: '3' },
    { id: 'send_sms', name: 'send_sms', description: 'Send an SMS follow-up to the caller\'s phone number.', type: 'REST API', endpoint: '/api/sms', httpMethod: 'POST', authentication: 'api-key', timeout: 5000, retryPolicy: '3' },
  ])

  function openAdd() {
    setEditingItem(null)
    setShowDialog(true)
  }

  function openEdit(tool: ToolItem) {
    setEditingItem(tool)
    setShowDialog(true)
  }

  function handleSave(tool: ToolItem) {
    if (editingItem) {
      setTools(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...tool } : t))
    } else {
      setTools(prev => [...prev, { ...tool, id: `tool-${Date.now()}` }])
    }
  }

  return (
    <ConfigSection title="Tools & Function Calling" description="Define functions the agent can call during conversations.">
      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <div key={tool.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold">{tool.name}</code>
                <Badge variant="outline" className={cn('text-[10px] px-1.5',
                  tool.type === 'Built-in' ? 'border-primary/30 text-primary' : 'border-border'
                )}>{tool.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(tool)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={openAdd}>
          <Wrench className="h-4 w-4" />
          Add Custom Function
        </Button>
      </div>

      <AddToolDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </ConfigSection>
  )
}

// ─── Section 8: Pre-Call Actions ────────────────────────────────────────────
function SectionPreCallActions() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PreCallAction | null>(null)
  const [actions, setActions] = useState<PreCallAction[]>([
    { id: 'customer_lookup', name: 'Customer Lookup', type: 'Function', source: 'CRM API', endpoint: '/api/customers', conditions: '', timeout: 3000, failureBehavior: 'proceed-partial', required: true },
    { id: 'account_status', name: 'Account Status Check', type: 'REST API', source: 'Billing System', endpoint: '/api/accounts', conditions: '', timeout: 3000, failureBehavior: 'proceed-partial', required: true },
    { id: 'eligibility_check', name: 'Eligibility Verification', type: 'Business Rule', source: 'Internal', endpoint: '', conditions: '', timeout: 3000, failureBehavior: 'proceed', required: false },
    { id: 'crm_enrichment', name: 'CRM Data Enrichment', type: 'Data Enrichment', source: 'Salesforce', endpoint: '/api/enrich', conditions: '', timeout: 3000, failureBehavior: 'proceed', required: false },
  ])

  function openAdd() { setEditingItem(null); setShowDialog(true) }
  function openEdit(action: PreCallAction) { setEditingItem(action); setShowDialog(true) }

  function handleSave(action: PreCallAction) {
    if (editingItem) {
      setActions(prev => prev.map(a => a.id === editingItem.id ? { ...a, ...action } : a))
    } else {
      setActions(prev => [...prev, { ...action, id: `precall-${Date.now()}` }])
    }
  }

  return (
    <ConfigSection title="Pre-Call Actions" description="Actions performed before an outbound call starts to gather context.">
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <div key={action.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{action.name}</span>
                <Badge variant="outline" className="text-[10px] px-1.5">{action.type}</Badge>
                {action.required && <Badge variant="outline" className="text-[10px] px-1.5 border-[var(--status-warning)]/30 text-[var(--status-warning)]">Required</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Source: {action.source}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(action)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked={action.required} />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={openAdd}>
          <Zap className="h-4 w-4" />
          Add Pre-Call Action
        </Button>
      </div>

      <AddPreCallActionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </ConfigSection>
  )
}

// ─── Section 9: Rules & Policies ────────────────────────────────────────────
function SectionRules() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<RuleItem | null>(null)
  const [rules, setRules] = useState<RuleItem[]>([
    { id: 'human_request', name: 'Human Agent Request', description: '', priority: 1, conditionType: 'caller-request', conditionDetails: 'Caller requests human', actionType: 'transfer', actionConfig: 'Support Queue' },
    { id: 'frustration', name: 'High Frustration', description: '', priority: 2, conditionType: 'frustration', conditionDetails: 'Frustration count >= 2', actionType: 'transfer', actionConfig: 'Support Queue' },
    { id: 'duration_limit', name: 'Call Duration Limit', description: '', priority: 3, conditionType: 'duration', conditionDetails: 'Call duration > 15 minutes', actionType: 'end', actionConfig: '' },
    { id: 'unresolved', name: 'Unresolved Issue', description: '', priority: 4, conditionType: 'unresolved', conditionDetails: 'Issue unresolved after 3 turns', actionType: 'transfer', actionConfig: 'Support Queue' },
  ])

  function openAdd() { setEditingItem(null); setShowDialog(true) }
  function openEdit(rule: RuleItem) { setEditingItem(rule); setShowDialog(true) }

  function handleSave(rule: RuleItem) {
    if (editingItem) {
      setRules(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...rule } : r))
    } else {
      setRules(prev => [...prev, { ...rule, id: `rule-${Date.now()}` }])
    }
  }

  return (
    <ConfigSection title="Rules & Policies" description="Define conditions and actions that govern agent behavior during conversations.">
      <div className="flex flex-col gap-3">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{rule.name}</span>
                <Badge variant="outline" className="text-[10px] px-1.5">Priority {rule.priority}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-muted-foreground">WHEN:</span>
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{rule.conditionDetails}</code>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">THEN:</span>
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{rule.actionConfig || rule.actionType}</code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(rule)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={openAdd}>
          <Shield className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <AddRuleDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </ConfigSection>
  )
}

// ─── Section 10: Guardrails ─────────────────────────────────────────────────
import { AddGuardrailDialog, type GuardrailItem } from '@/components/agents/dialogs'

function SectionGuardrails() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<GuardrailItem | null>(null)
  const [guardrails, setGuardrails] = useState<GuardrailItem[]>([
    { 
      id: 'g1',
      label: 'Block PII Collection', 
      description: 'Prevent the agent from requesting or storing SSNs, full card numbers, or passwords.', 
      action: 'Refuse',
      detectionCondition: 'Detect when agent asks for or user provides SSN, credit card number, or password',
      protectedData: 'SSN, credit card number, password, bank account',
      responseBehavior: 'apologize',
      enabled: true 
    },
    { 
      id: 'g2',
      label: 'Profanity Filter', 
      description: 'Detect and suppress profane language in agent responses.', 
      action: 'Redact',
      detectionCondition: 'Detect profane or offensive language in agent output',
      protectedData: 'Profanity, offensive language',
      responseBehavior: 'silence',
      enabled: true 
    },
    { 
      id: 'g3',
      label: 'Off-topic Deflection', 
      description: 'Redirect conversations that deviate significantly from the agent\'s defined scope.', 
      action: 'Refuse',
      detectionCondition: 'Detect when conversation drifts outside agent scope or purpose',
      protectedData: 'Off-topic discussions',
      responseBehavior: 'clarify',
      enabled: true 
    },
    { 
      id: 'g4',
      label: 'Maximum Call Duration', 
      description: 'Automatically end calls exceeding the configured duration limit.', 
      action: 'End Call',
      detectionCondition: 'Call duration exceeds configured maximum',
      protectedData: '',
      responseBehavior: 'apologize',
      enabled: false 
    },
    { 
      id: 'g5',
      label: 'Competitor Mention Detection', 
      description: 'Flag or suppress mentions of competitor brand names.', 
      action: 'Redact',
      detectionCondition: 'Detect competitor brand names in conversation',
      protectedData: 'Competitor brands',
      responseBehavior: 'silence',
      enabled: false 
    },
    { 
      id: 'g6',
      label: 'HIPAA Compliance Mode', 
      description: 'Apply additional PHI handling and logging restrictions.', 
      action: 'Refuse',
      detectionCondition: 'Detect Protected Health Information (PHI) in conversation',
      protectedData: 'PHI, medical records, health conditions',
      responseBehavior: 'escalate',
      enabled: false 
    },
  ])

  const [blockedTopics, setBlockedTopics] = useState('investments, legal advice, medical diagnosis')

  function openAdd() {
    setEditingItem(null)
    setShowDialog(true)
  }

  function openEdit(guardrail: GuardrailItem) {
    setEditingItem(guardrail)
    setShowDialog(true)
  }

  function handleSave(guardrail: GuardrailItem) {
    if (editingItem) {
      setGuardrails(prev => prev.map(g => g.id === editingItem.id ? { ...g, ...guardrail } : g))
    } else {
      setGuardrails(prev => [...prev, { ...guardrail, id: `guardrail-${Date.now()}` }])
    }
  }

  function handleDelete(id: string) {
    setGuardrails(prev => prev.filter(g => g.id !== id))
  }

  return (
    <ConfigSection title="Guardrails" description="Set safety and compliance boundaries for agent behavior.">
      <div className="flex flex-col gap-3">
        {guardrails.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <ShieldAlert className="h-4 w-4 text-[var(--status-warning)] mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{item.label}</p>
                <Badge variant="outline" className="text-[10px] px-1.5">{item.action}</Badge>
                {!item.enabled && (
                  <Badge variant="outline" className="text-[10px] px-1.5 text-muted-foreground">Disabled</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              {item.protectedData && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  <span className="font-medium">Protected:</span> {item.protectedData}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(item)}>
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(item.id!)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={openAdd}>
          <ShieldAlert className="h-4 w-4" />
          Add Guardrail
        </Button>

        <Separator className="my-2" />

        <div className="flex flex-col gap-1.5">
          <Label>Blocked Topics / Keywords</Label>
          <Textarea 
            rows={2} 
            value={blockedTopics}
            onChange={(e) => setBlockedTopics(e.target.value)}
            placeholder="Comma-separated topics the agent should refuse to discuss." 
          />
          <p className="text-xs text-muted-foreground">
            These topics will trigger the off-topic deflection guardrail
          </p>
        </div>
      </div>

      <AddGuardrailDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </ConfigSection>
  )
}

// ─── Section 11: Data Extraction ────────────────────────────────────────────
function SectionDataExtraction() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ExtractionField | null>(null)
  const [fields, setFields] = useState<ExtractionField[]>([
    { id: 'f1', name: 'customer_name', type: 'String', description: '', confidence: 95, lowConfidenceBehavior: 'clarify', required: true },
    { id: 'f2', name: 'customer_email', type: 'String', description: '', confidence: 85, lowConfidenceBehavior: 'clarify', required: false },
    { id: 'f3', name: 'order_id', type: 'String', description: '', confidence: 92, lowConfidenceBehavior: 'clarify', required: true },
    { id: 'f4', name: 'issue_category', type: 'Enum', description: '', confidence: 88, lowConfidenceBehavior: 'review', required: true },
    { id: 'f5', name: 'sentiment', type: 'Enum', description: '', confidence: 75, lowConfidenceBehavior: 'accept', required: false },
    { id: 'f6', name: 'appointment_date', type: 'DateTime', description: '', confidence: 80, lowConfidenceBehavior: 'clarify', required: false },
  ])

  function openAdd() { setEditingItem(null); setShowDialog(true) }
  function openEdit(field: ExtractionField) { setEditingItem(field); setShowDialog(true) }

  function handleSave(field: ExtractionField) {
    if (editingItem) {
      setFields(prev => prev.map(f => f.id === editingItem.id ? { ...f, ...field } : f))
    } else {
      setFields(prev => [...prev, { ...field, id: `field-${Date.now()}` }])
    }
  }

  function handleDelete(id: string) {
    setFields(prev => prev.filter(f => f.id !== id))
  }

  return (
    <ConfigSection title="Data Extraction" description="Define fields the agent should extract from conversations.">
      <div className="flex flex-col gap-3">
        {fields.map((field) => (
          <div key={field.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Database className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold">{field.name}</code>
                <Badge variant="outline" className="text-[10px] px-1.5">{field.type}</Badge>
                {field.required && <Badge variant="outline" className="text-[10px] px-1.5 border-[var(--status-warning)]/30 text-[var(--status-warning)]">Required</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confidence threshold: {field.confidence}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(field)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(field.id!)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={openAdd}>
          <Database className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      <AddExtractionFieldDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </ConfigSection>
  )
}

// ─── Section 12: Post-Call Actions ──────────────────────────────────────────
function SectionPostCallActions() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PostCallAction | null>(null)
  const [actions, setActions] = useState<PostCallAction[]>([
    { id: 'pc1', name: 'Update CRM', actionType: 'CRM Update', trigger: 'Call Completed', payload: '{}', retryBehavior: '3', failureHandling: 'log' },
    { id: 'pc2', name: 'Save Call Outcome', actionType: 'Function', trigger: 'Call Completed', payload: '{}', retryBehavior: '3', failureHandling: 'log' },
    { id: 'pc3', name: 'Send SMS Follow-up', actionType: 'SMS', trigger: 'Specific Outcome', payload: '{}', retryBehavior: '3', failureHandling: 'alert' },
    { id: 'pc4', name: 'Create Follow-up Task', actionType: 'Task Creation', trigger: 'Extracted Field Condition', payload: '{}', retryBehavior: '0', failureHandling: 'log' },
  ])

  function openAdd() { setEditingItem(null); setShowDialog(true) }
  function openEdit(action: PostCallAction) { setEditingItem(action); setShowDialog(true) }

  function handleSave(action: PostCallAction) {
    if (editingItem) {
      setActions(prev => prev.map(a => a.id === editingItem.id ? { ...a, ...action } : a))
    } else {
      setActions(prev => [...prev, { ...action, id: `postcall-${Date.now()}` }])
    }
  }

  return (
    <ConfigSection title="Post-Call Actions" description="Actions that execute after the call finishes.">
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <div key={action.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Send className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{action.name}</span>
                <Badge variant="outline" className="text-[10px] px-1.5">{action.actionType}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Trigger: {action.trigger}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(action)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={openAdd}>
          <Send className="h-4 w-4" />
          Add Post-Call Action
        </Button>
      </div>

      <AddPostCallActionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </ConfigSection>
  )
}

// ─── Section 13: Intelligence Layer (unchanged) ─────────────────────────────
function SectionIntelligence() {
  const [useConversationFlow, setUseConversationFlow] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState('')

  const conversationFlows = [
    { id: 'appointment-booking', name: 'Appointment Booking', description: 'Schedule appointments by collecting preferences and checking availability' },
    { id: 'customer-support', name: 'Customer Support', description: 'Handle customer issues from identification to resolution' },
    { id: 'lead-qualification', name: 'Lead Qualification', description: 'Qualify leads and determine next steps based on criteria' },
    { id: 'payment-collection', name: 'Loan / Payment Collection', description: 'Collect outstanding payments through structured conversation' },
    { id: 'complaint-handling', name: 'Complaint Handling', description: 'Handle customer complaints with appropriate escalation' },
  ]

  return (
    <ConfigSection title="Intelligence Layer" description="Optional enhancements for advanced reasoning and analysis capabilities.">
      <div className="flex flex-col gap-4">
        {/* Conversation Flow Toggle */}
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Workflow className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Use Conversation Flow</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enable structured conversation patterns for this agent. When enabled, the agent will follow the selected flow pattern while still using its configured tools, knowledge, and capabilities.
              </p>
            </div>
            <Switch 
              checked={useConversationFlow} 
              onCheckedChange={setUseConversationFlow}
            />
          </div>

          {/* Flow Selection Dropdown */}
          {useConversationFlow && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Select Conversation Flow Pattern</Label>
                <Select value={selectedFlow} onValueChange={(v) => v && setSelectedFlow(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a conversation pattern..." />
                  </SelectTrigger>
                  <SelectContent>
                    {conversationFlows.map((flow) => (
                      <SelectItem key={flow.id} value={flow.id}>
                        <div className="flex flex-col gap-0.5 py-1">
                          <span className="font-medium">{flow.name}</span>
                          <span className="text-[11px] text-muted-foreground">{flow.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {selectedFlow 
                    ? `Selected: ${conversationFlows.find(f => f.id === selectedFlow)?.name}`
                    : 'Select a reusable conversation pattern for this agent'}
                </p>
              </div>

              {selectedFlow && (
                <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                      <p className="font-medium text-foreground mb-1">How it works:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>The agent will follow the selected flow pattern</li>
                        <li>Natural conversation happens within each stage</li>
                        <li>Agent uses configured tools, knowledge, and rules</li>
                        <li>Flow can be changed or disabled at any time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Intelligence Features */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Advanced Intelligence Features
          </p>
          {[
            { label: 'Sentiment Analysis', desc: 'Detect caller sentiment in real-time and adjust agent tone accordingly.', enabled: true, badge: 'Beta' },
            { label: 'Intent Classification', desc: 'Classify caller intent at the start of each turn to route conversation flow.', enabled: true, badge: null },
            { label: 'Entity Extraction', desc: 'Automatically extract dates, names, order IDs, and other structured data from speech.', enabled: false, badge: null },
            { label: 'Call Summarization', desc: 'Generate a structured summary and action items at the end of each call.', enabled: true, badge: null },
            { label: 'Real-time Coaching', desc: 'Provide live suggestions to human agents based on ongoing conversation context.', enabled: false, badge: 'Preview' },
            { label: 'Churn Prediction', desc: 'Flag calls where caller behavior suggests high churn risk.', enabled: false, badge: 'Preview' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px] px-1.5 border-[var(--status-warning)]/30 text-[var(--status-warning)]">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.enabled} />
            </div>
          ))}
        </div>
      </div>
    </ConfigSection>
  )
}