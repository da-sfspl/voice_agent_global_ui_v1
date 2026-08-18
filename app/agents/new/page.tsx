import { Shell } from '@/components/layout/shell'
import { CreateAgentWizard } from '@/components/agents/create-agent-wizard'

export const metadata = { title: 'Create Agent — VoiceAI Platform' }

export default function NewAgentPage() {
  return (
    <Shell>
      <CreateAgentWizard />
    </Shell>
  )
}
