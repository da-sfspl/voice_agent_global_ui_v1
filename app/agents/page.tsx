import { Shell } from '@/components/layout/shell'
import { AgentList } from '@/components/agents/agent-list'

export const metadata = { title: 'AI Agents — VoiceAI Platform' }

export default function AgentsPage() {
  return (
    <Shell>
      <AgentList />
    </Shell>
  )
}
