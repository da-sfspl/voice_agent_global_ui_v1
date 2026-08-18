import { AppShell } from '@/components/layout/shell'
import { SystemHealthDashboard } from '@/components/monitoring/system-health'

export default function SystemHealthPage() {
  return (
    <AppShell>
      <SystemHealthDashboard />
    </AppShell>
  )
}
