import { Shell } from '@/components/layout/shell'
import { AgentVersioning } from '@/components/agents/agent-versioning'
import { agents } from '@/lib/data'

export const metadata = { title: 'Agent Versioning — VoiceAI Platform' }

export default function AgentVersionPage({ params }: { params: { id: string } }) {
  const agent = agents.find((a) => a.id === params.id) ?? agents[0]
  return (
    <Shell>
      <AgentVersioning agent={agent} />
    </Shell>
  )
}
