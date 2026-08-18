// ─── Monitoring mock data ─────────────────────────────────────────────────────

export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export type ServiceHealth = {
  id: string
  name: string
  group: 'voice-ai' | 'platform' | 'integrations'
  status: ServiceStatus
  uptime: string
  latencyMs: number | null
  errorRate: string
  lastCheck: string
  activity?: string
}

export const serviceHealthData: ServiceHealth[] = [
  // Voice & AI Services
  { id: 'svc-telephony', name: 'Telephony Service', group: 'voice-ai', status: 'healthy', uptime: '99.97%', latencyMs: 48, errorRate: '0.02%', lastCheck: '2026-08-07T09:14:00Z', activity: '3 active calls' },
  { id: 'svc-livecall', name: 'Live Call Service', group: 'voice-ai', status: 'healthy', uptime: '99.94%', latencyMs: 62, errorRate: '0.05%', lastCheck: '2026-08-07T09:14:00Z', activity: '3 sessions' },
  { id: 'svc-stt', name: 'Speech-to-Text Service', group: 'voice-ai', status: 'degraded', uptime: '98.81%', latencyMs: 412, errorRate: '1.20%', lastCheck: '2026-08-07T09:13:00Z', activity: 'Elevated latency' },
  { id: 'svc-llm', name: 'LLM Service', group: 'voice-ai', status: 'healthy', uptime: '99.91%', latencyMs: 188, errorRate: '0.08%', lastCheck: '2026-08-07T09:14:00Z', activity: 'Normal load' },
  { id: 'svc-tts', name: 'Text-to-Speech Service', group: 'voice-ai', status: 'healthy', uptime: '99.89%', latencyMs: 214, errorRate: '0.11%', lastCheck: '2026-08-07T09:14:00Z', activity: 'Normal load' },
  { id: 'svc-orchestration', name: 'AI Orchestration Service', group: 'voice-ai', status: 'healthy', uptime: '99.95%', latencyMs: 31, errorRate: '0.03%', lastCheck: '2026-08-07T09:14:00Z', activity: 'Normal load' },
  // Platform Services
  { id: 'svc-api', name: 'API Service', group: 'platform', status: 'healthy', uptime: '99.99%', latencyMs: 22, errorRate: '0.01%', lastCheck: '2026-08-07T09:14:00Z', activity: '142 req/min' },
  { id: 'svc-agent', name: 'Agent Service', group: 'platform', status: 'healthy', uptime: '99.96%', latencyMs: 38, errorRate: '0.04%', lastCheck: '2026-08-07T09:14:00Z', activity: '5 active agents' },
  { id: 'svc-knowledge', name: 'Knowledge Service', group: 'platform', status: 'healthy', uptime: '99.88%', latencyMs: 95, errorRate: '0.09%', lastCheck: '2026-08-07T09:13:00Z', activity: 'Normal load' },
  { id: 'svc-campaign', name: 'Campaign Service', group: 'platform', status: 'healthy', uptime: '99.92%', latencyMs: 44, errorRate: '0.06%', lastCheck: '2026-08-07T09:14:00Z', activity: '2 running campaigns' },
  { id: 'svc-docproc', name: 'Document Processing Service', group: 'platform', status: 'degraded', uptime: '97.40%', latencyMs: 3200, errorRate: '2.60%', lastCheck: '2026-08-07T09:12:00Z', activity: 'Processing delayed' },
  // External Integrations
  { id: 'svc-vobiz', name: 'VoBiz AI / Grandstream SIP', group: 'integrations', status: 'healthy', uptime: '99.98%', latencyMs: 55, errorRate: '0.01%', lastCheck: '2026-08-07T09:14:00Z', activity: '2 trunks connected' },
  { id: 'svc-livekit', name: 'LiveKit', group: 'integrations', status: 'degraded', uptime: '98.74%', latencyMs: 380, errorRate: '0.90%', lastCheck: '2026-08-07T09:11:00Z', activity: 'Elevated latency' },
  { id: 'svc-ai-providers', name: 'Configured AI Providers', group: 'integrations', status: 'healthy', uptime: '99.90%', latencyMs: 165, errorRate: '0.10%', lastCheck: '2026-08-07T09:14:00Z', activity: 'OpenAI, Anthropic, Deepgram, ElevenLabs' },
  { id: 'svc-ext-integrations', name: 'External Integrations', group: 'integrations', status: 'healthy', uptime: '99.82%', latencyMs: 120, errorRate: '0.15%', lastCheck: '2026-08-07T09:13:00Z', activity: 'CRM, Calendar, Webhook endpoints' },
]

