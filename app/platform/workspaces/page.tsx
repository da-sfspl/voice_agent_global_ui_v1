import { Shell } from '@/components/layout/shell'
import { WorkspaceList } from '@/components/platform/workspace-list'

export const metadata = { title: 'Workspace Management — VoiceAI Platform' }

export default function WorkspacesPage() {
  return (
    <Shell>
      <WorkspaceList />
    </Shell>
  )
}
