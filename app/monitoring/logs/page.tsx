import { AppShell } from '@/components/layout/shell'
import { LogsViewer } from '@/components/monitoring/logs-viewer'

export default function LogsPage() {
  return (
    <AppShell>
      <LogsViewer />
    </AppShell>
  )
}
