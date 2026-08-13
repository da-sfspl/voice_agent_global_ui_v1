import type { ToolItem } from '@/components/agents/dialogs/add-tool-dialog'
import type { RuleItem } from '@/components/agents/dialogs/add-rule-dialog'
import type { GuardrailItem } from '@/components/agents/dialogs/add-guardrail-dialog'


// ─── Shared dummy data for the Voice AI Agent Platform ────────────────────────

export type Status = 'active' | 'inactive' | 'draft' | 'paused' | 'error'

// ─── Platform ─────────────────────────────────────────────────────────────────

export type Workspace = {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'professional' | 'enterprise'
  region: string
  agents: number
  users: number
  monthlyCalls: number
  status: 'active' | 'suspended'
  createdAt: string
  owner: string
}

export const workspaces: Workspace[] = [
  { id: 'ws-001', name: 'Acme Corp', slug: 'acme-corp', plan: 'enterprise', region: 'us-east-1', agents: 12, users: 34, monthlyCalls: 48200, status: 'active', createdAt: '2024-01-15', owner: 'james.wilson@acme.com' },
  { id: 'ws-002', name: 'TechFlow Solutions', slug: 'techflow', plan: 'professional', region: 'eu-west-1', agents: 5, users: 11, monthlyCalls: 9800, status: 'active', createdAt: '2024-03-02', owner: 'sara.miller@techflow.io' },
  { id: 'ws-003', name: 'Retail Direct', slug: 'retail-direct', plan: 'starter', region: 'us-west-2', agents: 2, users: 4, monthlyCalls: 1200, status: 'active', createdAt: '2024-05-20', owner: 'admin@retaildirect.com' },
  { id: 'ws-004', name: 'Meridian Health', slug: 'meridian-health', plan: 'enterprise', region: 'us-east-1', agents: 18, users: 56, monthlyCalls: 72400, status: 'active', createdAt: '2023-11-08', owner: 'ops@meridianhealth.org' },
  { id: 'ws-005', name: 'FinEdge Capital', slug: 'finedge', plan: 'professional', region: 'ap-southeast-1', agents: 7, users: 19, monthlyCalls: 16300, status: 'suspended', createdAt: '2024-02-14', owner: 'it@finedge.capital' },
]

export type User = {
  id: string
  name: string
  email: string
  role: string
  workspace: string
  status: 'active' | 'inactive' | 'pending'
  lastLogin: string
  createdAt: string
  mfaEnabled: boolean
}

export const users: User[] = [
  { id: 'usr-001', name: 'James Wilson', email: 'james.wilson@acme.com', role: 'Workspace Admin', workspace: 'Acme Corp', status: 'active', lastLogin: '2026-08-07T09:12:00Z', createdAt: '2024-01-15', mfaEnabled: true },
  { id: 'usr-002', name: 'Sara Miller', email: 'sara.miller@acme.com', role: 'Agent Manager', workspace: 'Acme Corp', status: 'active', lastLogin: '2026-08-06T14:33:00Z', createdAt: '2024-02-01', mfaEnabled: true },
  { id: 'usr-003', name: 'Daniel Park', email: 'daniel.park@acme.com', role: 'Campaign Manager', workspace: 'Acme Corp', status: 'active', lastLogin: '2026-08-05T11:20:00Z', createdAt: '2024-02-15', mfaEnabled: false },
  { id: 'usr-004', name: 'Priya Nair', email: 'priya.nair@acme.com', role: 'Analyst', workspace: 'Acme Corp', status: 'active', lastLogin: '2026-08-04T16:45:00Z', createdAt: '2024-03-10', mfaEnabled: true },
  { id: 'usr-005', name: 'Marcus Lee', email: 'marcus.lee@acme.com', role: 'Developer', workspace: 'Acme Corp', status: 'inactive', lastLogin: '2026-07-01T08:00:00Z', createdAt: '2024-04-22', mfaEnabled: false },
  { id: 'usr-006', name: 'Olivia Chen', email: 'olivia.chen@acme.com', role: 'Agent Manager', workspace: 'Acme Corp', status: 'pending', lastLogin: '—', createdAt: '2026-08-07', mfaEnabled: false },
  { id: 'usr-007', name: 'Ryan Torres', email: 'ryan.torres@acme.com', role: 'Analyst', workspace: 'Acme Corp', status: 'active', lastLogin: '2026-08-03T10:10:00Z', createdAt: '2024-06-01', mfaEnabled: true },
]

export type Role = {
  id: string
  name: string
  description: string
  users: number
  permissions: number
  system: boolean
  createdAt: string
}

export const roles: Role[] = [
  { id: 'role-001', name: 'Workspace Admin', description: 'Full control over workspace resources, users, and settings.', users: 2, permissions: 48, system: true, createdAt: '2024-01-15' },
  { id: 'role-002', name: 'Agent Manager', description: 'Create, configure, and deploy AI agents and voice profiles.', users: 5, permissions: 22, system: true, createdAt: '2024-01-15' },
  { id: 'role-003', name: 'Campaign Manager', description: 'Manage outbound campaigns, contacts, and scheduling.', users: 4, permissions: 14, system: true, createdAt: '2024-01-15' },
  { id: 'role-004', name: 'Analyst', description: 'Read-only access to analytics, reports and call recordings.', users: 8, permissions: 8, system: true, createdAt: '2024-01-15' },
  { id: 'role-005', name: 'Developer', description: 'API access, webhook configuration, and integration management.', users: 3, permissions: 18, system: false, createdAt: '2024-04-10' },
  { id: 'role-006', name: 'Support Viewer', description: 'View live calls and basic monitoring dashboards only.', users: 6, permissions: 5, system: false, createdAt: '2024-06-01' },
]

export const permissionGroups = [
  {
    group: 'Agents',
    permissions: [
      { key: 'agents:read', label: 'View Agents' },
      { key: 'agents:create', label: 'Create Agents' },
      { key: 'agents:update', label: 'Edit Agents' },
      { key: 'agents:delete', label: 'Delete Agents' },
      { key: 'agents:publish', label: 'Publish Agents' },
      { key: 'agents:config', label: 'Configure Providers' },
    ],
  },
  {
    group: 'Campaigns',
    permissions: [
      { key: 'campaigns:read', label: 'View Campaigns' },
      { key: 'campaigns:create', label: 'Create Campaigns' },
      { key: 'campaigns:update', label: 'Edit Campaigns' },
      { key: 'campaigns:delete', label: 'Delete Campaigns' },
      { key: 'campaigns:launch', label: 'Launch / Pause Campaigns' },
    ],
  },
  {
    group: 'Analytics',
    permissions: [
      { key: 'analytics:read', label: 'View Analytics' },
      { key: 'analytics:export', label: 'Export Reports' },
    ],
  },
  {
    group: 'Users & Roles',
    permissions: [
      { key: 'users:read', label: 'View Users' },
      { key: 'users:invite', label: 'Invite Users' },
      { key: 'users:update', label: 'Edit Users' },
      { key: 'users:delete', label: 'Remove Users' },
      { key: 'roles:read', label: 'View Roles' },
      { key: 'roles:manage', label: 'Manage Roles' },
    ],
  },
  {
    group: 'Administration',
    permissions: [
      { key: 'settings:read', label: 'View Settings' },
      { key: 'settings:update', label: 'Edit Settings' },
      { key: 'audit:read', label: 'View Audit Logs' },
      { key: 'billing:read', label: 'View Billing' },
      { key: 'billing:manage', label: 'Manage Billing' },
    ],
  },
]

// ─── Agents ───────────────────────────────────────────────────────────────────

export type AgentType = 'inbound' | 'outbound' | 'hybrid'
export type AgentStatus = 'active' | 'inactive' | 'draft' | 'archived'

export type Agent = {
  id: string
  name: string
  description: string
  type: AgentType
  status: AgentStatus
  version: string
  language: string
  llmProvider: string
  llmModel: string
  sttProvider: string
  ttsProvider: string
  voice: string
  temperature: number
  contextWindow: number
  memoryEnabled: boolean
  knowledgeBases: string[]
  totalCalls: number
  avgDuration: string
  successRate: number
  lastDeployed: string
  createdAt: string
  createdBy: string
  tags: string[]
}

