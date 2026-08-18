// ─── Analytics Mock Data ──────────────────────────────────────────────────────
// All values are estimated/dummy data for UI prototyping purposes.

// ── Shared time-series helpers ────────────────────────────────────────────────

export const LAST_30_DAYS_LABELS = [
  'Jul 9','Jul 10','Jul 11','Jul 12','Jul 13','Jul 14','Jul 15',
  'Jul 16','Jul 17','Jul 18','Jul 19','Jul 20','Jul 21','Jul 22',
  'Jul 23','Jul 24','Jul 25','Jul 26','Jul 27','Jul 28','Jul 29',
  'Jul 30','Jul 31','Aug 1','Aug 2','Aug 3','Aug 4','Aug 5','Aug 6','Aug 7',
]

// ── Calls Analytics ───────────────────────────────────────────────────────────

export const callsKpis = {
  totalCalls: 18_420,
  inboundCalls: 11_052,
  outboundCalls: 7_368,
  answeredCalls: 16_180,
  missedFailed: 2_240,
  completedCalls: 14_890,
  avgDurationSecs: 221,
  avgResponseLatencyMs: 340,
  successfulCallRate: 80.8,
}

export const callVolumeTimeSeries = LAST_30_DAYS_LABELS.map((day, i) => ({
  day,
  inbound:  [312,428,391,512,467,198,156,342,405,388,520,475,210,168,355,430,398,540,490,215,172,360,415,402,548,498,220,180,370,422][i] ?? 350,
  outbound: [218,305,271,388,342,112,89,240,290,265,380,330,140,98,248,310,278,400,355,148,105,252,298,275,410,368,155,112,260,310][i] ?? 250,
}))

export const callOutcomes = [
  { outcome: 'Resolved',         count: 9_840, pct: 53.4 },
  { outcome: 'Demo Scheduled',   count: 1_820, pct: 9.9  },
  { outcome: 'Voicemail',        count: 2_110, pct: 11.5 },
  { outcome: 'Transferred',      count: 1_230, pct: 6.7  },
  { outcome: 'No Answer',        count: 1_480, pct: 8.0  },
  { outcome: 'Dropped',          count:   760, pct: 4.1  },
  { outcome: 'Payment Arranged', count:   680, pct: 3.7  },
  { outcome: 'Not Qualified',    count:   500, pct: 2.7  },
]

export const callsByAgent = [
  { agent: 'Customer Support Agent',  calls: 6_820, answered: 6_210, avgDuration: '4m 12s', successRate: 87.2 },
  { agent: 'Sales Outreach Bot',      calls: 5_340, answered: 4_480, avgDuration: '3m 45s', successRate: 72.1 },
  { agent: 'Appointment Scheduler',   calls: 4_210, answered: 3_980, avgDuration: '2m 58s', successRate: 93.4 },
  { agent: 'Collections & Payment',   calls: 1_480, answered: 1_120, avgDuration: '4m 30s', successRate: 68.5 },
  { agent: 'IT Help Desk',            calls:   570, answered:   390, avgDuration: '5m 30s', successRate: 81.0 },
]

export const callsByCampaign = [
  { campaign: 'Q3 Sales Outreach — Enterprise', calls: 3_210, completed: 2_480, failed: 730 },
  { campaign: 'Collections — August Cycle',     calls: 1_480, completed: 1_020, failed: 460 },
  { campaign: 'NPS Survey — Post-Purchase',     calls:   880, completed:   720, failed: 160 },
  { campaign: 'Q2 Win-Back Campaign',           calls: 1_840, completed: 1_420, failed: 420 },
]

export const callsByProvider = [
  { provider: 'VoBiz AI',        calls: 14_820, pct: 80.5 },
  { provider: 'Grandstream SIP', calls:  2_840, pct: 15.4 },
  { provider: 'VoBiz EU',        calls:    760, pct:  4.1 },
]