// ─── Logs ─────────────────────────────────────────────────────────────────────

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

export type LogEntry = {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  component: string
  message: string
  correlationId: string
  agentId?: string
  agentName?: string
  sessionId?: string
  callId?: string
  workspaceId?: string
  workspaceName?: string
  errorCode?: string
  durationMs?: number
  statusCode?: number
  details: Record<string, string | number | boolean>
}

export const logEntries: LogEntry[] = [
  {
    id: 'log-001', timestamp: '2026-08-07T09:14:02Z', level: 'ERROR', service: 'Speech-to-Text Service', component: 'STT Transcription',
    message: 'STT provider returned elevated latency — response time exceeded threshold (412ms > 300ms)',
    correlationId: 'req-8f3a2c1d', agentId: 'agt-001', agentName: 'Customer Support Agent',
    callId: 'C-20501', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    errorCode: 'STT_LATENCY_THRESHOLD', durationMs: 412, statusCode: 200,
    details: { provider: 'Deepgram', model: 'nova-2', latencyMs: 412, thresholdMs: 300, region: 'us-east-1' },
  },
  {
    id: 'log-002', timestamp: '2026-08-07T09:13:55Z', level: 'INFO', service: 'Telephony Service', component: 'SIP Handler',
    message: 'Inbound call connected — SIP trunk established successfully',
    correlationId: 'req-7b2e9f4a', agentId: 'agt-001', agentName: 'Customer Support Agent',
    callId: 'C-20501', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    durationMs: 48,
    details: { trunkId: 'trunk-001', provider: 'VoBiz AI', callerNumber: '+1 (415) 555-0192', direction: 'inbound' },
  },
  {
    id: 'log-003', timestamp: '2026-08-07T09:13:40Z', level: 'WARN', service: 'LiveKit', component: 'Media Session',
    message: 'LiveKit media session experiencing elevated round-trip latency (380ms)',
    correlationId: 'req-4c1d8e2b', sessionId: 'sess-L002', callId: 'L-002',
    workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    errorCode: 'LIVEKIT_HIGH_LATENCY', durationMs: 380,
    details: { roomId: 'room-L002', rttMs: 380, packetLoss: '0.4%', codec: 'opus' },
  },
  {
    id: 'log-004', timestamp: '2026-08-07T09:13:22Z', level: 'INFO', service: 'LLM Service', component: 'LLM Gateway',
    message: 'LLM inference completed successfully',
    correlationId: 'req-9a5f3c7e', agentId: 'agt-002', agentName: 'Sales Outreach Bot',
    callId: 'L-002', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    durationMs: 188,
    details: { provider: 'Anthropic', model: 'claude-3.5-sonnet', promptTokens: 1240, completionTokens: 88, totalTokens: 1328 },
  },
  {
    id: 'log-005', timestamp: '2026-08-07T09:12:58Z', level: 'ERROR', service: 'Document Processing Service', component: 'Document Ingestion',
    message: 'Document processing job exceeded time limit — job queued for retry',
    correlationId: 'req-2d7b1f9c', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    errorCode: 'DOCPROC_TIMEOUT', durationMs: 30000,
    details: { jobId: 'job-kb-004-003', documentName: 'compliance-policy-v3.pdf', fileSizeMb: 4.2, attempt: 2, maxAttempts: 3 },
  },
  {
    id: 'log-006', timestamp: '2026-08-07T09:12:31Z', level: 'INFO', service: 'Campaign Service', component: 'Campaign Executor',
    message: 'Campaign batch dispatched — 87 calls initiated',
    correlationId: 'req-6e4a8d1f', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    durationMs: 44,
    details: { campaignId: 'cmp-001', campaignName: 'Q3 Sales Outreach — Enterprise', batchSize: 87, concurrentLimit: 10 },
  },
  {
    id: 'log-007', timestamp: '2026-08-07T09:12:10Z', level: 'WARN', service: 'AI Orchestration Service', component: 'Fallback Router',
    message: 'Primary STT provider latency high — fallback evaluation triggered',
    correlationId: 'req-3f9c2a5d', agentId: 'agt-001', agentName: 'Customer Support Agent',
    callId: 'C-20501', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    errorCode: 'FALLBACK_EVALUATION', durationMs: 12,
    details: { primaryProvider: 'Deepgram', fallbackProvider: 'AssemblyAI', reason: 'latency_threshold_exceeded', action: 'monitoring' },
  },
  {
    id: 'log-008', timestamp: '2026-08-07T09:11:48Z', level: 'DEBUG', service: 'Agent Service', component: 'Session Manager',
    message: 'Agent session initialized — context loaded from knowledge base',
    correlationId: 'req-1b8e4f6a', agentId: 'agt-003', agentName: 'Appointment Scheduler',
    sessionId: 'sess-L003', callId: 'L-003', workspaceId: 'ws-004', workspaceName: 'Meridian Health',
    durationMs: 38,
    details: { knowledgeBaseIds: 'kb-002', contextTokens: 2840, memoryEnabled: true, version: '1.5.0' },
  },
  {
    id: 'log-009', timestamp: '2026-08-07T09:11:20Z', level: 'INFO', service: 'API Service', component: 'REST API',
    message: 'Agent configuration updated successfully',
    correlationId: 'req-5c3d7b2e', agentId: 'agt-002', agentName: 'Sales Outreach Bot',
    workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    durationMs: 22, statusCode: 200,
    details: { userId: 'usr-001', userName: 'James Wilson', action: 'agent.update', fields: 'temperature,systemPrompt' },
  },
  {
    id: 'log-010', timestamp: '2026-08-07T09:10:55Z', level: 'ERROR', service: 'Speech-to-Text Service', component: 'STT Transcription',
    message: 'STT transcription request failed — provider returned 503',
    correlationId: 'req-7d2f5a9c', agentId: 'agt-001', agentName: 'Customer Support Agent',
    callId: 'C-20499', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    errorCode: 'STT_PROVIDER_ERROR', durationMs: 5020, statusCode: 503,
    details: { provider: 'Deepgram', httpStatus: 503, retryAttempt: 1, fallbackTriggered: true },
  },
  {
    id: 'log-011', timestamp: '2026-08-07T09:10:30Z', level: 'INFO', service: 'Telephony Service', component: 'Call Router',
    message: 'Outbound call connected — campaign dial initiated',
    correlationId: 'req-8a1e6c4f', agentId: 'agt-002', agentName: 'Sales Outreach Bot',
    callId: 'C-20510', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    durationMs: 55,
    details: { campaignId: 'cmp-001', trunkId: 'trunk-003', destination: '+1 (415) 555-0201', direction: 'outbound' },
  },
  {
    id: 'log-012', timestamp: '2026-08-07T09:09:44Z', level: 'WARN', service: 'Document Processing Service', component: 'Document Ingestion',
    message: 'Document processing queue depth elevated — 14 jobs pending',
    correlationId: 'req-4b9d3e7a', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    errorCode: 'DOCPROC_QUEUE_DEPTH', durationMs: 0,
    details: { queueDepth: 14, normalThreshold: 5, criticalThreshold: 20, oldestJobAgeMin: 18 },
  },
  {
    id: 'log-013', timestamp: '2026-08-07T09:09:10Z', level: 'INFO', service: 'Knowledge Service', component: 'Vector Search',
    message: 'Knowledge base query completed — 8 relevant chunks retrieved',
    correlationId: 'req-2c5f8b1d', agentId: 'agt-001', agentName: 'Customer Support Agent',
    sessionId: 'sess-C20501', callId: 'C-20501', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    durationMs: 95,
    details: { knowledgeBaseId: 'kb-001', query: 'order shipping status', chunksRetrieved: 8, topScore: 0.94 },
  },
  {
    id: 'log-014', timestamp: '2026-08-07T09:08:30Z', level: 'DEBUG', service: 'AI Orchestration Service', component: 'Turn Manager',
    message: 'Conversation turn processed — agent response generated',
    correlationId: 'req-9e7a4c2f', agentId: 'agt-002', agentName: 'Sales Outreach Bot',
    sessionId: 'sess-L002', callId: 'L-002', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    durationMs: 31,
    details: { turnNumber: 4, sttLatencyMs: 390, llmLatencyMs: 188, ttsLatencyMs: 214, totalLatencyMs: 823 },
  },
  {
    id: 'log-015', timestamp: '2026-08-07T09:07:55Z', level: 'INFO', service: 'Text-to-Speech Service', component: 'TTS Synthesis',
    message: 'TTS synthesis completed successfully',
    correlationId: 'req-6f3b9d5e', agentId: 'agt-001', agentName: 'Customer Support Agent',
    callId: 'C-20501', workspaceId: 'ws-001', workspaceName: 'Acme Corp',
    durationMs: 214,
    details: { provider: 'ElevenLabs', voice: 'Rachel', characters: 142, audioLengthMs: 3800 },
  },
]

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'

