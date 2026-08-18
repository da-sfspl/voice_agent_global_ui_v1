import { cn } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

const services = [
  { name: 'LLM Gateway (OpenAI)', status: 'healthy', latency: '142ms', uptime: '99.98%' },
  { name: 'STT Engine (Deepgram)', status: 'healthy', latency: '89ms', uptime: '99.95%' },
  { name: 'TTS Engine (ElevenLabs)', status: 'healthy', latency: '201ms', uptime: '99.91%' },
  { name: 'SIP Trunk (LiveKit)', status: 'warning', latency: '380ms', uptime: '98.74%' },
  { name: 'Campaign Worker', status: 'healthy', latency: '—', uptime: '100%' },
  { name: 'Telephony Adapter (VoBiz)', status: 'healthy', latency: '55ms', uptime: '99.99%' },
]

const statusIcons = {
  healthy: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
  error: <XCircle className="h-3.5 w-3.5 text-destructive" />,
}

export function SystemHealthWidget() {
  const issues = services.filter((s) => s.status !== 'healthy').length

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">System Health</h3>
          <p className="text-xs text-muted-foreground">Provider & service status</p>
        </div>
        {issues > 0 ? (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {issues} warning
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All systems operational
          </span>
        )}
      </div>
      <div className="space-y-2">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center gap-2.5 py-1">
            {statusIcons[svc.status as keyof typeof statusIcons]}
            <span className="flex-1 text-xs text-foreground">{svc.name}</span>
            <span className="text-[11px] text-muted-foreground">{svc.latency}</span>
            <span
              className={cn(
                'text-[11px] font-medium',
                svc.status === 'healthy' ? 'text-emerald-600' : 'text-amber-600'
              )}
            >
              {svc.uptime}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