export const agents: Agent[] = [
  {
    id: 'agt-001',
    name: 'Customer Support Agent',
    description: 'Handles inbound customer queries, order status, and basic troubleshooting for the e-commerce platform.',
    type: 'inbound',
    status: 'active',
    version: '3.2.1',
    language: 'en-US',
    llmProvider: 'OpenAI',
    llmModel: 'gpt-4o',
    sttProvider: 'Deepgram',
    ttsProvider: 'ElevenLabs',
    voice: 'Rachel',
    temperature: 0.4,
    contextWindow: 8192,
    memoryEnabled: true,
    knowledgeBases: ['kb-001', 'kb-002'],
    totalCalls: 14820,
    avgDuration: '4m 12s',
    successRate: 87,
    lastDeployed: '2026-08-01T10:00:00Z',
    createdAt: '2024-03-10',
    createdBy: 'Sara Miller',
    tags: ['support', 'e-commerce'],
  },
  {
    id: 'agt-002',
    name: 'Sales Outreach Bot',
    description: 'Outbound campaign agent for lead qualification, demo scheduling, and pipeline nurturing.',
    type: 'outbound',
    status: 'active',
    version: '2.0.4',
    language: 'en-US',
    llmProvider: 'Anthropic',
    llmModel: 'claude-3.5-sonnet',
    sttProvider: 'AssemblyAI',
    ttsProvider: 'Azure TTS',
    voice: 'Aria',
    temperature: 0.6,
    contextWindow: 16384,
    memoryEnabled: false,
    knowledgeBases: ['kb-003'],
    totalCalls: 6340,
    avgDuration: '3m 45s',
    successRate: 72,
    lastDeployed: '2026-07-28T14:30:00Z',
    createdAt: '2024-05-01',
    createdBy: 'James Wilson',
    tags: ['sales', 'outreach'],
  },
  {
    id: 'agt-003',
    name: 'Appointment Scheduler',
    description: 'Inbound and outbound scheduling agent for healthcare appointments with calendar integration.',
    type: 'hybrid',
    status: 'active',
    version: '1.5.0',
    language: 'en-US',
    llmProvider: 'OpenAI',
    llmModel: 'gpt-4o-mini',
    sttProvider: 'Deepgram',
    ttsProvider: 'ElevenLabs',
    voice: 'Dorothy',
    temperature: 0.3,
    contextWindow: 4096,
    memoryEnabled: true,
    knowledgeBases: ['kb-002'],
    totalCalls: 9210,
    avgDuration: '2m 58s',
    successRate: 93,
    lastDeployed: '2026-07-15T09:00:00Z',
    createdAt: '2024-06-20',
    createdBy: 'Priya Nair',
    tags: ['scheduling', 'healthcare'],
  },
  {
    id: 'agt-004',
    name: 'Collections & Payment',
    description: 'Outbound agent for account collections, payment reminders, and plan modification offers.',
    type: 'outbound',
    status: 'draft',
    version: '0.8.0',
    language: 'en-US',
    llmProvider: 'OpenAI',
    llmModel: 'gpt-4o',
    sttProvider: 'Deepgram',
    ttsProvider: 'Azure TTS',
    voice: 'James',
    temperature: 0.35,
    contextWindow: 8192,
    memoryEnabled: false,
    knowledgeBases: [],
    totalCalls: 0,
    avgDuration: '—',
    successRate: 0,
    lastDeployed: '—',
    createdAt: '2026-07-20',
    createdBy: 'Daniel Park',
    tags: ['collections', 'finance'],
  },
  {
    id: 'agt-005',
    name: 'IT Help Desk',
    description: 'Internal IT support agent for password resets, VPN issues, and software provisioning.',
    type: 'inbound',
    status: 'inactive',
    version: '1.1.2',
    language: 'en-US',
    llmProvider: 'Anthropic',
    llmModel: 'claude-3-haiku',
    sttProvider: 'Google STT',
    ttsProvider: 'Google TTS',
    voice: 'Studio-O',
    temperature: 0.2,
    contextWindow: 4096,
    memoryEnabled: false,
    knowledgeBases: ['kb-001'],
    totalCalls: 2110,
    avgDuration: '5m 30s',
    successRate: 81,
    lastDeployed: '2026-06-01T12:00:00Z',
    createdAt: '2024-08-15',
    createdBy: 'Marcus Lee',
    tags: ['internal', 'it'],
  },
]

export type AgentVersion = {
  version: string
  status: 'deployed' | 'staging' | 'archived'
  deployedAt: string
  deployedBy: string
  notes: string
  calls: number
}

export const agentVersions: AgentVersion[] = [
  { version: '3.2.1', status: 'deployed', deployedAt: '2026-08-01T10:00:00Z', deployedBy: 'Sara Miller', notes: 'Updated guardrails, improved FAQ handling. New memory decay policy.', calls: 14820 },
  { version: '3.1.0', status: 'archived', deployedAt: '2026-07-10T08:30:00Z', deployedBy: 'Sara Miller', notes: 'Switched LLM model to gpt-4o. Tuned temperature to 0.4.', calls: 9210 },
  { version: '3.0.2', status: 'archived', deployedAt: '2026-06-15T11:00:00Z', deployedBy: 'James Wilson', notes: 'Hotfix: corrected refund policy prompt section.', calls: 6100 },
  { version: '2.5.0', status: 'archived', deployedAt: '2026-05-01T09:00:00Z', deployedBy: 'Sara Miller', notes: 'Added knowledge base KB-002. Refactored conversation flow.', calls: 18700 },
]


// 1. Define the extended configuration type
export type AgentTemplateConfig = {
  instructions: {
    role: string
    objective: string
    behavior: string
    tone: string
    constraints: string
    welcome: string
    fallback: string
  }
  providers: {
    llmProvider: string
    llmModel: string
    sttProvider: string
    ttsProvider: string
    temperature: number
    contextWindow: string
  }
  voice: {
    speed: number
    stability: number
    similarityBoost: number
    emotion: string
    interruptHandling: boolean
    silenceDetection: boolean
  }
  memory: {
    enabled: boolean
    scope: string
    ttlDays: number
  }
  tools: ToolItem[]
  rules: RuleItem[]
  guardrails: GuardrailItem[]
  intelligence: {
    useFlow: boolean
    flowId: string
    sentiment: boolean
    intent: boolean
    summarization: boolean
  }
}

// 2. Update the AgentTemplate type to include the config
export type AgentTemplate = {
  id: string
  name: string
  category: string
  description: string
  type: 'inbound' | 'outbound' | 'hybrid'
  llmModel: string
  voice: string
  language: string
  useCount: number
  tags: string[]
  config: AgentTemplateConfig 
}

