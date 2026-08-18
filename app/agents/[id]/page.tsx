import { Shell } from '@/components/layout/shell'
import { AgentDetail } from '@/components/agents/agent-detail'
import { agents } from '@/lib/data'

export const metadata = { title: 'Agent Details — VoiceAI Platform' }

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = agents.find((a) => a.id === params.id) ?? agents[0]
  return (
    <Shell>
      <AgentDetail agent={agent} />
    </Shell>
  )
}
