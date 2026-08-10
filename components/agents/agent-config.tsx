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
  ChevronLeft,
  Bot,
  MessageSquareText,
  Settings2,
  Mic2,
  Brain,
  BookOpen,
  Wrench,
  ShieldAlert,
  Layers,
  Save,
  Rocket,
  ChevronRight,
} from 'lucide-react'

const sections = [
  { id: 'info', label: 'Agent Info', icon: Bot },
  { id: 'prompt', label: 'System Prompt', icon: MessageSquareText },
  { id: 'providers', label: 'Providers', icon: Settings2 },
  { id: 'voice', label: 'Voice Profile', icon: Mic2 },
  { id: 'memory', label: 'Memory & Context', icon: Brain },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'tools', label: 'Tools & Functions', icon: Wrench },
  { id: 'guardrails', label: 'Guardrails', icon: ShieldAlert },
  { id: 'intelligence', label: 'Intelligence Layer', icon: Layers },
]

export function AgentConfig({ agent }: { agent: Agent }) {
  const [activeSection, setActiveSection] = useState('info')

  const agentPrompt = prompts.find((p) => p.agentId === agent.id && p.type === 'system')

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
          <h1 className="text-xl font-semibold">Configure Agent</h1>
          <Badge variant="outline" className="font-mono text-xs">v{agent.version}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button size="sm" render={<Link href={`/agents/${agent.id}/publish`} />} className="gap-1.5">
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
          {activeSection === 'guardrails' && <SectionGuardrails />}
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

function SectionPrompt({ prompt }: { prompt: string }) {
  return (
    <ConfigSection title="System Prompt" description="The master instruction set that governs the agent's behavior, tone, and constraints.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label>System Prompt</Label>
            <span className="text-xs text-muted-foreground">
              {prompt.split(/\s+/).filter(Boolean).length} words · est. {Math.ceil(prompt.length / 4)} tokens
            </span>
          </div>
          <Textarea defaultValue={prompt} rows={16} className="font-mono text-xs leading-relaxed" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Welcome Message</Label>
            <Textarea rows={3} defaultValue="Thank you for calling Acme Corp. My name is Alex, and I'm here to help you today. Could I please get your name and order number to get started?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fallback Message</Label>
            <Textarea rows={3} defaultValue="I apologize, I didn't quite catch that. Could you please repeat your question?" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Escalation Trigger</Label>
          <Textarea rows={2} defaultValue="Transfer to a live agent if: the customer expresses frustration more than twice, or the issue cannot be resolved in 3 turns." />
        </div>
      </div>
    </ConfigSection>
  )
}

function SectionProviders({ agent }: { agent: Agent }) {
  return (
    <ConfigSection title="Provider Configuration" description="Configure LLM, STT, and TTS providers with routing and fallback settings.">
      <div className="flex flex-col gap-4">
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
            <p className="text-xs text-muted-foreground">Secondary provider used if the primary fails or is rate-limited.</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-primary text-sm">STT</span>
            <h3 className="text-sm font-semibold">Speech-to-Text</h3>
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

        <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-primary text-sm">TTS</span>
            <h3 className="text-sm font-semibold">Text-to-Speech</h3>
          </div>
          <FieldRow>
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select defaultValue={agent.ttsProvider.toLowerCase().replace(' ', '-')}>
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
        </div>
      </div>
    </ConfigSection>
  )
}

function SectionVoice({ agent }: { agent: Agent }) {
  return (
    <ConfigSection title="Voice Profile" description="Fine-tune the agent's vocal characteristics and speech patterns.">
      <FieldRow>
        <div className="flex flex-col gap-1.5">
          <Label>Speaking Speed</Label>
          <Select defaultValue="normal">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="slow">Slow (0.85×)</SelectItem>
              <SelectItem value="normal">Normal (1.0×)</SelectItem>
              <SelectItem value="fast">Fast (1.15×)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Stability <span className="text-muted-foreground font-normal">(0.0 – 1.0)</span></Label>
          <Input type="number" defaultValue="0.5" min="0" max="1" step="0.05" />
          <p className="text-xs text-muted-foreground">Higher = more consistent. Lower = more expressive.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Similarity Boost</Label>
          <Input type="number" defaultValue="0.75" min="0" max="1" step="0.05" />
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
      <div className="flex flex-col gap-3 pt-2">
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Interrupt Handling</p>
            <p className="text-xs text-muted-foreground">Allow callers to interrupt the agent mid-speech.</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Silence Detection</p>
            <p className="text-xs text-muted-foreground">Prompt the caller after extended silence (default: 5s).</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Background Noise Suppression</p>
            <p className="text-xs text-muted-foreground">Apply noise cancellation to the input audio stream.</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </ConfigSection>
  )
}

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

function SectionTools() {
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
                <Badge variant="outline" className="text-[10px] px-1.5">{tool.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
            </div>
            <Switch defaultChecked={tool.enabled} />
          </div>
        ))}
        <Button size="sm" variant="outline" className="self-start gap-1.5 mt-1">
          <Wrench className="h-4 w-4" />
          Add Custom Function
        </Button>
      </div>
    </ConfigSection>
  )
}

function SectionGuardrails() {
  return (
    <ConfigSection title="Guardrails" description="Set safety and compliance boundaries for agent behavior.">
      <div className="flex flex-col gap-3">
        {[
          { label: 'Block PII collection', desc: 'Prevent the agent from requesting or storing SSNs, full card numbers, or passwords.', enabled: true },
          { label: 'Profanity filter', desc: 'Detect and suppress profane language in agent responses.', enabled: true },
          { label: 'Off-topic deflection', desc: 'Redirect conversations that deviate significantly from the agent\'s defined scope.', enabled: true },
          { label: 'Max call duration', desc: 'Automatically end calls exceeding the configured duration limit.', enabled: false },
          { label: 'Competitor mention detection', desc: 'Flag or suppress mentions of competitor brand names.', enabled: false },
          { label: 'HIPAA compliance mode', desc: 'Apply additional PHI handling and logging restrictions.', enabled: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch defaultChecked={item.enabled} />
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