// 3. Update the mock data array
export const agentTemplates: AgentTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Customer Support — E-Commerce',
    category: 'Support',
    description: 'Ready-to-use inbound support agent with order lookup, FAQ, and escalation flows.',
    type: 'inbound',
    llmModel: 'gpt-4o',
    voice: 'Rachel',
    language: 'en-US',
    useCount: 42,
    tags: ['support', 'e-commerce'],
    config: {
      instructions: {
        role: 'E-Commerce Customer Support Agent',
        objective: 'Resolve order inquiries, process returns, and answer product questions efficiently.',
        behavior: 'Be empathetic, patient, and solution-oriented. Always verify the order number before discussing details.',
        tone: 'professional-friendly',
        constraints: 'Never issue refunds over $100 without manager approval. Do not share other customers\' data.',
        welcome: 'Thank you for calling Acme Store! My name is Alex. How can I help you with your order today?',
        fallback: 'I\'m sorry, I didn\'t quite catch that. Could you please repeat your order number or question?',
      },
      providers: {
        llmProvider: 'openai',
        llmModel: 'gpt-4o',
        sttProvider: 'deepgram',
        ttsProvider: 'elevenlabs',
        temperature: 0.3,
        contextWindow: '16384',
      },
      voice: { speed: 1.0, stability: 0.6, similarityBoost: 0.8, emotion: 'empathetic', interruptHandling: true, silenceDetection: true },
      memory: { enabled: true, scope: 'caller', ttlDays: 90 },
      tools: [
        { id: 't1', name: 'lookup_order', description: 'Look up order status by ID', type: 'REST API', endpoint: '/api/orders' },
        { id: 't2', name: 'process_return', description: 'Initiate a return request', type: 'REST API', endpoint: '/api/returns' },
        { id: 't3', name: 'transfer_call', description: 'Transfer to human agent', type: 'Built-in' },
      ],
      rules: [
        { id: 'r1', name: 'High Value Refund', description: '', priority: 1, conditionType: 'field', conditionDetails: 'refund_amount > 100', actionType: 'transfer', actionConfig: 'Manager Queue' },
        { id: 'r2', name: 'Human Request', description: '', priority: 2, conditionType: 'caller-request', conditionDetails: 'Requests human', actionType: 'transfer', actionConfig: 'Support Queue' },
      ],
      guardrails: [
        { id: 'g1', label: 'Block PII', description: 'Prevent SSN collection', action: 'Refuse', detectionCondition: '', protectedData: 'SSN', responseBehavior: 'apologize', enabled: true },
      ],
      intelligence: { useFlow: true, flowId: 'customer-support', sentiment: true, intent: true, summarization: true },
    }
  },
  {
    id: 'tpl-002',
    name: 'Outbound Sales Qualifier',
    category: 'Sales',
    description: 'Lead qualification script with BANT framework, objection handling, and CRM sync.',
    type: 'outbound',
    llmModel: 'claude-3.5-sonnet',
    voice: 'Aria',
    language: 'en-US',
    useCount: 28,
    tags: ['sales', 'outreach'],
    config: {
      instructions: { role: 'Sales Qualification Agent', objective: 'Qualify leads using BANT framework and book demos.', behavior: 'Be energetic, persuasive, and respectful of time.', tone: 'professional-friendly', constraints: 'Never promise specific pricing without a formal quote.', welcome: 'Hi, this is Alex calling from Acme Corp. Am I speaking with {{customer_name}}?', fallback: 'Sorry, the connection was a bit unclear. Could you repeat that?' },
      providers: { llmProvider: 'anthropic', llmModel: 'claude-3.5-sonnet', sttProvider: 'deepgram', ttsProvider: 'azure', temperature: 0.5, contextWindow: '32768' },
      voice: { speed: 1.05, stability: 0.5, similarityBoost: 0.7, emotion: 'energetic', interruptHandling: true, silenceDetection: true },
      memory: { enabled: true, scope: 'caller', ttlDays: 30 },
      tools: [{ id: 't1', name: 'check_crm', description: 'Check CRM status', type: 'REST API' }, { id: 't2', name: 'book_demo', description: 'Book calendar demo', type: 'REST API' }],
      rules: [{ id: 'r1', name: 'Not Interested', description: '', priority: 1, conditionType: 'intent', conditionDetails: 'Not interested', actionType: 'end', actionConfig: '' }],
      guardrails: [{ id: 'g1', label: 'Competitor Mention', description: 'Handle competitor mentions gracefully', action: 'Redact', detectionCondition: '', protectedData: '', responseBehavior: 'clarify', enabled: true }],
      intelligence: { useFlow: true, flowId: 'lead-qualification', sentiment: true, intent: true, summarization: true },
    }
  },
  {
    id: 'tpl-003',
    name: 'Healthcare Appointment',
    category: 'Scheduling',
    description: 'HIPAA-aware scheduling agent with calendar integration and reminder flows.',
    type: 'hybrid',
    llmModel: 'gpt-4o-mini',
    voice: 'Dorothy',
    language: 'en-US',
    useCount: 19,
    tags: ['healthcare', 'scheduling'],
    config: {
      instructions: { role: 'Healthcare Scheduling Agent', objective: 'Book, reschedule, and cancel medical appointments.', behavior: 'Be highly professional, empathetic, and strictly adhere to HIPAA guidelines.', tone: 'professional-formal', constraints: 'NEVER discuss specific medical diagnoses or symptoms over the phone. Only confirm appointment times.', welcome: 'Thank you for calling Acme Health Clinic. How may I assist you with your scheduling today?', fallback: 'I apologize, could you please repeat that so I can ensure I have the correct information?' },
      providers: { llmProvider: 'openai', llmModel: 'gpt-4o-mini', sttProvider: 'azure', ttsProvider: 'elevenlabs', temperature: 0.2, contextWindow: '8192' },
      voice: { speed: 0.95, stability: 0.8, similarityBoost: 0.9, emotion: 'empathetic', interruptHandling: false, silenceDetection: true },
      memory: { enabled: true, scope: 'caller', ttlDays: 365 },
      tools: [{ id: 't1', name: 'check_availability', description: 'Check doctor availability', type: 'REST API' }, { id: 't2', name: 'book_appointment', description: 'Book appointment', type: 'REST API' }],
      rules: [{ id: 'r1', name: 'Medical Question', description: '', priority: 1, conditionType: 'intent', conditionDetails: 'Asks medical advice', actionType: 'transfer', actionConfig: 'Nurse Triage' }],
      guardrails: [{ id: 'g1', label: 'HIPAA Compliance', description: 'Block PHI disclosure', action: 'Refuse', detectionCondition: '', protectedData: 'PHI, diagnoses', responseBehavior: 'escalate', enabled: true }],
      intelligence: { useFlow: true, flowId: 'appointment-booking', sentiment: false, intent: true, summarization: true },
    }
  },
  {
    id: 'tpl-004', name: 'Collections & Payment Reminder', category: 'Finance', description: 'Compliant outbound collections agent with payment plan negotiation flows.', type: 'outbound', llmModel: 'gpt-4o', voice: 'James', language: 'en-US', useCount: 11, tags: ['collections', 'finance'],
    config: { instructions: { role: 'Collections Agent', objective: 'Secure payment commitments.', behavior: 'Be firm but polite. Follow FDCPA guidelines strictly.', tone: 'professional-formal', constraints: 'Never use threatening language. Do not call before 8 AM or after 9 PM.', welcome: 'Hello, this is Alex from Acme Financial. May I speak with {{customer_name}}?', fallback: 'Could you please repeat that?' }, providers: { llmProvider: 'openai', llmModel: 'gpt-4o', sttProvider: 'deepgram', ttsProvider: 'elevenlabs', temperature: 0.2, contextWindow: '8192' }, voice: { speed: 1.0, stability: 0.7, similarityBoost: 0.8, emotion: 'neutral', interruptHandling: true, silenceDetection: true }, memory: { enabled: true, scope: 'caller', ttlDays: 90 }, tools: [{ id: 't1', name: 'get_balance', description: 'Get account balance', type: 'REST API' }, { id: 't2', name: 'process_payment', description: 'Process payment', type: 'REST API' }], rules: [{ id: 'r1', name: 'Dispute', description: '', priority: 1, conditionType: 'intent', conditionDetails: 'Disputes debt', actionType: 'transfer', actionConfig: 'Compliance Queue' }], guardrails: [{ id: 'g1', label: 'FDCPA Compliance', description: 'Block threatening language', action: 'Refuse', detectionCondition: '', protectedData: '', responseBehavior: 'escalate', enabled: true }], intelligence: { useFlow: true, flowId: 'payment-collection', sentiment: true, intent: true, summarization: true } }
  },
  {
    id: 'tpl-005', name: 'IT Help Desk', category: 'Internal', description: 'Internal IT support triage agent for common issues, resets, and ticket creation.', type: 'inbound', llmModel: 'claude-3-haiku', voice: 'Studio-O', language: 'en-US', useCount: 15, tags: ['it', 'internal'],
    config: { instructions: { role: 'IT Help Desk Agent', objective: 'Triage and resolve internal IT issues.', behavior: 'Be concise, technical, and efficient.', tone: 'professional-friendly', constraints: 'Do not share admin passwords. Escalate network outages immediately.', welcome: 'IT Help Desk, this is Alex. What issue are you experiencing?', fallback: 'Could you clarify the error message you are seeing?' }, providers: { llmProvider: 'anthropic', llmModel: 'claude-3-haiku', sttProvider: 'deepgram', ttsProvider: 'google', temperature: 0.3, contextWindow: '16384' }, voice: { speed: 1.1, stability: 0.6, similarityBoost: 0.7, emotion: 'neutral', interruptHandling: true, silenceDetection: true }, memory: { enabled: false, scope: 'session', ttlDays: 1 }, tools: [{ id: 't1', name: 'reset_password', description: 'Reset AD password', type: 'Built-in' }, { id: 't2', name: 'create_ticket', description: 'Create Jira ticket', type: 'REST API' }], rules: [{ id: 'r1', name: 'Network Outage', description: '', priority: 1, conditionType: 'intent', conditionDetails: 'Reports network down', actionType: 'transfer', actionConfig: 'NOC Team' }], guardrails: [{ id: 'g1', label: 'Admin Access', description: 'Block admin requests', action: 'Refuse', detectionCondition: '', protectedData: 'Admin passwords', responseBehavior: 'escalate', enabled: true }], intelligence: { useFlow: true, flowId: 'customer-support', sentiment: false, intent: true, summarization: true } }
  },
  {
    id: 'tpl-006', name: 'Survey & Feedback Collector', category: 'Engagement', description: 'Post-call CSAT and NPS survey agent with branching logic and webhook export.', type: 'outbound', llmModel: 'gpt-4o-mini', voice: 'Elli', language: 'en-US', useCount: 9, tags: ['survey', 'engagement'],
    config: { instructions: { role: 'Survey Agent', objective: 'Collect CSAT and NPS scores.', behavior: 'Be brief, polite, and appreciative of their time.', tone: 'casual', constraints: 'Do not argue with negative feedback. Just record it.', welcome: 'Hi {{customer_name}}, this is a quick follow-up from Acme Corp. Do you have 2 minutes for a quick survey?', fallback: 'Sorry, could you repeat your rating?' }, providers: { llmProvider: 'openai', llmModel: 'gpt-4o-mini', sttProvider: 'deepgram', ttsProvider: 'elevenlabs', temperature: 0.4, contextWindow: '4096' }, voice: { speed: 1.0, stability: 0.5, similarityBoost: 0.8, emotion: 'friendly', interruptHandling: false, silenceDetection: true }, memory: { enabled: false, scope: 'session', ttlDays: 1 }, tools: [{ id: 't1', name: 'save_survey', description: 'Save survey results', type: 'REST API' }], rules: [{ id: 'r1', name: 'Low Score', description: '', priority: 1, conditionType: 'field', conditionDetails: 'csat_score <= 2', actionType: 'invoke', actionConfig: 'alert_manager' }], guardrails: [], intelligence: { useFlow: false, flowId: '', sentiment: true, intent: false, summarization: true } }
  },
]