export const callStatusDistribution = [
  { status: 'Completed',   count: 14_890, color: 'bg-emerald-500' },
  { status: 'Voicemail',   count:  2_110, color: 'bg-amber-400'   },
  { status: 'Missed',      count:  1_480, color: 'bg-orange-400'  },
  { status: 'Dropped',     count:    760, color: 'bg-red-500'     },
  { status: 'Failed',      count:    760, color: 'bg-red-700'     },
  { status: 'Transferred', count:  1_230, color: 'bg-blue-500'    },
]

export const recentCallRecords = [
  { id: 'C-20501', direction: 'inbound',  number: '+1 (415) 555-0192', agent: 'Customer Support Agent', campaign: '—',                              duration: '4m 32s', status: 'completed',  outcome: 'resolved',         time: '2m ago'  },
  { id: 'C-20510', direction: 'outbound', number: '+1 (415) 555-0201', agent: 'Sales Outreach Bot',      campaign: 'Q3 Sales Outreach',              duration: '7m 12s', status: 'completed',  outcome: 'demo-scheduled',   time: '4m ago'  },
  { id: 'C-20500', direction: 'inbound',  number: '+1 (312) 555-0847', agent: 'Appointment Scheduler',   campaign: '—',                              duration: '2m 48s', status: 'completed',  outcome: 'resolved',         time: '9m ago'  },
  { id: 'C-20509', direction: 'outbound', number: '+1 (312) 555-0944', agent: 'Sales Outreach Bot',      campaign: 'Q3 Sales Outreach',              duration: '0m 45s', status: 'voicemail',  outcome: 'voicemail',        time: '11m ago' },
  { id: 'C-20499', direction: 'inbound',  number: '+1 (646) 555-0334', agent: 'Customer Support Agent',  campaign: '—',                              duration: '0m 22s', status: 'dropped',    outcome: 'dropped',          time: '16m ago' },
  { id: 'C-20508', direction: 'outbound', number: '+1 (646) 555-0771', agent: 'Collections & Payment',   campaign: 'Collections — August Cycle',     duration: '3m 55s', status: 'completed',  outcome: 'payment-arranged', time: '19m ago' },
  { id: 'C-20498', direction: 'inbound',  number: '+1 (213) 555-0721', agent: 'Customer Support Agent',  campaign: '—',                              duration: '7m 15s', status: 'transferred','outcome': 'transferred',    time: '24m ago' },
  { id: 'C-20507', direction: 'outbound', number: '+1 (213) 555-0330', agent: 'Sales Outreach Bot',      campaign: 'Q3 Sales Outreach',              duration: '0m 00s', status: 'failed',     outcome: 'no-answer',        time: '27m ago' },
]

// ── AI Performance Analytics ──────────────────────────────────────────────────

export const aiKpis = {
  avgE2ELatencyMs: 590,
  avgSTTLatencyMs: 185,
  avgLLMLatencyMs: 325,
  avgTTSLatencyMs: 95,
  avgConversationDurationSecs: 221,
  avgTurnsPerConversation: 6.4,
  successfulConversationRate: 80.8,
  callCompletionRate: 88.2,
  transferEscalationRate: 6.7,
  interruptionRate: 8.4,
  silenceTimeoutRate: 3.1,
  totalLLMTokens: 48_200_000,
  totalSTTMinutes: 68_100,
  totalTTSChars: 142_800_000,
}

export const latencyTimeSeries = LAST_30_DAYS_LABELS.map((day, i) => ({
  day,
  stt: [182,188,179,195,184,190,178,186,183,191,177,185,192,180,187,184,176,193,181,189,175,183,190,178,186,182,188,176,184,181][i] ?? 185,
  llm: [318,335,322,348,330,342,315,328,340,325,312,338,345,320,332,327,310,350,335,342,308,325,338,318,330,322,315,308,328,320][i] ?? 325,
  tts: [92,98,88,102,95,99,87,94,96,91,86,97,100,89,93,91,85,103,94,98,84,92,97,88,95,90,96,84,93,89][i] ?? 95,
}))

