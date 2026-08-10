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

export type AgentTemplate = {
  id: string
  name: string
  category: string
  description: string
  type: AgentType
  llmModel: string
  voice: string
  language: string
  useCount: number
  tags: string[]
}

export const agentTemplates: AgentTemplate[] = [
  { id: 'tpl-001', name: 'Customer Support — E-Commerce', category: 'Support', description: 'Ready-to-use inbound support agent with order lookup, FAQ, and escalation flows.', type: 'inbound', llmModel: 'gpt-4o', voice: 'Rachel', language: 'en-US', useCount: 42, tags: ['support', 'e-commerce'] },
  { id: 'tpl-002', name: 'Outbound Sales Qualifier', category: 'Sales', description: 'Lead qualification script with BANT framework, objection handling, and CRM sync.', type: 'outbound', llmModel: 'claude-3.5-sonnet', voice: 'Aria', language: 'en-US', useCount: 28, tags: ['sales', 'outreach'] },
  { id: 'tpl-003', name: 'Healthcare Appointment', category: 'Scheduling', description: 'HIPAA-aware scheduling agent with calendar integration and reminder flows.', type: 'hybrid', llmModel: 'gpt-4o-mini', voice: 'Dorothy', language: 'en-US', useCount: 19, tags: ['healthcare', 'scheduling'] },
  { id: 'tpl-004', name: 'Collections & Payment Reminder', category: 'Finance', description: 'Compliant outbound collections agent with payment plan negotiation flows.', type: 'outbound', llmModel: 'gpt-4o', voice: 'James', language: 'en-US', useCount: 11, tags: ['collections', 'finance'] },
  { id: 'tpl-005', name: 'IT Help Desk', category: 'Internal', description: 'Internal IT support triage agent for common issues, resets, and ticket creation.', type: 'inbound', llmModel: 'claude-3-haiku', voice: 'Studio-O', language: 'en-US', useCount: 15, tags: ['it', 'internal'] },
  { id: 'tpl-006', name: 'Survey & Feedback Collector', category: 'Engagement', description: 'Post-call CSAT and NPS survey agent with branching logic and webhook export.', type: 'outbound', llmModel: 'gpt-4o-mini', voice: 'Elli', language: 'en-US', useCount: 9, tags: ['survey', 'engagement'] },
]

export type KnowledgeBase = {
  id: string
  name: string
  description: string
  documents: number
  urls: number
  tokens: number
  status: 'ready' | 'processing' | 'error'
  lastUpdated: string
  usedByAgents: string[]
}

export const knowledgeBases: KnowledgeBase[] = [
  { id: 'kb-001', name: 'Product & FAQ Docs', description: 'Product documentation, FAQ articles, and support runbooks.', documents: 142, urls: 28, tokens: 1_240_000, status: 'ready', lastUpdated: '2026-08-05T10:30:00Z', usedByAgents: ['agt-001', 'agt-005'] },
  { id: 'kb-002', name: 'Healthcare Policies', description: 'HIPAA guidelines, appointment policies, and care coordination protocols.', documents: 64, urls: 12, tokens: 580_000, status: 'ready', lastUpdated: '2026-07-22T09:00:00Z', usedByAgents: ['agt-001', 'agt-003'] },
  { id: 'kb-003', name: 'Sales Playbook', description: 'ICP definitions, talk tracks, objection handling, and pricing sheets.', documents: 38, urls: 6, tokens: 310_000, status: 'ready', lastUpdated: '2026-08-01T14:00:00Z', usedByAgents: ['agt-002'] },
  { id: 'kb-004', name: 'Compliance & Legal', description: 'Regulatory compliance documents, terms of service, and privacy policies.', documents: 22, urls: 4, tokens: 190_000, status: 'processing', lastUpdated: '2026-08-07T08:00:00Z', usedByAgents: [] },
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