export type KnowledgeBase = {
  id: string
  name: string
  description: string
  documents: number
  urls: number
  apis: number
  tokens: number
  status: 'ready' | 'processing' | 'error'
  lastUpdated: string
  usedByAgents: string[]
}

export const knowledgeBases: KnowledgeBase[] = [
  { id: 'kb-001', name: 'Product & FAQ Docs', description: 'Product documentation, FAQ articles, and support runbooks.', documents: 142, urls: 28, apis: 2, tokens: 1_240_000, status: 'ready', lastUpdated: '2026-08-05T10:30:00Z', usedByAgents: ['agt-001', 'agt-005'] },
  { id: 'kb-002', name: 'Healthcare Policies', description: 'HIPAA guidelines, appointment policies, and care coordination protocols.', documents: 64, urls: 12, apis: 1, tokens: 580_000, status: 'ready', lastUpdated: '2026-07-22T09:00:00Z', usedByAgents: ['agt-001', 'agt-003'] },
  { id: 'kb-003', name: 'Sales Playbook', description: 'ICP definitions, talk tracks, objection handling, and pricing sheets.', documents: 38, urls: 6, apis: 0, tokens: 310_000, status: 'ready', lastUpdated: '2026-08-01T14:00:00Z', usedByAgents: ['agt-002'] },
  { id: 'kb-004', name: 'Compliance & Legal', description: 'Regulatory compliance documents, terms of service, and privacy policies.', documents: 22, urls: 4, apis: 0, tokens: 190_000, status: 'processing', lastUpdated: '2026-08-07T08:00:00Z', usedByAgents: [] },
]

export type Prompt = {
  id: string
  name: string
  agentId: string
  agentName: string
  type: 'system' | 'welcome' | 'fallback' | 'escalation' | 'closing'
  content: string
  tokens: number
  version: string
  lastModified: string
  modifiedBy: string
}

export const prompts: Prompt[] = [
  {
    id: 'prm-001',
    name: 'CS Agent — System Prompt',
    agentId: 'agt-001',
    agentName: 'Customer Support Agent',
    type: 'system',
    content: `You are a professional customer support representative for Acme Corp. Your primary role is to help customers with order status inquiries, product questions, returns, and general support.

Guidelines:
- Always greet the customer warmly and confirm their identity before accessing account details.
- Keep responses concise and empathetic. Avoid technical jargon.
- If a customer requests a refund, follow the refund policy outlined in KB-001 before making any commitments.
- Escalate to a human agent if: the customer expresses frustration more than twice, the issue cannot be resolved within 3 turns, or PII verification fails.
- Never make promises about delivery timelines you cannot verify.
- End each call with a satisfaction check.

Tone: Professional, warm, efficient.`,
    tokens: 198,
    version: '3.2.1',
    lastModified: '2026-08-01T10:00:00Z',
    modifiedBy: 'Sara Miller',
  },
  {
    id: 'prm-002',
    name: 'CS Agent — Welcome Message',
    agentId: 'agt-001',
    agentName: 'Customer Support Agent',
    type: 'welcome',
    content: `Thank you for calling Acme Corp customer support. My name is Alex, and I'm here to help you today. Could I please get your name and order number to get started?`,
    tokens: 38,
    version: '3.2.1',
    lastModified: '2026-07-15T14:00:00Z',
    modifiedBy: 'Sara Miller',
  },
  {
    id: 'prm-003',
    name: 'Sales Bot — System Prompt',
    agentId: 'agt-002',
    agentName: 'Sales Outreach Bot',
    type: 'system',
    content: `You are an outbound sales development representative for Acme Corp. Your goal is to qualify leads using the BANT framework and schedule product demonstrations.

Guidelines:
- Introduce yourself as Jordan from Acme Corp's growth team.
- Assess Budget, Authority, Need, and Timeline within the first 3 exchanges.
- If the lead is qualified (has budget, authority, and timeline < 90 days), offer a 30-minute demo with a senior AE.
- If unqualified, thank them and mark for a 60-day follow-up nurture.
- Handle objections using the objection bank in KB-003.
- Never quote pricing on this call. Always defer to the AE for pricing.

Tone: Confident, consultative, respectful of the prospect's time.`,
    tokens: 156,
    version: '2.0.4',
    lastModified: '2026-07-28T14:30:00Z',
    modifiedBy: 'James Wilson',
  },
]

// ─── Telephony ────────────────────────────────────────────────────────────────

export type CallDirection = 'inbound' | 'outbound'
export type CallStatus = 'completed' | 'missed' | 'dropped' | 'voicemail' | 'transferred' | 'failed'
export type LiveCallStatus = 'active' | 'on-hold' | 'transferring'

export type CallRecord = {
  id: string
  direction: CallDirection
  callerNumber: string
  callerName?: string
  agentId: string
  agentName: string
  trunkId: string
  startedAt: string
  duration: string
  durationSecs: number
  status: CallStatus
  outcome: string
  recordingUrl?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  transferredTo?: string
  campaignId?: string
}

export const inboundCalls: CallRecord[] = [
  { id: 'C-20501', direction: 'inbound', callerNumber: '+1 (415) 555-0192', callerName: 'Michael Torres', agentId: 'agt-001', agentName: 'Customer Support Agent', trunkId: 'trunk-001', startedAt: '2026-08-07T09:02:00Z', duration: '4m 32s', durationSecs: 272, status: 'completed', outcome: 'resolved', recordingUrl: '#', sentiment: 'positive' },
  { id: 'C-20500', direction: 'inbound', callerNumber: '+1 (312) 555-0847', callerName: 'Sandra Kim', agentId: 'agt-003', agentName: 'Appointment Scheduler', trunkId: 'trunk-001', startedAt: '2026-08-07T08:55:00Z', duration: '2m 48s', durationSecs: 168, status: 'completed', outcome: 'resolved', recordingUrl: '#', sentiment: 'positive' },
  { id: 'C-20499', direction: 'inbound', callerNumber: '+1 (646) 555-0334', agentId: 'agt-001', agentName: 'Customer Support Agent', trunkId: 'trunk-001', startedAt: '2026-08-07T08:48:00Z', duration: '0m 22s', durationSecs: 22, status: 'dropped', outcome: 'dropped', sentiment: 'negative' },
  { id: 'C-20498', direction: 'inbound', callerNumber: '+1 (213) 555-0721', callerName: 'David Okafor', agentId: 'agt-001', agentName: 'Customer Support Agent', trunkId: 'trunk-002', startedAt: '2026-08-07T08:40:00Z', duration: '7m 15s', durationSecs: 435, status: 'transferred', outcome: 'transferred', transferredTo: 'Human Agent Queue', recordingUrl: '#', sentiment: 'neutral' },
  { id: 'C-20497', direction: 'inbound', callerNumber: '+1 (512) 555-0563', callerName: 'Priya Sharma', agentId: 'agt-003', agentName: 'Appointment Scheduler', trunkId: 'trunk-001', startedAt: '2026-08-07T08:31:00Z', duration: '3m 10s', durationSecs: 190, status: 'completed', outcome: 'resolved', recordingUrl: '#', sentiment: 'positive' },
  { id: 'C-20496', direction: 'inbound', callerNumber: '+1 (404) 555-0298', agentId: 'agt-005', agentName: 'IT Help Desk', trunkId: 'trunk-002', startedAt: '2026-08-07T08:22:00Z', duration: '5m 44s', durationSecs: 344, status: 'completed', outcome: 'resolved', recordingUrl: '#', sentiment: 'neutral' },
  { id: 'C-20495', direction: 'inbound', callerNumber: '+1 (617) 555-0119', callerName: 'James Whitfield', agentId: 'agt-001', agentName: 'Customer Support Agent', trunkId: 'trunk-001', startedAt: '2026-08-07T08:10:00Z', duration: '1m 05s', durationSecs: 65, status: 'missed', outcome: 'missed', sentiment: 'neutral' },
  { id: 'C-20494', direction: 'inbound', callerNumber: '+1 (702) 555-0882', callerName: 'Aisha Patel', agentId: 'agt-003', agentName: 'Appointment Scheduler', trunkId: 'trunk-001', startedAt: '2026-08-07T07:58:00Z', duration: '4m 20s', durationSecs: 260, status: 'completed', outcome: 'resolved', recordingUrl: '#', sentiment: 'positive' },
]

