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
  Eye, Lock, AlertCircle
} from 'lucide-react'


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
  return (
    <ConfigSection title="Agent Information" description="Core identity and classification of this agent.">
      <div className="flex flex-col gap-4">
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
  const linked = knowledgeBases.filter((kb) => agent.knowledgeBases.includes(kb.id))
  const unlinked = knowledgeBases.filter((kb) => !agent.knowledgeBases.includes(kb.id))

  return (
    <ConfigSection title="Knowledge Base" description="Attach knowledge bases to give the agent access to documents and URLs.">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attached ({linked.length})</p>
        {linked.map((kb) => (
          <div key={kb.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{kb.name}</p>
              <p className="text-xs text-muted-foreground">{kb.documents} docs · {kb.urls} URLs · {(kb.tokens / 1000).toFixed(0)}k tokens</p>
            </div>
            <Badge variant="outline" className="border-[var(--status-active)]/30 text-[var(--status-active)] text-[10px]">{kb.status}</Badge>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 px-2">Detach</Button>
          </div>
        ))}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Available ({unlinked.length})</p>
        {unlinked.map((kb) => (
          <div key={kb.id} className="flex items-center gap-3 rounded-lg border border-dashed border-border/60 p-3 opacity-70">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{kb.name}</p>
              <p className="text-xs text-muted-foreground">{kb.documents} docs · {kb.urls} URLs</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 px-3 text-xs">Attach</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1">
          <BookOpen className="h-4 w-4" />
          Create New Knowledge Base
        </Button>
      </div>
    </ConfigSection>
  )
}

// ─── Section 7: Tools & Functions ───────────────────────────────────────────
function SectionTools() {
  const [showAddTool, setShowAddTool] = useState(false)
  const tools = [
    { id: 'lookup_order', name: 'lookup_order', description: 'Look up order status by order ID or email address.', enabled: true, type: 'REST API' },
    { id: 'create_ticket', name: 'create_ticket', description: 'Create a support ticket in the CRM system.', enabled: true, type: 'REST API' },
    { id: 'transfer_call', name: 'transfer_call', description: 'Transfer the active call to a specified queue or agent.', enabled: true, type: 'Built-in' },
    { id: 'get_calendar', name: 'get_calendar', description: 'Retrieve available appointment slots from the scheduling system.', enabled: false, type: 'REST API' },
    { id: 'send_sms', name: 'send_sms', description: 'Send an SMS follow-up to the caller\'s phone number.', enabled: false, type: 'REST API' },
  ]

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
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked={tool.enabled} />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={() => setShowAddTool(true)}>
          <Wrench className="h-4 w-4" />
          Add Custom Function
        </Button>
      </div>

      <Dialog open={showAddTool} onOpenChange={setShowAddTool}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Custom Function</DialogTitle>
            <DialogDescription>Define a new function the agent can call during conversations.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto">
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Function Name</Label>
                <Input placeholder="e.g. check_inventory" className="font-mono text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Function Type</Label>
                <Select defaultValue="rest-api">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest-api">REST API</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="built-in">Built-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea rows={2} placeholder="Describe what this function does..." />
            </div>
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Endpoint / URL</Label>
                <Input placeholder="https://api.example.com/v1/resource" className="font-mono text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>HTTP Method</Label>
                <Select defaultValue="GET">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Authentication</Label>
              <Select defaultValue="api-key">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="api-key">API Key</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Request Parameters</Label>
              <div className="rounded-md border border-border p-3 space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <Input placeholder="Parameter name" className="font-mono text-xs" />
                  <Select defaultValue="string">
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Description" className="text-xs" />
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-xs">Required</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                  <Plus className="h-3 w-3" /> Add Parameter
                </Button>
              </div>
            </div>
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Timeout (ms)</Label>
                <Input type="number" defaultValue="5000" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Retry Policy</Label>
                <Select defaultValue="3">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No retry</SelectItem>
                    <SelectItem value="1">1 retry</SelectItem>
                    <SelectItem value="3">3 retries</SelectItem>
                    <SelectItem value="5">5 retries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTool(false)}>Cancel</Button>
            <Button>Add Function</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfigSection>
  )
}

// ─── Section 8: Pre-Call Actions ────────────────────────────────────────────
function SectionPreCallActions() {
  const [showAddAction, setShowAddAction] = useState(false)
  const actions = [
    { id: 'customer_lookup', name: 'Customer Lookup', type: 'Function', source: 'CRM API', enabled: true, required: true },
    { id: 'account_status', name: 'Account Status Check', type: 'REST API', source: 'Billing System', enabled: true, required: true },
    { id: 'eligibility_check', name: 'Eligibility Verification', type: 'Business Rule', source: 'Internal', enabled: true, required: false },
    { id: 'crm_enrichment', name: 'CRM Data Enrichment', type: 'Data Enrichment', source: 'Salesforce', enabled: false, required: false },
  ]

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
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked={action.enabled} />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={() => setShowAddAction(true)}>
          <Zap className="h-4 w-4" />
          Add Pre-Call Action
        </Button>
      </div>

      <Dialog open={showAddAction} onOpenChange={setShowAddAction}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Pre-Call Action</DialogTitle>
            <DialogDescription>Define an action to execute before the call starts.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Action Name</Label>
                <Input placeholder="e.g. Verify Customer Identity" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Action Type</Label>
                <Select defaultValue="function">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="function">Function</SelectItem>
                    <SelectItem value="rest-api">REST API</SelectItem>
                    <SelectItem value="business-rule">Business Rule</SelectItem>
                    <SelectItem value="data-enrichment">Data Enrichment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Source / Integration</Label>
                <Input placeholder="e.g. Salesforce CRM" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Function or Endpoint</Label>
                <Input placeholder="e.g. /api/v1/customers/{id}" className="font-mono text-xs" />
              </div>
            </FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Conditions</Label>
              <Textarea rows={2} placeholder="e.g. Only execute for outbound calls to existing customers" />
            </div>
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Timeout (ms)</Label>
                <Input type="number" defaultValue="3000" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Failure Behavior</Label>
                <Select defaultValue="proceed-partial">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proceed">Proceed</SelectItem>
                    <SelectItem value="proceed-partial">Proceed with partial context</SelectItem>
                    <SelectItem value="skip">Skip call</SelectItem>
                    <SelectItem value="fail">Fail call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="flex items-center gap-2">
              <Switch />
              <Label>Required (call fails if this action fails)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAction(false)}>Cancel</Button>
            <Button>Add Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfigSection>
  )
}