export const agentPerformance = [
  { agent: 'Customer Support Agent', successRate: 87.2, avgLatencyMs: 572, avgTurns: 7.1, completionRate: 91.4, escalationRate: 5.2, interruptionRate: 7.8 },
  { agent: 'Sales Outreach Bot',     successRate: 72.1, avgLatencyMs: 618, avgTurns: 5.8, completionRate: 83.9, escalationRate: 4.1, interruptionRate: 9.2 },
  { agent: 'Appointment Scheduler',  successRate: 93.4, avgLatencyMs: 548, avgTurns: 5.2, completionRate: 95.1, escalationRate: 2.8, interruptionRate: 6.1 },
  { agent: 'Collections & Payment',  successRate: 68.5, avgLatencyMs: 642, avgTurns: 8.3, completionRate: 75.7, escalationRate: 14.2, interruptionRate: 12.4 },
  { agent: 'IT Help Desk',           successRate: 81.0, avgLatencyMs: 595, avgTurns: 9.1, completionRate: 88.0, escalationRate: 8.5, interruptionRate: 7.3 },
]

export const llmProviderPerformance = [
  { provider: 'OpenAI gpt-4o',              calls: 9_840, avgLatencyMs: 320, tokens: 28_400_000, successRate: 88.1, costUsd: 142.00 },
  { provider: 'Anthropic claude-3.5-sonnet',calls: 5_340, avgLatencyMs: 410, tokens: 12_800_000, successRate: 85.4, costUsd:  38.40 },
  { provider: 'Google gemini-1.5-pro',      calls: 2_480, avgLatencyMs: 480, tokens:  5_200_000, successRate: 82.7, costUsd:  18.20 },
  { provider: 'OpenAI gpt-4o-mini',         calls:   760, avgLatencyMs: 210, tokens:  1_800_000, successRate: 90.2, costUsd:   1.62 },
]

export const sttProviderPerformance = [
  { provider: 'Deepgram nova-2',      minutes: 48_200, avgLatencyMs: 180, costUsd: 284.38, accuracyIndicator: 'High'   },
  { provider: 'Google Cloud STT',     minutes: 12_400, avgLatencyMs: 240, costUsd: 198.40, accuracyIndicator: 'High'   },
  { provider: 'Azure Speech Whisper', minutes:  5_800, avgLatencyMs: 310, costUsd:  58.00, accuracyIndicator: 'Medium' },
  { provider: 'AssemblyAI best',      minutes:  1_700, avgLatencyMs: 420, costUsd:  11.05, accuracyIndicator: 'High'   },
]

export const ttsProviderPerformance = [
  { provider: 'Cartesia sonic-english',    chars: 82_400_000, avgLatencyMs:  90, costUsd: 5_356.00, streamingEnabled: true  },
  { provider: 'ElevenLabs turbo-v2.5',     chars: 42_100_000, avgLatencyMs: 140, costUsd: 7_578.00, streamingEnabled: true  },
  { provider: 'Google Cloud TTS Journey',  chars: 12_800_000, avgLatencyMs: 210, costUsd:   204.80, streamingEnabled: false },
  { provider: 'Azure Speech Neural',       chars:  5_500_000, avgLatencyMs: 190, costUsd:    88.00, streamingEnabled: true  },
]

// ── Campaign Reports ──────────────────────────────────────────────────────────

export const campaignKpis = {
  totalCampaigns: 6,
  activeCampaigns: 2,
  completedCampaigns: 1,
  scheduledCampaigns: 1,
  pausedCampaigns: 1,
  draftCampaigns: 1,
  totalContacts: 6_612,
  callsAttempted: 7_410,
  callsCompleted: 5_640,
  callsFailed: 1_770,
  contactRate: 76.1,
  successRate: 64.2,
  completionRate: 76.1,
  avgCallDuration: '3m 52s',
}

