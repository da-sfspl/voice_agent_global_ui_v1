import { cn } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

const services = [
  { name: 'LLM', provider: 'OpenAI', status: 'healthy', latency: '142ms' },
  { name: 'STT', provider: 'Deepgram', status: 'healthy', latency: '89ms' },
  { name: 'TTS', provider: 'ElevenLabs', status: 'healthy', latency: '201ms' },
  { name: 'Telephony', provider: 'VoBiz', status: 'warning', latency: '380ms' },
]

const statusIcons = {
  healthy: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
  error: <XCircle className="h-3.5 w-3.5 text-destructive" />,
}

const statusLabels: Record<string, string> = {
  healthy: 'Normal',
  warning: 'Degraded',
  error: 'Down',
}

const statusText: Record<string, string> = {
  healthy: 'text-emerald-600',
  warning: 'text-amber-600',
  error: 'text-destructive',
}

export function SystemHealthWidget() {
  const issues = services.filter((s) => s.status !== 'healthy').length

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI &amp; Telephony Health</h3>
          <p className="text-xs text-muted-foreground">Status of services used by your agents</p>
        </div>
        {issues > 0 ? (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {issues} {issues === 1 ? 'service needs' : 'services need'} attention
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All services operational
          </span>
        )}
      </div>

      {/* Service list */}
      <div className="space-y-1">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5">
            <span className="shrink-0">{statusIcons[svc.status as keyof typeof statusIcons]}</span>

            {/* Service category + provider */}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs font-medium text-foreground">{svc.name}</span>
              <span className="truncate text-[10px] text-muted-foreground">{svc.provider}</span>
            </div>

            {/* Latency */}
            <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
              {svc.latency}
            </span>

            {/* Status label */}
            <span className={cn('w-16 shrink-0 text-right text-[11px] font-medium', statusText[svc.status])}>
              {statusLabels[svc.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}