// ─── Section 9: Rules & Policies ────────────────────────────────────────────
function SectionRules() {
  const [showAddRule, setShowAddRule] = useState(false)
  const rules = [
    { id: 'human_request', name: 'Human Agent Request', condition: 'Caller requests human', action: 'Transfer to Support Queue', priority: 1, enabled: true },
    { id: 'frustration', name: 'High Frustration', condition: 'Frustration count >= 2', action: 'Transfer to Support Queue', priority: 2, enabled: true },
    { id: 'duration_limit', name: 'Call Duration Limit', condition: 'Call duration > 15 minutes', action: 'End Call', priority: 3, enabled: true },
    { id: 'unresolved', name: 'Unresolved Issue', condition: 'Issue unresolved after 3 turns', action: 'Transfer to Support Queue', priority: 4, enabled: false },
  ]

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
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{rule.condition}</code>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">THEN:</span>
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{rule.action}</code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked={rule.enabled} />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={() => setShowAddRule(true)}>
          <Shield className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Rule</DialogTitle>
            <DialogDescription>Define a condition and action for agent behavior.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Rule Name</Label>
                <Input placeholder="e.g. Transfer on Frustration" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Input type="number" defaultValue="5" min="1" max="100" />
              </div>
            </FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea rows={2} placeholder="Describe when this rule should trigger..." />
            </div>
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[var(--status-warning)]" />
                <span className="text-sm font-semibold">WHEN / CONDITION</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Condition Type</Label>
                <Select defaultValue="caller-request">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caller-request">Caller requests human</SelectItem>
                    <SelectItem value="frustration">Customer frustration threshold</SelectItem>
                    <SelectItem value="unresolved">Issue unresolved after N turns</SelectItem>
                    <SelectItem value="ineligible">Customer is not eligible</SelectItem>
                    <SelectItem value="intent">Specific intent detected</SelectItem>
                    <SelectItem value="field">Specific extracted field/value</SelectItem>
                    <SelectItem value="duration">Call duration exceeds limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Condition Details</Label>
                <Input placeholder="e.g. Frustration count >= 2" className="font-mono text-xs" />
              </div>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">THEN / ACTION</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Action Type</Label>
                <Select defaultValue="transfer">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer Call</SelectItem>
                    <SelectItem value="end">End Call</SelectItem>
                    <SelectItem value="invoke">Invoke Function</SelectItem>
                    <SelectItem value="continue">Continue Conversation</SelectItem>
                    <SelectItem value="change-flow">Change Conversation Flow</SelectItem>
                    <SelectItem value="webhook">Trigger Webhook</SelectItem>
                    <SelectItem value="variable">Set/Update Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Action Configuration</Label>
                <Input placeholder="e.g. Support Queue" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRule(false)}>Cancel</Button>
            <Button>Add Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfigSection>
  )
}

