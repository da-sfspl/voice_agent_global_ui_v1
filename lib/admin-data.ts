export type NotificationChannel = 'in_app' | 'email' | 'sms'
export type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface NotificationRule {
  id: string
  category: string
  event: string
  severity: NotificationSeverity
  channels: NotificationChannel[]
  enabled: boolean
  recipient: string
}

export interface AuditEvent {
  id: string
  timestamp: string
  user: string
  userEmail: string
  action: string
  resource: string
  resourceId: string
  module: string
  description: string
  result: 'success' | 'failure' | 'warning'
  ip: string
  device: string
}

export const notificationRules: NotificationRule[] = [
  { id: 'n1',  category: 'System',    event: 'Critical service outage',         severity: 'critical', channels: ['email', 'in_app'], enabled: true,  recipient: 'All Admins' },
  { id: 'n2',  category: 'System',    event: 'Service degradation detected',    severity: 'high',     channels: ['email', 'in_app'], enabled: true,  recipient: 'All Admins' },
  { id: 'n3',  category: 'System',    event: 'Scheduled maintenance window',    severity: 'info',     channels: ['in_app'],          enabled: true,  recipient: 'All Users' },
  { id: 'n4',  category: 'AI',        event: 'LLM provider failure',            severity: 'critical', channels: ['email', 'in_app'], enabled: true,  recipient: 'All Admins' },
  { id: 'n5',  category: 'AI',        event: 'STT provider latency spike',      severity: 'high',     channels: ['in_app'],          enabled: true,  recipient: 'All Admins' },
  { id: 'n6',  category: 'AI',        event: 'TTS provider fallback triggered', severity: 'medium',   channels: ['in_app'],          enabled: true,  recipient: 'All Admins' },
  { id: 'n7',  category: 'AI',        event: 'AI cost threshold exceeded',      severity: 'high',     channels: ['email', 'in_app'], enabled: true,  recipient: 'All Admins' },
  { id: 'n8',  category: 'Calls',     event: 'High call failure rate',          severity: 'high',     channels: ['email', 'in_app'], enabled: true,  recipient: 'All Admins' },
  { id: 'n9',  category: 'Calls',     event: 'SIP trunk disconnected',          severity: 'critical', channels: ['email', 'in_app', 'sms'], enabled: true, recipient: 'All Admins' },
  { id: 'n10', category: 'Calls',     event: 'Recording storage near limit',    severity: 'medium',   channels: ['email'],           enabled: true,  recipient: 'All Admins' },
  { id: 'n11', category: 'Campaigns', event: 'Campaign completed',              severity: 'info',     channels: ['email'],           enabled: true,  recipient: 'Campaign Owner' },
  { id: 'n12', category: 'Campaigns', event: 'Campaign failed to start',        severity: 'high',     channels: ['email', 'in_app'], enabled: true,  recipient: 'Campaign Owner' },
  { id: 'n13', category: 'Campaigns', event: 'Contact list import finished',    severity: 'info',     channels: ['in_app'],          enabled: true,  recipient: 'Campaign Owner' },
  { id: 'n14', category: 'Documents', event: 'Document processing failed',      severity: 'medium',   channels: ['in_app'],          enabled: true,  recipient: 'Agent Owner' },
  { id: 'n15', category: 'Documents', event: 'Knowledge base sync complete',    severity: 'info',     channels: ['in_app'],          enabled: false, recipient: 'Agent Owner' },
  { id: 'n16', category: 'Agents',    event: 'Agent deployment failed',         severity: 'high',     channels: ['email', 'in_app'], enabled: true,  recipient: 'Agent Owner' },
  { id: 'n17', category: 'Agents',    event: 'Agent error rate spike',          severity: 'high',     channels: ['in_app'],          enabled: true,  recipient: 'All Admins' },
  { id: 'n18', category: 'Security',  event: 'Failed login attempts (5+)',      severity: 'high',     channels: ['email', 'in_app'], enabled: true,  recipient: 'All Admins' },
  { id: 'n19', category: 'Security',  event: 'New admin user created',          severity: 'medium',   channels: ['email', 'in_app'], enabled: true,  recipient: 'All Admins' },
  { id: 'n20', category: 'Security',  event: 'API key created or revoked',      severity: 'medium',   channels: ['email'],           enabled: true,  recipient: 'All Admins' },
  { id: 'n21', category: 'Account',   event: 'Workspace plan changed',          severity: 'info',     channels: ['email'],           enabled: true,  recipient: 'Workspace Owner' },
  { id: 'n22', category: 'Account',   event: 'Billing payment failed',          severity: 'critical', channels: ['email', 'in_app'], enabled: true,  recipient: 'Workspace Owner' },
]