export const campaignReports = [
  {
    id: 'cmp-001',
    name: 'Q3 Sales Outreach — Enterprise',
    status: 'running',
    agent: 'Sales Outreach Bot',
    totalContacts: 2_000,
    attempted: 3_210,
    completed: 2_480,
    failed: 730,
    contactRate: 78.2,
    successRate: 62.1,
    avgDuration: '3m 45s',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    progress: 57,
    topOutcome: 'Demo Scheduled',
  },
  {
    id: 'cmp-002',
    name: 'Collections — August Cycle',
    status: 'running',
    agent: 'Collections & Payment',
    totalContacts: 1_850,
    attempted: 1_480,
    completed: 1_020,
    failed: 460,
    contactRate: 68.9,
    successRate: 55.4,
    avgDuration: '4m 30s',
    startDate: '2026-08-05',
    endDate: '2026-08-20',
    progress: 40,
    topOutcome: 'Payment Arranged',
  },
  {
    id: 'cmp-003',
    name: 'Healthcare Appointment Reminders',
    status: 'scheduled',
    agent: 'Appointment Scheduler',
    totalContacts: 1_200,
    attempted: 0,
    completed: 0,
    failed: 0,
    contactRate: 0,
    successRate: 0,
    avgDuration: '—',
    startDate: '2026-08-10',
    endDate: '2026-08-31',
    progress: 0,
    topOutcome: '—',
  },
  {
    id: 'cmp-004',
    name: 'NPS Survey — Post-Purchase',
    status: 'paused',
    agent: 'Customer Support Agent',
    totalContacts: 880,
    attempted: 880,
    completed: 720,
    failed: 160,
    contactRate: 81.8,
    successRate: 74.2,
    avgDuration: '2m 20s',
    startDate: '2026-07-28',
    endDate: '2026-08-15',
    progress: 65,
    topOutcome: 'Survey Completed',
  },
  {
    id: 'cmp-005',
    name: 'IT Onboarding — New Hires Aug',
    status: 'draft',
    agent: 'IT Help Desk',
    totalContacts: 42,
    attempted: 0,
    completed: 0,
    failed: 0,
    contactRate: 0,
    successRate: 0,
    avgDuration: '—',
    startDate: '2026-08-12',
    endDate: '2026-08-14',
    progress: 0,
    topOutcome: '—',
  },
  {
    id: 'cmp-006',
    name: 'Q2 Win-Back Campaign',
    status: 'completed',
    agent: 'Sales Outreach Bot',
    totalContacts: 640,
    attempted: 1_840,
    completed: 1_420,
    failed: 420,
    contactRate: 65.8,
    successRate: 58.3,
    avgDuration: '4m 10s',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    progress: 100,
    topOutcome: 'Re-engaged',
  },
]

export const campaignDailyVolume = LAST_30_DAYS_LABELS.map((day, i) => ({
  day,
  cmp001: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,180,195,210,188,202,215,198][i] ?? 0,
  cmp002: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,142,158,165,148,172,155][i] ?? 0,
  cmp006: [88,102,95,110,98,42,28,92,108,100,118,105,45,32,96,112,104,122,110,48,35,98,115,108,0,0,0,0,0,0][i] ?? 0,
}))

// ── Cost Analytics ────────────────────────────────────────────────────────────

export const costKpis = {
  totalEstimatedCost: 14_820.48,
  llmCost: 200.22,
  sttCost: 552.83,
  ttsCost: 13_226.80,
  telephonyCost: 840.63,
  costPerCall: 0.804,
  costPerMinute: 0.218,
  costPerSuccessfulCall: 0.995,
}

export const costTimeSeries = LAST_30_DAYS_LABELS.map((day, i) => ({
  day,
  llm:       [5.8,7.2,6.4,8.1,7.5,3.2,2.4,6.2,7.8,6.9,8.8,7.9,3.5,2.8,6.5,7.6,7.0,9.0,8.2,3.6,2.9,6.6,7.7,7.1,9.2,8.4,3.7,3.0,6.8,7.3][i] ?? 6.5,
  stt:       [14.2,18.8,16.1,21.2,19.4,8.2,6.1,15.8,19.8,17.5,22.4,20.1,8.8,7.1,16.5,19.2,17.8,22.8,20.8,9.1,7.3,16.8,19.5,18.0,23.1,21.2,9.4,7.5,17.1,18.8][i] ?? 16.5,
  tts:       [320,428,381,512,467,198,156,342,405,388,520,475,210,168,355,430,398,540,490,215,172,360,415,402,548,498,220,180,370,422][i] ?? 380,
  telephony: [22.4,28.8,25.2,32.4,29.8,12.8,9.6,24.2,30.2,27.2,34.4,31.2,13.6,10.8,25.4,29.6,27.4,35.2,32.0,14.0,11.2,25.8,30.0,27.8,35.8,32.8,14.4,11.4,26.4,29.2][i] ?? 25,
}))