export const outboundCalls: CallRecord[] = [
  { id: 'C-20510', direction: 'outbound', callerNumber: '+1 (415) 555-0201', callerName: 'Robert Chen', agentId: 'agt-002', agentName: 'Sales Outreach Bot', trunkId: 'trunk-003', startedAt: '2026-08-07T09:05:00Z', duration: '7m 12s', durationSecs: 432, status: 'completed', outcome: 'demo-scheduled', recordingUrl: '#', sentiment: 'positive', campaignId: 'cmp-001' },
  { id: 'C-20509', direction: 'outbound', callerNumber: '+1 (312) 555-0944', callerName: 'Laura Nguyen', agentId: 'agt-002', agentName: 'Sales Outreach Bot', trunkId: 'trunk-003', startedAt: '2026-08-07T08:58:00Z', duration: '0m 45s', durationSecs: 45, status: 'voicemail', outcome: 'voicemail', campaignId: 'cmp-001', sentiment: 'neutral' },
  { id: 'C-20508', direction: 'outbound', callerNumber: '+1 (646) 555-0771', callerName: 'Marcus Webb', agentId: 'agt-004', agentName: 'Collections & Payment', trunkId: 'trunk-003', startedAt: '2026-08-07T08:50:00Z', duration: '3m 55s', durationSecs: 235, status: 'completed', outcome: 'payment-arranged', recordingUrl: '#', sentiment: 'neutral', campaignId: 'cmp-002' },
  { id: 'C-20507', direction: 'outbound', callerNumber: '+1 (213) 555-0330', agentId: 'agt-002', agentName: 'Sales Outreach Bot', trunkId: 'trunk-003', startedAt: '2026-08-07T08:42:00Z', duration: '0m 00s', durationSecs: 0, status: 'failed', outcome: 'no-answer', campaignId: 'cmp-001', sentiment: 'neutral' },
  { id: 'C-20506', direction: 'outbound', callerNumber: '+1 (512) 555-0614', callerName: 'Tanya Brooks', agentId: 'agt-002', agentName: 'Sales Outreach Bot', trunkId: 'trunk-003', startedAt: '2026-08-07T08:35:00Z', duration: '5m 30s', durationSecs: 330, status: 'completed', outcome: 'not-qualified', recordingUrl: '#', sentiment: 'neutral', campaignId: 'cmp-001' },
  { id: 'C-20505', direction: 'outbound', callerNumber: '+1 (404) 555-0557', callerName: 'Derek Osei', agentId: 'agt-004', agentName: 'Collections & Payment', trunkId: 'trunk-003', startedAt: '2026-08-07T08:25:00Z', duration: '4m 18s', durationSecs: 258, status: 'transferred', outcome: 'transferred', transferredTo: 'Collections Team', recordingUrl: '#', sentiment: 'negative', campaignId: 'cmp-002' },
  { id: 'C-20504', direction: 'outbound', callerNumber: '+1 (617) 555-0423', callerName: 'Fiona Marsh', agentId: 'agt-002', agentName: 'Sales Outreach Bot', trunkId: 'trunk-003', startedAt: '2026-08-07T08:15:00Z', duration: '6m 02s', durationSecs: 362, status: 'completed', outcome: 'demo-scheduled', recordingUrl: '#', sentiment: 'positive', campaignId: 'cmp-001' },
]

export type LiveCall = {
  id: string
  direction: CallDirection
  callerNumber: string
  callerName?: string
  agentId: string
  agentName: string
  trunkId: string
  startedAt: string
  durationSecs: number
  status: LiveCallStatus
  sentiment: 'positive' | 'neutral' | 'negative'
  transcript: { speaker: 'agent' | 'caller'; text: string; ts: string }[]
  sipProvider: string
  liveKitRoom?: string
}

export const liveCalls: LiveCall[] = [
  {
    id: 'L-001',
    direction: 'inbound',
    callerNumber: '+1 (415) 555-0192',
    callerName: 'Michael Torres',
    agentId: 'agt-001',
    agentName: 'Customer Support Agent',
    trunkId: 'trunk-001',
    startedAt: '2026-08-07T09:10:00Z',
    durationSecs: 134,
    status: 'active',
    sentiment: 'positive',
    sipProvider: 'VoBiz AI',
    liveKitRoom: 'room-L001',
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling Acme Corp. My name is Alex. How can I help you today?', ts: '00:00' },
      { speaker: 'caller', text: 'Hi, I placed an order last week and I haven\'t received a shipping confirmation yet.', ts: '00:05' },
      { speaker: 'agent', text: 'I\'d be happy to look into that for you. Could I get your order number or the email address on the account?', ts: '00:12' },
      { speaker: 'caller', text: 'Sure, it\'s order number 88421.', ts: '00:18' },
      { speaker: 'agent', text: 'Thank you. I can see order 88421 is currently being processed at our fulfillment center. It\'s scheduled to ship today and you\'ll receive a tracking email within 2 hours.', ts: '00:24' },
    ],
  },
  {
    id: 'L-002',
    direction: 'outbound',
    callerNumber: '+1 (312) 555-0847',
    callerName: 'Sandra Kim',
    agentId: 'agt-002',
    agentName: 'Sales Outreach Bot',
    trunkId: 'trunk-003',
    startedAt: '2026-08-07T09:08:00Z',
    durationSecs: 214,
    status: 'active',
    sentiment: 'neutral',
    sipProvider: 'VoBiz AI',
    liveKitRoom: 'room-L002',
    transcript: [
      { speaker: 'agent', text: 'Hi, this is Jordan calling from Acme Corp\'s growth team. Is this Sandra?', ts: '00:00' },
      { speaker: 'caller', text: 'Yes, this is Sandra. What\'s this about?', ts: '00:06' },
      { speaker: 'agent', text: 'Great to connect, Sandra. I\'m reaching out because companies in your industry have been using our AI voice platform to reduce support costs by up to 40%. Do you have 2 minutes to hear how?', ts: '00:10' },
      { speaker: 'caller', text: 'I\'m a bit busy right now, but I\'m curious. Go ahead.', ts: '00:22' },
    ],
  },
  {
    id: 'L-003',
    direction: 'inbound',
    callerNumber: '+1 (646) 555-0334',
    agentId: 'agt-003',
    agentName: 'Appointment Scheduler',
    trunkId: 'trunk-001',
    startedAt: '2026-08-07T09:12:00Z',
    durationSecs: 67,
    status: 'on-hold',
    sentiment: 'neutral',
    sipProvider: 'Grandstream SIP',
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling Meridian Health scheduling. How can I assist you today?', ts: '00:00' },
      { speaker: 'caller', text: 'I need to reschedule my appointment with Dr. Patel from Thursday to next Monday.', ts: '00:05' },
      { speaker: 'agent', text: 'Of course. Let me pull up the available slots for Dr. Patel on Monday. One moment please.', ts: '00:12' },
    ],
  },
]

export type SipTrunk = {
  id: string
  name: string
  direction: 'inbound' | 'outbound' | 'bidirectional'
  provider: 'VoBiz AI' | 'Grandstream SIP' | 'Twilio' | 'Vonage'
  host: string
  port: number
  transport: 'UDP' | 'TCP' | 'TLS'
  status: 'connected' | 'degraded' | 'disconnected'
  activeCalls: number
  maxConcurrent: number
  callsToday: number
  region: string
  createdAt: string
}