export type Alert = {
  id: string
  name: string
  severity: AlertSeverity
  status: AlertStatus
  service: string
  description: string
  triggerCondition: string
  currentValue: string
  threshold: string
  firstDetected: string
  lastDetected: string
  occurrences: number
  assignedTeam?: string
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedAt?: string
  relatedServiceId: string
}

export const alertsData: Alert[] = [
  {
    id: 'alrt-001',
    name: 'STT Provider Elevated Latency',
    severity: 'high',
    status: 'active',
    service: 'Speech-to-Text Service',
    description: 'The Speech-to-Text service is responding slower than expected. Call transcription may be delayed, affecting agent response times.',
    triggerCondition: 'STT response latency > 300ms for > 5 minutes',
    currentValue: '412ms avg latency',
    threshold: '300ms',
    firstDetected: '2026-08-07T09:08:00Z',
    lastDetected: '2026-08-07T09:14:00Z',
    occurrences: 18,
    assignedTeam: 'Platform Operations',
    relatedServiceId: 'svc-stt',
  },
  {
    id: 'alrt-002',
    name: 'Document Processing Delayed',
    severity: 'medium',
    status: 'acknowledged',
    service: 'Document Processing Service',
    description: 'Some uploaded documents are taking longer than expected to process. Knowledge base updates may be delayed for affected workspaces.',
    triggerCondition: 'Document processing job duration > 20s or queue depth > 10',
    currentValue: '14 jobs pending, avg 28s processing time',
    threshold: 'Queue depth > 10 or processing time > 20s',
    firstDetected: '2026-08-07T08:55:00Z',
    lastDetected: '2026-08-07T09:12:00Z',
    occurrences: 7,
    assignedTeam: 'Platform Operations',
    acknowledgedBy: 'James Wilson',
    acknowledgedAt: '2026-08-07T09:05:00Z',
    relatedServiceId: 'svc-docproc',
  },
  {
    id: 'alrt-003',
    name: 'LiveKit Connectivity Degraded',
    severity: 'high',
    status: 'active',
    service: 'LiveKit',
    description: 'LiveKit media sessions are experiencing elevated round-trip latency. Live call audio quality may be affected for some active sessions.',
    triggerCondition: 'LiveKit RTT > 250ms for > 3 minutes',
    currentValue: '380ms RTT',
    threshold: '250ms',
    firstDetected: '2026-08-07T09:05:00Z',
    lastDetected: '2026-08-07T09:13:00Z',
    occurrences: 12,
    assignedTeam: 'Platform Operations',
    relatedServiceId: 'svc-livekit',
  },
  {
    id: 'alrt-004',
    name: 'High Call Failure Rate — Outbound',
    severity: 'medium',
    status: 'active',
    service: 'Telephony Service',
    description: 'Outbound call failure rate has exceeded the normal threshold. Some campaign calls may not be connecting successfully.',
    triggerCondition: 'Outbound call failure rate > 5% over 15-minute window',
    currentValue: '6.8% failure rate',
    threshold: '5%',
    firstDetected: '2026-08-07T08:45:00Z',
    lastDetected: '2026-08-07T09:10:00Z',
    occurrences: 4,
    assignedTeam: 'Telephony Operations',
    relatedServiceId: 'svc-telephony',
  },
  {
    id: 'alrt-005',
    name: 'LLM Provider Response Timeout',
    severity: 'critical',
    status: 'resolved',
    service: 'LLM Service',
    description: 'The LLM provider experienced a brief period of request timeouts. Affected calls may have experienced delayed or missing agent responses.',
    triggerCondition: 'LLM request timeout rate > 2% over 5-minute window',
    currentValue: '0.08% (resolved)',
    threshold: '2%',
    firstDetected: '2026-08-07T07:30:00Z',
    lastDetected: '2026-08-07T07:52:00Z',
    occurrences: 31,
    assignedTeam: 'AI Operations',
    acknowledgedBy: 'Sara Miller',
    acknowledgedAt: '2026-08-07T07:35:00Z',
    resolvedAt: '2026-08-07T07:55:00Z',
    relatedServiceId: 'svc-llm',
  },
  {
    id: 'alrt-006',
    name: 'Platform Service Degraded',
    severity: 'medium',
    status: 'resolved',
    service: 'API Service',
    description: 'Some platform API operations were temporarily unavailable. Affected users may have experienced errors when accessing the platform.',
    triggerCondition: 'API error rate > 1% over 10-minute window',
    currentValue: '0.01% (resolved)',
    threshold: '1%',
    firstDetected: '2026-08-07T06:10:00Z',
    lastDetected: '2026-08-07T06:28:00Z',
    occurrences: 9,
    assignedTeam: 'Platform Operations',
    acknowledgedBy: 'Daniel Park',
    acknowledgedAt: '2026-08-07T06:15:00Z',
    resolvedAt: '2026-08-07T06:30:00Z',
    relatedServiceId: 'svc-api',
  },
  {
    id: 'alrt-007',
    name: 'Campaign Execution Delay',
    severity: 'low',
    status: 'acknowledged',
    service: 'Campaign Service',
    description: 'Campaign call dispatch is running slightly behind schedule. Some scheduled call batches may be delayed by a few minutes.',
    triggerCondition: 'Campaign batch dispatch delay > 5 minutes',
    currentValue: '7 min delay on cmp-002',
    threshold: '5 minutes',
    firstDetected: '2026-08-07T09:00:00Z',
    lastDetected: '2026-08-07T09:07:00Z',
    occurrences: 2,
    assignedTeam: 'Campaign Operations',
    acknowledgedBy: 'Daniel Park',
    acknowledgedAt: '2026-08-07T09:03:00Z',
    relatedServiceId: 'svc-campaign',
  },
  {
    id: 'alrt-008',
    name: 'TTS Provider Availability Warning',
    severity: 'low',
    status: 'resolved',
    service: 'Text-to-Speech Service',
    description: 'The TTS provider reported a brief availability issue. Voice synthesis may have been temporarily unavailable for a small number of calls.',
    triggerCondition: 'TTS provider availability < 99.5% over 10-minute window',
    currentValue: '99.89% (resolved)',
    threshold: '99.5%',
    firstDetected: '2026-08-06T22:14:00Z',
    lastDetected: '2026-08-06T22:31:00Z',
    occurrences: 5,
    assignedTeam: 'AI Operations',
    resolvedAt: '2026-08-06T22:35:00Z',
    relatedServiceId: 'svc-tts',
  },
  {
    id: 'alrt-009',
    name: 'High Agent Response Latency',
    severity: 'informational',
    status: 'active',
    service: 'AI Orchestration Service',
    description: 'End-to-end agent response latency is slightly above normal. This may be related to the elevated STT latency currently being investigated.',
    triggerCondition: 'Avg end-to-end agent response latency > 700ms',
    currentValue: '823ms avg',
    threshold: '700ms',
    firstDetected: '2026-08-07T09:08:30Z',
    lastDetected: '2026-08-07T09:14:00Z',
    occurrences: 6,
    assignedTeam: 'Platform Operations',
    relatedServiceId: 'svc-orchestration',
  },
  {
    id: 'alrt-010',
    name: 'External Integration Connectivity Issue',
    severity: 'informational',
    status: 'resolved',
    service: 'External Integrations',
    description: 'A configured external webhook endpoint returned repeated errors. Webhook delivery for affected events may have been delayed.',
    triggerCondition: 'Webhook delivery failure rate > 10% for a single endpoint',
    currentValue: '0% (resolved)',
    threshold: '10%',
    firstDetected: '2026-08-06T18:40:00Z',
    lastDetected: '2026-08-06T19:05:00Z',
    occurrences: 14,
    assignedTeam: 'Integration Operations',
    resolvedAt: '2026-08-06T19:10:00Z',
    relatedServiceId: 'svc-ext-integrations',
  },
]