// ─── Section 10: Guardrails ─────────────────────────────────────────────────
function SectionGuardrails() {
  return (
    <ConfigSection title="Guardrails" description="Set safety and compliance boundaries for agent behavior.">
      <div className="flex flex-col gap-3">
        {[
          { label: 'Block PII Collection', desc: 'Prevent the agent from requesting or storing SSNs, full card numbers, or passwords.', enabled: true, action: 'Refuse' },
          { label: 'Profanity Filter', desc: 'Detect and suppress profane language in agent responses.', enabled: true, action: 'Redact' },
          { label: 'Off-topic Deflection', desc: 'Redirect conversations that deviate significantly from the agent\'s defined scope.', enabled: true, action: 'Refuse' },
          { label: 'Maximum Call Duration', desc: 'Automatically end calls exceeding the configured duration limit.', enabled: false, action: 'End Call' },
          { label: 'Competitor Mention Detection', desc: 'Flag or suppress mentions of competitor brand names.', enabled: false, action: 'Redact' },
          { label: 'HIPAA Compliance Mode', desc: 'Apply additional PHI handling and logging restrictions.', enabled: false, action: 'Refuse' },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <ShieldAlert className="h-4 w-4 text-[var(--status-warning)] mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{item.label}</p>
                <Badge variant="outline" className="text-[10px] px-1.5">{item.action}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked={item.enabled} />
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-1.5 mt-2">
          <Label>Blocked Topics / Keywords</Label>
          <Textarea rows={2} defaultValue="investments, legal advice, medical diagnosis" placeholder="Comma-separated topics the agent should refuse to discuss." />
        </div>
      </div>
    </ConfigSection>
  )
}

// ─── Section 11: Data Extraction ────────────────────────────────────────────
function SectionDataExtraction() {
  const [showAddField, setShowAddField] = useState(false)
  const fields = [
    { name: 'customer_name', type: 'String', required: true, confidence: 0.95 },
    { name: 'customer_email', type: 'String', required: false, confidence: 0.85 },
    { name: 'order_id', type: 'String', required: true, confidence: 0.92 },
    { name: 'issue_category', type: 'Enum', required: true, confidence: 0.88 },
    { name: 'sentiment', type: 'Enum', required: false, confidence: 0.75 },
    { name: 'appointment_date', type: 'DateTime', required: false, confidence: 0.80 },
  ]

  return (
    <ConfigSection title="Data Extraction" description="Define fields the agent should extract from conversations.">
      <div className="flex flex-col gap-3">
        {fields.map((field) => (
          <div key={field.name} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Database className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold">{field.name}</code>
                <Badge variant="outline" className="text-[10px] px-1.5">{field.type}</Badge>
                {field.required && <Badge variant="outline" className="text-[10px] px-1.5 border-[var(--status-warning)]/30 text-[var(--status-warning)]">Required</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confidence threshold: {(field.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={() => setShowAddField(true)}>
          <Database className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      <Dialog open={showAddField} onOpenChange={setShowAddField}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Extraction Field</DialogTitle>
            <DialogDescription>Define a field to extract from conversations.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Field Name</Label>
                <Input placeholder="e.g. customer_phone" className="font-mono text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Data Type</Label>
                <Select defaultValue="string">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date / DateTime</SelectItem>
                    <SelectItem value="enum">Enum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea rows={2} placeholder="Describe what this field represents..." />
            </div>
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Confidence Threshold</Label>
                <Input type="number" defaultValue="80" min="0" max="100" />
                <p className="text-xs text-muted-foreground">Minimum confidence to accept extraction</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Low Confidence Behavior</Label>
                <Select defaultValue="clarify">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accept">Accept anyway</SelectItem>
                    <SelectItem value="clarify">Request clarification</SelectItem>
                    <SelectItem value="review">Send for review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="flex items-center gap-2">
              <Switch />
              <Label>Required field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddField(false)}>Cancel</Button>
            <Button>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfigSection>
  )
}

// ─── Section 12: Post-Call Actions ──────────────────────────────────────────
function SectionPostCallActions() {
  const [showAddAction, setShowAddAction] = useState(false)
  const actions = [
    { id: 'update_crm', name: 'Update CRM', trigger: 'Call Completed', action: 'CRM Update', enabled: true },
    { id: 'save_outcome', name: 'Save Call Outcome', trigger: 'Call Completed', action: 'Function', enabled: true },
    { id: 'send_sms', name: 'Send SMS Follow-up', trigger: 'Specific Outcome', action: 'SMS', enabled: true },
    { id: 'create_task', name: 'Create Follow-up Task', trigger: 'Extracted Field Condition', action: 'Task Creation', enabled: false },
  ]

  return (
    <ConfigSection title="Post-Call Actions" description="Actions that execute after the call finishes.">
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <div key={action.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Send className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{action.name}</span>
                <Badge variant="outline" className="text-[10px] px-1.5">{action.action}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Trigger: {action.trigger}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Switch defaultChecked={action.enabled} />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1" onClick={() => setShowAddAction(true)}>
          <Send className="h-4 w-4" />
          Add Post-Call Action
        </Button>
      </div>

      <Dialog open={showAddAction} onOpenChange={setShowAddAction}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Post-Call Action</DialogTitle>
            <DialogDescription>Define an action to execute after the call finishes.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Action Name</Label>
                <Input placeholder="e.g. Schedule Callback" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Action Type</Label>
                <Select defaultValue="crm-update">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crm-update">CRM Update</SelectItem>
                    <SelectItem value="function">Function</SelectItem>
                    <SelectItem value="rest-api">REST API</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="task">Task Creation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Trigger</Label>
              <Select defaultValue="call-completed">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call-completed">Call Completed</SelectItem>
                  <SelectItem value="call-failed">Call Failed</SelectItem>
                  <SelectItem value="specific-outcome">Specific Call Outcome</SelectItem>
                  <SelectItem value="field-condition">Extracted Field Condition</SelectItem>
                  <SelectItem value="confidence-condition">Confidence Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Payload (JSON)</Label>
              <Textarea
                rows={6}
                defaultValue={`{
  "customer_name": "{{customer_name}}",
  "order_id": "{{order_id}}",
  "outcome": "{{call_outcome}}",
  "sentiment": "{{sentiment}}"
}`}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Use {'{{field_name}}'} to reference extracted conversation fields.</p>
            </div>
            <FieldRow>
              <div className="flex flex-col gap-1.5">
                <Label>Retry Behavior</Label>
                <Select defaultValue="3">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No retry</SelectItem>
                    <SelectItem value="3">3 retries</SelectItem>
                    <SelectItem value="5">5 retries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Failure Handling</Label>
                <Select defaultValue="log">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="log">Log and continue</SelectItem>
                    <SelectItem value="alert">Alert admin</SelectItem>
                    <SelectItem value="retry-later">Retry later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAction(false)}>Cancel</Button>
            <Button>Add Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfigSection>
  )
}

// ─── Section 13: Intelligence Layer (unchanged) ─────────────────────────────
function SectionIntelligence() {
  return (
    <ConfigSection title="Intelligence Layer" description="Optional enhancements for advanced reasoning and analysis capabilities.">
      <div className="flex flex-col gap-3">
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
    </ConfigSection>
  )
}