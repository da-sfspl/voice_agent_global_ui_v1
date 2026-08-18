import { AppShell } from '@/components/layout/shell'
import { AlertsManager } from '@/components/monitoring/alerts-manager'

export default function AlertsPage() {
  return (
    <AppShell>
      <AlertsManager />
    </AppShell>
  )
}