export const costByAgent = [
  { agent: 'Customer Support Agent', totalCost: 5_820.40, llm: 82.10, stt: 218.40, tts: 5_248.20, telephony: 271.70, calls: 6_820 },
  { agent: 'Sales Outreach Bot',     totalCost: 4_980.22, llm: 68.40, stt: 182.10, tts: 4_498.80, telephony: 230.92, calls: 5_340 },
  { agent: 'Appointment Scheduler',  totalCost: 2_840.18, llm: 32.20, stt: 108.40, tts: 2_568.40, telephony: 131.18, calls: 4_210 },
  { agent: 'Collections & Payment',  totalCost:   980.44, llm: 14.20, stt:  36.80, tts:   882.40, telephony:  47.04, calls: 1_480 },
  { agent: 'IT Help Desk',           totalCost:   199.24, llm:  3.32, stt:   7.13, tts:   179.00, telephony:   9.79, calls:   570 },
]

export const costByCampaign = [
  { campaign: 'Q3 Sales Outreach — Enterprise', totalCost: 3_820.40, calls: 3_210, costPerCall: 1.19 },
  { campaign: 'Collections — August Cycle',     totalCost: 1_480.22, calls: 1_480, costPerCall: 1.00 },
  { campaign: 'NPS Survey — Post-Purchase',     totalCost:   620.18, calls:   880, costPerCall: 0.70 },
  { campaign: 'Q2 Win-Back Campaign',           totalCost: 1_840.44, calls: 1_840, costPerCall: 1.00 },
]

export const llmCostBreakdown = [
  { provider: 'OpenAI gpt-4o',               tokens: 28_400_000, costUsd: 142.00, pct: 70.9 },
  { provider: 'Anthropic claude-3.5-sonnet', tokens: 12_800_000, costUsd:  38.40, pct: 19.2 },
  { provider: 'Google gemini-1.5-pro',       tokens:  5_200_000, costUsd:  18.20, pct:  9.1 },
  { provider: 'OpenAI gpt-4o-mini',          tokens:  1_800_000, costUsd:   1.62, pct:  0.8 },
]

export const sttCostBreakdown = [
  { provider: 'Deepgram nova-2',      minutes: 48_200, costUsd: 284.38, pct: 51.4 },
  { provider: 'Google Cloud STT',     minutes: 12_400, costUsd: 198.40, pct: 35.9 },
  { provider: 'Azure Speech Whisper', minutes:  5_800, costUsd:  58.00, pct: 10.5 },
  { provider: 'AssemblyAI best',      minutes:  1_700, costUsd:  11.05, pct:  2.0 },
]

export const ttsCostBreakdown = [
  { provider: 'Cartesia sonic-english',   chars: 82_400_000, costUsd: 5_356.00, pct: 40.5 },
  { provider: 'ElevenLabs turbo-v2.5',    chars: 42_100_000, costUsd: 7_578.00, pct: 57.3 },
  { provider: 'Google Cloud TTS Journey', chars: 12_800_000, costUsd:   204.80, pct:  1.5 },
  { provider: 'Azure Speech Neural',      chars:  5_500_000, costUsd:    88.00, pct:  0.7 },
]

export const telephonyCostBreakdown = [
  { provider: 'VoBiz AI',        minutes: 54_820, costUsd: 658.00, pct: 78.3 },
  { provider: 'Grandstream SIP', minutes: 12_400, costUsd: 148.80, pct: 17.7 },
  { provider: 'VoBiz EU',        minutes:  2_820, costUsd:  33.84, pct:  4.0 },
]