export const sipTrunks: SipTrunk[] = [
  { id: 'trunk-001', name: 'VoBiz Inbound — US East', direction: 'inbound', provider: 'VoBiz AI', host: 'sip.vobiz.ai', port: 5060, transport: 'TLS', status: 'connected', activeCalls: 2, maxConcurrent: 50, callsToday: 312, region: 'us-east-1', createdAt: '2024-02-10' },
  { id: 'trunk-002', name: 'Grandstream Inbound — US West', direction: 'inbound', provider: 'Grandstream SIP', host: '192.168.10.45', port: 5060, transport: 'UDP', status: 'connected', activeCalls: 1, maxConcurrent: 20, callsToday: 88, region: 'us-west-2', createdAt: '2024-04-01' },
  { id: 'trunk-003', name: 'VoBiz Outbound — US East', direction: 'outbound', provider: 'VoBiz AI', host: 'sip-out.vobiz.ai', port: 5061, transport: 'TLS', status: 'connected', activeCalls: 0, maxConcurrent: 100, callsToday: 547, region: 'us-east-1', createdAt: '2024-02-10' },
  { id: 'trunk-004', name: 'VoBiz Bidirectional — EU West', direction: 'bidirectional', provider: 'VoBiz AI', host: 'sip-eu.vobiz.ai', port: 5061, transport: 'TLS', status: 'degraded', activeCalls: 0, maxConcurrent: 30, callsToday: 41, region: 'eu-west-1', createdAt: '2024-06-15' },
]

export type PhoneNumber = {
  id: string
  number: string
  friendlyName: string
  trunkId: string
  agentId?: string
  agentName?: string
  type: 'local' | 'toll-free' | 'mobile'
  country: string
  status: 'active' | 'unassigned' | 'suspended'
  monthlyCost: number
  callsToday: number
}

export const phoneNumbers: PhoneNumber[] = [
  { id: 'pn-001', number: '+1 (800) 555-0100', friendlyName: 'Main Support Line', trunkId: 'trunk-001', agentId: 'agt-001', agentName: 'Customer Support Agent', type: 'toll-free', country: 'US', status: 'active', monthlyCost: 2.00, callsToday: 198 },
  { id: 'pn-002', number: '+1 (415) 555-0200', friendlyName: 'Scheduling Line', trunkId: 'trunk-001', agentId: 'agt-003', agentName: 'Appointment Scheduler', type: 'local', country: 'US', status: 'active', monthlyCost: 1.00, callsToday: 114 },
  { id: 'pn-003', number: '+1 (312) 555-0300', friendlyName: 'IT Help Desk', trunkId: 'trunk-002', agentId: 'agt-005', agentName: 'IT Help Desk', type: 'local', country: 'US', status: 'active', monthlyCost: 1.00, callsToday: 88 },
  { id: 'pn-004', number: '+1 (646) 555-0400', friendlyName: 'Outbound Sales DID', trunkId: 'trunk-003', agentId: 'agt-002', agentName: 'Sales Outreach Bot', type: 'local', country: 'US', status: 'active', monthlyCost: 1.00, callsToday: 547 },
  { id: 'pn-005', number: '+44 20 7946 0500', friendlyName: 'EU Support Line', trunkId: 'trunk-004', type: 'local', country: 'GB', status: 'unassigned', monthlyCost: 1.50, callsToday: 0 },
  { id: 'pn-006', number: '+1 (800) 555-0600', friendlyName: 'Collections Outbound', trunkId: 'trunk-003', agentId: 'agt-004', agentName: 'Collections & Payment', type: 'toll-free', country: 'US', status: 'active', monthlyCost: 2.00, callsToday: 0 },
]

export type InboundRoute = {
  id: string
  name: string
  phoneNumberId: string
  phoneNumber: string
  agentId: string
  agentName: string
  schedule: 'always' | 'business-hours' | 'custom'
  fallback: 'voicemail' | 'queue' | 'transfer'
  fallbackTarget?: string
  maxQueueDepth: number
  priority: number
  status: 'active' | 'inactive'
}

export const inboundRoutes: InboundRoute[] = [
  { id: 'route-001', name: 'Main Support Route', phoneNumberId: 'pn-001', phoneNumber: '+1 (800) 555-0100', agentId: 'agt-001', agentName: 'Customer Support Agent', schedule: 'always', fallback: 'queue', fallbackTarget: 'Support Queue', maxQueueDepth: 10, priority: 1, status: 'active' },
  { id: 'route-002', name: 'Scheduling Route', phoneNumberId: 'pn-002', phoneNumber: '+1 (415) 555-0200', agentId: 'agt-003', agentName: 'Appointment Scheduler', schedule: 'business-hours', fallback: 'voicemail', maxQueueDepth: 5, priority: 1, status: 'active' },
  { id: 'route-003', name: 'IT Help Desk Route', phoneNumberId: 'pn-003', phoneNumber: '+1 (312) 555-0300', agentId: 'agt-005', agentName: 'IT Help Desk', schedule: 'business-hours', fallback: 'voicemail', maxQueueDepth: 5, priority: 1, status: 'inactive' },
]

// ─── Campaigns ────────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed'

export type RetryPolicy = {
  maxAttempts: number
  intervalHours: number
  onVoicemail: boolean
  onNoAnswer: boolean
  onBusy: boolean
}

export type Campaign = {
  id: string
  name: string
  description: string
  objective: string
  agentId: string
  agentName: string
  contactListId: string
  contactListName: string
  trunkId: string
  status: CampaignStatus
  startDate: string
  endDate: string
  callingHoursStart: string
  callingHoursEnd: string
  timezone: string
  maxCallsPerDay: number
  concurrentCallLimit: number
  retryPolicy: RetryPolicy
  totalContacts: number
  pending: number
  inProgress: number
  completed: number
  failed: number
  contacted: number
  voicemail: number
  dnc: number
  createdAt: string
  createdBy: string
  lastRunAt?: string
  nextRunAt?: string
}