export const auditEvents: AuditEvent[] = [
  { id: 'a1',  timestamp: '2026-08-07T14:32:11Z', user: 'Sarah Chen',      userEmail: 'sarah.chen@acmecorp.com',    action: 'Updated branding',              resource: 'Branding Config',      resourceId: 'brand-001',   module: 'Administration', description: 'Updated primary brand color to #4F46E5 and uploaded new company logo.',                    result: 'success', ip: '192.168.1.45',  device: 'Chrome / macOS' },
  { id: 'a2',  timestamp: '2026-08-07T14:18:05Z', user: 'Marcus Webb',     userEmail: 'marcus.webb@acmecorp.com',   action: 'Changed notification settings',  resource: 'Notification Rules',   resourceId: 'notif-rules', module: 'Administration', description: 'Enabled SMS channel for SIP trunk disconnection alerts.',                                   result: 'success', ip: '10.0.0.22',     device: 'Firefox / Windows' },
  { id: 'a3',  timestamp: '2026-08-07T13:55:42Z', user: 'Sarah Chen',      userEmail: 'sarah.chen@acmecorp.com',    action: 'Updated workspace settings',     resource: 'Workspace Settings',   resourceId: 'ws-001',      module: 'Administration', description: 'Changed default timezone from UTC to America/New_York.',                                    result: 'success', ip: '192.168.1.45',  device: 'Chrome / macOS' },
  { id: 'a4',  timestamp: '2026-08-07T13:40:19Z', user: 'James Okafor',    userEmail: 'james.okafor@acmecorp.com',  action: 'Created agent',                  resource: 'AI Agent',             resourceId: 'agent-019',   module: 'AI Agents',      description: 'Created new outbound sales agent "Apex Sales Bot v2" with GPT-4o provider.',               result: 'success', ip: '172.16.0.8',    device: 'Chrome / Linux' },
  { id: 'a5',  timestamp: '2026-08-07T13:22:07Z', user: 'Priya Nair',      userEmail: 'priya.nair@acmecorp.com',    action: 'Updated agent configuration',    resource: 'AI Agent',             resourceId: 'agent-007',   module: 'AI Agents',      description: 'Modified system prompt and increased max response tokens to 1024 for Support Agent.',       result: 'success', ip: '10.0.1.14',     device: 'Safari / macOS' },
  { id: 'a6',  timestamp: '2026-08-07T12:58:33Z', user: 'Marcus Webb',     userEmail: 'marcus.webb@acmecorp.com',   action: 'Changed provider configuration', resource: 'LLM Provider',         resourceId: 'prov-openai', module: 'AI Providers',   description: 'Updated OpenAI API key and set rate limit to 500 RPM.',                                     result: 'success', ip: '10.0.0.22',     device: 'Firefox / Windows' },
  { id: 'a7',  timestamp: '2026-08-07T12:41:50Z', user: 'James Okafor',    userEmail: 'james.okafor@acmecorp.com',  action: 'Enabled provider',               resource: 'STT Provider',         resourceId: 'prov-deepgram', module: 'AI Providers', description: 'Enabled Deepgram Nova-2 as primary STT provider for workspace.',                            result: 'success', ip: '172.16.0.8',    device: 'Chrome / Linux' },
  { id: 'a8',  timestamp: '2026-08-07T12:15:22Z', user: 'Priya Nair',      userEmail: 'priya.nair@acmecorp.com',    action: 'Updated campaign',               resource: 'Campaign',             resourceId: 'camp-042',    module: 'Campaigns',      description: 'Updated calling schedule for "Q3 Renewal Outreach" campaign to 9AM–6PM EST.',              result: 'success', ip: '10.0.1.14',     device: 'Safari / macOS' },
  { id: 'a9',  timestamp: '2026-08-07T11:50:08Z', user: 'Sarah Chen',      userEmail: 'sarah.chen@acmecorp.com',    action: 'Changed user permissions',       resource: 'User',                 resourceId: 'user-034',    module: 'Platform',       description: 'Promoted user "alex.torres@acmecorp.com" from Viewer to Campaign Manager role.',            result: 'success', ip: '192.168.1.45',  device: 'Chrome / macOS' },
  { id: 'a10', timestamp: '2026-08-07T11:33:45Z', user: 'System',          userEmail: 'system@platform',            action: 'API key auto-rotated',           resource: 'API Key',              resourceId: 'key-webhook-01', module: 'Security',    description: 'Webhook signing key auto-rotated per 90-day rotation policy.',                              result: 'success', ip: '—',             device: 'System' },
  { id: 'a11', timestamp: '2026-08-07T11:10:29Z', user: 'Marcus Webb',     userEmail: 'marcus.webb@acmecorp.com',   action: 'Updated SIP configuration',      resource: 'SIP Trunk',            resourceId: 'sip-trunk-02', module: 'Telephony',     description: 'Updated SIP trunk "Twilio-Primary" codec preferences and failover timeout.',               result: 'success', ip: '10.0.0.22',     device: 'Firefox / Windows' },
  { id: 'a12', timestamp: '2026-08-07T10:48:14Z', user: 'James Okafor',    userEmail: 'james.okafor@acmecorp.com',  action: 'Disabled provider',              resource: 'TTS Provider',         resourceId: 'prov-azure-tts', module: 'AI Providers', description: 'Disabled Azure Neural TTS provider due to latency issues. ElevenLabs set as fallback.',     result: 'success', ip: '172.16.0.8',    device: 'Chrome / Linux' },
  { id: 'a13', timestamp: '2026-08-07T10:22:57Z', user: 'Priya Nair',      userEmail: 'priya.nair@acmecorp.com',    action: 'Created SIP configuration',      resource: 'SIP Trunk',            resourceId: 'sip-trunk-04', module: 'Telephony',     description: 'Created new SIP trunk "Vonage-Backup" with 50 concurrent channel limit.',                  result: 'success', ip: '10.0.1.14',     device: 'Safari / macOS' },
  { id: 'a14', timestamp: '2026-08-07T09:55:03Z', user: 'Sarah Chen',      userEmail: 'sarah.chen@acmecorp.com',    action: 'Updated workspace settings',     resource: 'Workspace Settings',   resourceId: 'ws-001',      module: 'Administration', description: 'Enabled call transcription by default for all new agents.',                                 result: 'success', ip: '192.168.1.45',  device: 'Chrome / macOS' },
  { id: 'a15', timestamp: '2026-08-07T09:30:18Z', user: 'Marcus Webb',     userEmail: 'marcus.webb@acmecorp.com',   action: 'Failed login attempt',           resource: 'Auth',                 resourceId: 'user-034',    module: 'Security',       description: 'Failed login attempt for user "alex.torres@acmecorp.com" from unrecognized IP.',            result: 'failure', ip: '203.0.113.42',  device: 'Unknown / Unknown' },
  { id: 'a16', timestamp: '2026-08-07T09:12:44Z', user: 'James Okafor',    userEmail: 'james.okafor@acmecorp.com',  action: 'Exported audit logs',            resource: 'Audit Logs',           resourceId: 'export-2026-08', module: 'Administration', description: 'Exported audit log CSV for date range 2026-07-01 to 2026-07-31.',                          result: 'success', ip: '172.16.0.8',    device: 'Chrome / Linux' },
  { id: 'a17', timestamp: '2026-08-06T17:44:22Z', user: 'Priya Nair',      userEmail: 'priya.nair@acmecorp.com',    action: 'Updated agent configuration',    resource: 'AI Agent',             resourceId: 'agent-012',   module: 'AI Agents',      description: 'Updated voice configuration for "Billing Support Agent" to use ElevenLabs Rachel voice.',  result: 'success', ip: '10.0.1.14',     device: 'Safari / macOS' },
  { id: 'a18', timestamp: '2026-08-06T16:58:09Z', user: 'Sarah Chen',      userEmail: 'sarah.chen@acmecorp.com',    action: 'Created API key',                resource: 'API Key',              resourceId: 'key-crm-int-03', module: 'Security',    description: 'Created new API key "CRM Integration v3" with read-only scope for contacts endpoint.',     result: 'success', ip: '192.168.1.45',  device: 'Chrome / macOS' },
  { id: 'a19', timestamp: '2026-08-06T15:30:55Z', user: 'Marcus Webb',     userEmail: 'marcus.webb@acmecorp.com',   action: 'Updated routing configuration',  resource: 'Provider Routing',     resourceId: 'routing-001', module: 'AI Providers',   description: 'Updated LLM fallback chain: GPT-4o → Claude 3.5 Sonnet → Gemini 1.5 Pro.',                result: 'success', ip: '10.0.0.22',     device: 'Firefox / Windows' },
  { id: 'a20', timestamp: '2026-08-06T14:15:33Z', user: 'James Okafor',    userEmail: 'james.okafor@acmecorp.com',  action: 'Changed user permissions',       resource: 'Role',                 resourceId: 'role-campaign-mgr', module: 'Platform',  description: 'Added "Export Contacts" permission to Campaign Manager role.',                              result: 'success', ip: '172.16.0.8',    device: 'Chrome / Linux' },
  { id: 'a21', timestamp: '2026-08-06T13:02:17Z', user: 'System',          userEmail: 'system@platform',            action: 'Data retention cleanup',         resource: 'Recordings',           resourceId: 'retention-job-0806', module: 'Administration', description: 'Automated retention job deleted 1,247 call recordings older than 90 days.',             result: 'success', ip: '—',             device: 'System' },
  { id: 'a22', timestamp: '2026-08-06T11:45:08Z', user: 'Priya Nair',      userEmail: 'priya.nair@acmecorp.com',    action: 'Updated campaign',               resource: 'Campaign',             resourceId: 'camp-038',    module: 'Campaigns',      description: 'Paused "Summer Promo Outreach" campaign due to low contact rate.',                          result: 'success', ip: '10.0.1.14',     device: 'Safari / macOS' },
  { id: 'a23', timestamp: '2026-08-06T10:20:44Z', user: 'Sarah Chen',      userEmail: 'sarah.chen@acmecorp.com',    action: 'Updated branding',              resource: 'Branding Config',      resourceId: 'brand-001',   module: 'Administration', description: 'Updated application title to "VoiceAI Platform — Acme Corp" and login page tagline.',       result: 'success', ip: '192.168.1.45',  device: 'Chrome / macOS' },
  { id: 'a24', timestamp: '2026-08-05T16:33:21Z', user: 'Marcus Webb',     userEmail: 'marcus.webb@acmecorp.com',   action: 'Revoked API key',                resource: 'API Key',              resourceId: 'key-legacy-01', module: 'Security',     description: 'Revoked legacy API key "Old Webhook Integration" — key had not been used in 180 days.',    result: 'success', ip: '10.0.0.22',     device: 'Firefox / Windows' },
  { id: 'a25', timestamp: '2026-08-05T14:10:59Z', user: 'James Okafor',    userEmail: 'james.okafor@acmecorp.com',  action: 'Created agent',                  resource: 'AI Agent',             resourceId: 'agent-020',   module: 'AI Agents',      description: 'Created "Appointment Reminder Bot" from Healthcare template with Twilio voice.',            result: 'success', ip: '172.16.0.8',    device: 'Chrome / Linux' },
]