export const campaigns: Campaign[] = [
  {
    id: 'cmp-001',
    name: 'Q3 Sales Outreach — Enterprise',
    description: 'Outbound qualification campaign targeting enterprise leads from the Q3 inbound pipeline.',
    objective: 'Lead Qualification & Demo Scheduling',
    agentId: 'agt-002',
    agentName: 'Sales Outreach Bot',
    contactListId: 'cl-001',
    contactListName: 'Enterprise Leads Q3',
    trunkId: 'trunk-003',
    status: 'running',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    callingHoursStart: '09:00',
    callingHoursEnd: '18:00',
    timezone: 'America/New_York',
    maxCallsPerDay: 200,
    concurrentCallLimit: 10,
    retryPolicy: { maxAttempts: 3, intervalHours: 4, onVoicemail: true, onNoAnswer: true, onBusy: false },
    totalContacts: 2000,
    pending: 847,
    inProgress: 12,
    completed: 1141,
    failed: 88,
    contacted: 712,
    voicemail: 341,
    dnc: 10,
    createdAt: '2026-07-25T10:00:00Z',
    createdBy: 'James Wilson',
    lastRunAt: '2026-08-07T09:00:00Z',
    nextRunAt: '2026-08-07T10:00:00Z',
  },
  {
    id: 'cmp-002',
    name: 'Collections — August Cycle',
    description: 'Monthly collections outreach for accounts 30–90 days past due.',
    objective: 'Payment Recovery',
    agentId: 'agt-004',
    agentName: 'Collections & Payment',
    contactListId: 'cl-002',
    contactListName: 'Past Due Accounts — Aug',
    trunkId: 'trunk-003',
    status: 'running',
    startDate: '2026-08-05',
    endDate: '2026-08-20',
    callingHoursStart: '10:00',
    callingHoursEnd: '20:00',
    timezone: 'America/Chicago',
    maxCallsPerDay: 500,
    concurrentCallLimit: 20,
    retryPolicy: { maxAttempts: 2, intervalHours: 6, onVoicemail: false, onNoAnswer: true, onBusy: true },
    totalContacts: 1850,
    pending: 1102,
    inProgress: 8,
    completed: 740,
    failed: 62,
    contacted: 498,
    voicemail: 180,
    dnc: 22,
    createdAt: '2026-08-01T08:00:00Z',
    createdBy: 'Daniel Park',
    lastRunAt: '2026-08-07T10:00:00Z',
    nextRunAt: '2026-08-07T11:00:00Z',
  },
  {
    id: 'cmp-003',
    name: 'Healthcare Appointment Reminders',
    description: 'Automated appointment reminder and confirmation calls for Meridian Health patients.',
    objective: 'Appointment Confirmation & Rescheduling',
    agentId: 'agt-003',
    agentName: 'Appointment Scheduler',
    contactListId: 'cl-003',
    contactListName: 'Upcoming Appointments — Aug',
    trunkId: 'trunk-001',
    status: 'scheduled',
    startDate: '2026-08-10',
    endDate: '2026-08-31',
    callingHoursStart: '08:00',
    callingHoursEnd: '17:00',
    timezone: 'America/New_York',
    maxCallsPerDay: 300,
    concurrentCallLimit: 15,
    retryPolicy: { maxAttempts: 2, intervalHours: 24, onVoicemail: true, onNoAnswer: true, onBusy: false },
    totalContacts: 1200,
    pending: 1200,
    inProgress: 0,
    completed: 0,
    failed: 0,
    contacted: 0,
    voicemail: 0,
    dnc: 0,
    createdAt: '2026-08-06T14:00:00Z',
    createdBy: 'Priya Nair',
    nextRunAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'cmp-004',
    name: 'NPS Survey — Post-Purchase',
    description: 'Post-purchase NPS and CSAT survey campaign for customers who completed orders in July.',
    objective: 'Customer Satisfaction Survey',
    agentId: 'agt-001',
    agentName: 'Customer Support Agent',
    contactListId: 'cl-004',
    contactListName: 'July Purchasers',
    trunkId: 'trunk-003',
    status: 'paused',
    startDate: '2026-07-28',
    endDate: '2026-08-15',
    callingHoursStart: '10:00',
    callingHoursEnd: '19:00',
    timezone: 'America/Los_Angeles',
    maxCallsPerDay: 150,
    concurrentCallLimit: 8,
    retryPolicy: { maxAttempts: 1, intervalHours: 48, onVoicemail: false, onNoAnswer: false, onBusy: false },
    totalContacts: 880,
    pending: 312,
    inProgress: 0,
    completed: 568,
    failed: 44,
    contacted: 490,
    voicemail: 34,
    dnc: 6,
    createdAt: '2026-07-26T09:00:00Z',
    createdBy: 'Sara Miller',
    lastRunAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'cmp-005',
    name: 'IT Onboarding — New Hires Aug',
    description: 'Automated IT onboarding call for new hires joining in August.',
    objective: 'Employee Onboarding',
    agentId: 'agt-005',
    agentName: 'IT Help Desk',
    contactListId: 'cl-005',
    contactListName: 'New Hires — August',
    trunkId: 'trunk-002',
    status: 'draft',
    startDate: '2026-08-12',
    endDate: '2026-08-14',
    callingHoursStart: '09:00',
    callingHoursEnd: '17:00',
    timezone: 'America/New_York',
    maxCallsPerDay: 50,
    concurrentCallLimit: 5,
    retryPolicy: { maxAttempts: 1, intervalHours: 2, onVoicemail: true, onNoAnswer: true, onBusy: false },
    totalContacts: 42,
    pending: 42,
    inProgress: 0,
    completed: 0,
    failed: 0,
    contacted: 0,
    voicemail: 0,
    dnc: 0,
    createdAt: '2026-08-07T11:00:00Z',
    createdBy: 'Marcus Lee',
  },
  {
    id: 'cmp-006',
    name: 'Q2 Win-Back Campaign',
    description: 'Re-engagement campaign for churned customers from Q2 with special retention offers.',
    objective: 'Customer Win-Back',
    agentId: 'agt-002',
    agentName: 'Sales Outreach Bot',
    contactListId: 'cl-006',
    contactListName: 'Churned Customers Q2',
    trunkId: 'trunk-003',
    status: 'completed',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    callingHoursStart: '09:00',
    callingHoursEnd: '18:00',
    timezone: 'America/New_York',
    maxCallsPerDay: 100,
    concurrentCallLimit: 5,
    retryPolicy: { maxAttempts: 2, intervalHours: 72, onVoicemail: true, onNoAnswer: true, onBusy: false },
    totalContacts: 640,
    pending: 0,
    inProgress: 0,
    completed: 640,
    failed: 58,
    contacted: 421,
    voicemail: 161,
    dnc: 8,
    createdAt: '2026-06-28T10:00:00Z',
    createdBy: 'James Wilson',
    lastRunAt: '2026-07-31T18:00:00Z',
  },
]

// ─── Contacts ─────────────────────────────────────────────────────────────────

export type ContactStatus = 'active' | 'dnc' | 'opted-out' | 'invalid'
export type ContactCallOutcome = 'contacted' | 'voicemail' | 'no-answer' | 'busy' | 'failed' | 'pending' | 'dnc'

export type Contact = {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  company?: string
  jobTitle?: string
  contactListIds: string[]
  campaignIds: string[]
  status: ContactStatus
  tags: string[]
  lastOutcome: ContactCallOutcome
  lastContactedAt?: string
  totalCalls: number
  attributes: Record<string, string>
  createdAt: string
}

export const contacts: Contact[] = [
  {
    id: 'con-001', firstName: 'Robert', lastName: 'Chen', phone: '+1 (415) 555-0201', email: 'robert.chen@techflow.io',
    company: 'TechFlow Solutions', jobTitle: 'VP of Engineering',
    contactListIds: ['cl-001'], campaignIds: ['cmp-001'],
    status: 'active', tags: ['enterprise', 'q3-lead', 'warm'],
    lastOutcome: 'contacted', lastContactedAt: '2026-08-07T09:05:00Z', totalCalls: 2,
    attributes: { accountValue: '$48,000', industry: 'SaaS', employees: '200–500', region: 'US West' },
    createdAt: '2026-07-15',
  },
  {
    id: 'con-002', firstName: 'Laura', lastName: 'Nguyen', phone: '+1 (312) 555-0944', email: 'laura.nguyen@retaildirect.com',
    company: 'Retail Direct', jobTitle: 'Head of Operations',
    contactListIds: ['cl-001'], campaignIds: ['cmp-001'],
    status: 'active', tags: ['enterprise', 'q3-lead'],
    lastOutcome: 'voicemail', lastContactedAt: '2026-08-07T08:58:00Z', totalCalls: 3,
    attributes: { accountValue: '$22,000', industry: 'Retail', employees: '50–200', region: 'US Midwest' },
    createdAt: '2026-07-16',
  },
  {
    id: 'con-003', firstName: 'Marcus', lastName: 'Webb', phone: '+1 (646) 555-0771', email: 'marcus.webb@finedge.capital',
    company: 'FinEdge Capital', jobTitle: 'CFO',
    contactListIds: ['cl-002'], campaignIds: ['cmp-002'],
    status: 'active', tags: ['past-due', '60-day'],
    lastOutcome: 'contacted', lastContactedAt: '2026-08-07T08:50:00Z', totalCalls: 1,
    attributes: { accountBalance: '$4,200', daysPastDue: '62', planType: 'Professional', region: 'US East' },
    createdAt: '2026-06-01',
  },
  {
    id: 'con-004', firstName: 'Tanya', lastName: 'Brooks', phone: '+1 (512) 555-0614', email: 'tanya.brooks@acme.com',
    company: 'Acme Corp', jobTitle: 'Director of IT',
    contactListIds: ['cl-001'], campaignIds: ['cmp-001'],
    status: 'active', tags: ['enterprise', 'q3-lead', 'decision-maker'],
    lastOutcome: 'contacted', lastContactedAt: '2026-08-07T08:35:00Z', totalCalls: 2,
    attributes: { accountValue: '$95,000', industry: 'Enterprise Tech', employees: '1000+', region: 'US South' },
    createdAt: '2026-07-10',
  },
  {
    id: 'con-005', firstName: 'Derek', lastName: 'Osei', phone: '+1 (404) 555-0557', email: 'derek.osei@meridianhealth.org',
    company: 'Meridian Health', jobTitle: 'Billing Manager',
    contactListIds: ['cl-002'], campaignIds: ['cmp-002'],
    status: 'active', tags: ['past-due', '30-day'],
    lastOutcome: 'no-answer', lastContactedAt: '2026-08-06T14:00:00Z', totalCalls: 2,
    attributes: { accountBalance: '$1,800', daysPastDue: '34', planType: 'Enterprise', region: 'US South' },
    createdAt: '2026-06-15',
  },
  {
    id: 'con-006', firstName: 'Fiona', lastName: 'Marsh', phone: '+1 (617) 555-0423', email: 'fiona.marsh@nexus.io',
    company: 'Nexus Solutions', jobTitle: 'CTO',
    contactListIds: ['cl-001'], campaignIds: ['cmp-001'],
    status: 'active', tags: ['enterprise', 'q3-lead', 'warm', 'demo-scheduled'],
    lastOutcome: 'contacted', lastContactedAt: '2026-08-07T08:15:00Z', totalCalls: 1,
    attributes: { accountValue: '$120,000', industry: 'Cloud Infrastructure', employees: '500–1000', region: 'US East' },
    createdAt: '2026-07-20',
  },
  {
    id: 'con-007', firstName: 'Sandra', lastName: 'Kim', phone: '+1 (213) 555-0330', email: 'sandra.kim@globaltech.com',
    company: 'GlobalTech Inc', jobTitle: 'Procurement Lead',
    contactListIds: ['cl-001'], campaignIds: ['cmp-001'],
    status: 'active', tags: ['enterprise', 'q3-lead'],
    lastOutcome: 'no-answer', lastContactedAt: '2026-08-06T11:00:00Z', totalCalls: 3,
    attributes: { accountValue: '$35,000', industry: 'Manufacturing', employees: '200–500', region: 'US West' },
    createdAt: '2026-07-18',
  },
  {
    id: 'con-008', firstName: 'James', lastName: 'Whitfield', phone: '+1 (702) 555-0882', email: 'j.whitfield@acme.com',
    company: 'Acme Corp', jobTitle: 'IT Manager',
    contactListIds: ['cl-005'], campaignIds: ['cmp-005'],
    status: 'active', tags: ['new-hire', 'it-onboarding'],
    lastOutcome: 'pending', totalCalls: 0,
    attributes: { department: 'Engineering', startDate: '2026-08-12', location: 'New York' },
    createdAt: '2026-08-05',
  },
  {
    id: 'con-009', firstName: 'Aisha', lastName: 'Patel', phone: '+1 (305) 555-0119', email: 'aisha.patel@churned.com',
    company: 'Patel Consulting', jobTitle: 'CEO',
    contactListIds: ['cl-006'], campaignIds: ['cmp-006'],
    status: 'active', tags: ['churned', 'q2', 'win-back'],
    lastOutcome: 'contacted', lastContactedAt: '2026-07-22T10:00:00Z', totalCalls: 2,
    attributes: { churnReason: 'Price', lastPlan: 'Professional', churnDate: '2026-06-30', ltv: '$18,400' },
    createdAt: '2024-03-01',
  },
  {
    id: 'con-010', firstName: 'Carlos', lastName: 'Rivera', phone: '+1 (786) 555-0644', email: 'carlos.r@blocked.com',
    company: 'Rivera Logistics', jobTitle: 'Operations Director',
    contactListIds: ['cl-001'], campaignIds: [],
    status: 'dnc', tags: ['dnc'],
    lastOutcome: 'dnc', totalCalls: 1,
    attributes: { dncReason: 'Customer Request', dncDate: '2026-07-01' },
    createdAt: '2026-05-10',
  },
]

export type ContactList = {
  id: string
  name: string
  description: string
  totalContacts: number
  activeContacts: number
  dncContacts: number
  campaignIds: string[]
  createdAt: string
  createdBy: string
  lastUpdated: string
}

export const contactLists: ContactList[] = [
  { id: 'cl-001', name: 'Enterprise Leads Q3', description: 'Qualified enterprise leads from Q3 inbound pipeline and trade shows.', totalContacts: 2000, activeContacts: 1960, dncContacts: 10, campaignIds: ['cmp-001'], createdAt: '2026-07-20', createdBy: 'James Wilson', lastUpdated: '2026-08-01' },
  { id: 'cl-002', name: 'Past Due Accounts — Aug', description: 'Accounts 30–90 days past due as of August 1st billing cycle.', totalContacts: 1850, activeContacts: 1810, dncContacts: 22, campaignIds: ['cmp-002'], createdAt: '2026-08-01', createdBy: 'Daniel Park', lastUpdated: '2026-08-05' },
  { id: 'cl-003', name: 'Upcoming Appointments — Aug', description: 'Meridian Health patients with appointments scheduled in August.', totalContacts: 1200, activeContacts: 1200, dncContacts: 0, campaignIds: ['cmp-003'], createdAt: '2026-08-06', createdBy: 'Priya Nair', lastUpdated: '2026-08-06' },
  { id: 'cl-004', name: 'July Purchasers', description: 'Customers who completed purchases in July for post-purchase NPS survey.', totalContacts: 880, activeContacts: 868, dncContacts: 6, campaignIds: ['cmp-004'], createdAt: '2026-07-26', createdBy: 'Sara Miller', lastUpdated: '2026-07-28' },
  { id: 'cl-005', name: 'New Hires — August', description: 'Employees starting in August for IT onboarding calls.', totalContacts: 42, activeContacts: 42, dncContacts: 0, campaignIds: ['cmp-005'], createdAt: '2026-08-07', createdBy: 'Marcus Lee', lastUpdated: '2026-08-07' },
  { id: 'cl-006', name: 'Churned Customers Q2', description: 'Customers who churned in Q2 for win-back outreach.', totalContacts: 640, activeContacts: 624, dncContacts: 8, campaignIds: ['cmp-006'], createdAt: '2026-06-28', createdBy: 'James Wilson', lastUpdated: '2026-07-01' },
]

// ─── Schedules ────────────────────────────────────────────────────────────────

export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'scheduled'

export type BlackoutPeriod = {
  id: string
  label: string
  startDate: string
  endDate: string
  reason: string
}

export type CampaignSchedule = {
  id: string
  campaignId: string
  campaignName: string
  agentName: string
  status: ScheduleStatus
  timezone: string
  startDate: string
  endDate: string
  callingDays: string[]
  callingHoursStart: string
  callingHoursEnd: string
  maxCallsPerDay: number
  concurrentCallLimit: number
  blackoutPeriods: BlackoutPeriod[]
  nextExecution?: string
  lastExecution?: string
  totalExecutions: number
  callsDispatchedToday: number
}

export const campaignSchedules: CampaignSchedule[] = [
  {
    id: 'sch-001',
    campaignId: 'cmp-001',
    campaignName: 'Q3 Sales Outreach — Enterprise',
    agentName: 'Sales Outreach Bot',
    status: 'active',
    timezone: 'America/New_York',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    callingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    callingHoursStart: '09:00',
    callingHoursEnd: '18:00',
    maxCallsPerDay: 200,
    concurrentCallLimit: 10,
    blackoutPeriods: [
      { id: 'bp-001', label: 'Company All-Hands', startDate: '2026-08-14', endDate: '2026-08-14', reason: 'Internal event — no outbound calls' },
    ],
    nextExecution: '2026-08-07T10:00:00Z',
    lastExecution: '2026-08-07T09:00:00Z',
    totalExecutions: 47,
    callsDispatchedToday: 87,
  },
  {
    id: 'sch-002',
    campaignId: 'cmp-002',
    campaignName: 'Collections — August Cycle',
    agentName: 'Collections & Payment',
    status: 'active',
    timezone: 'America/Chicago',
    startDate: '2026-08-05',
    endDate: '2026-08-20',
    callingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    callingHoursStart: '10:00',
    callingHoursEnd: '20:00',
    maxCallsPerDay: 500,
    concurrentCallLimit: 20,
    blackoutPeriods: [],
    nextExecution: '2026-08-07T11:00:00Z',
    lastExecution: '2026-08-07T10:00:00Z',
    totalExecutions: 18,
    callsDispatchedToday: 142,
  },
  {
    id: 'sch-003',
    campaignId: 'cmp-003',
    campaignName: 'Healthcare Appointment Reminders',
    agentName: 'Appointment Scheduler',
    status: 'scheduled',
    timezone: 'America/New_York',
    startDate: '2026-08-10',
    endDate: '2026-08-31',
    callingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    callingHoursStart: '08:00',
    callingHoursEnd: '17:00',
    maxCallsPerDay: 300,
    concurrentCallLimit: 15,
    blackoutPeriods: [
      { id: 'bp-002', label: 'System Maintenance', startDate: '2026-08-17', endDate: '2026-08-17', reason: 'Scheduled infrastructure maintenance window' },
    ],
    nextExecution: '2026-08-10T08:00:00Z',
    totalExecutions: 0,
    callsDispatchedToday: 0,
  },
  {
    id: 'sch-004',
    campaignId: 'cmp-004',
    campaignName: 'NPS Survey — Post-Purchase',
    agentName: 'Customer Support Agent',
    status: 'paused',
    timezone: 'America/Los_Angeles',
    startDate: '2026-07-28',
    endDate: '2026-08-15',
    callingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    callingHoursStart: '10:00',
    callingHoursEnd: '19:00',
    maxCallsPerDay: 150,
    concurrentCallLimit: 8,
    blackoutPeriods: [],
    lastExecution: '2026-08-05T10:00:00Z',
    totalExecutions: 31,
    callsDispatchedToday: 0,
  },
  {
    id: 'sch-005',
    campaignId: 'cmp-006',
    campaignName: 'Q2 Win-Back Campaign',
    agentName: 'Sales Outreach Bot',
    status: 'completed',
    timezone: 'America/New_York',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    callingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    callingHoursStart: '09:00',
    callingHoursEnd: '18:00',
    maxCallsPerDay: 100,
    concurrentCallLimit: 5,
    blackoutPeriods: [
      { id: 'bp-003', label: 'Independence Day', startDate: '2026-07-04', endDate: '2026-07-04', reason: 'US Federal Holiday' },
    ],
    lastExecution: '2026-07-31T18:00:00Z',
    totalExecutions: 130,
    callsDispatchedToday: 0,
  },
]
