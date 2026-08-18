import { Shell } from '@/components/layout/shell'
import { AgentConfig } from '@/components/agents/agent-config'
import { agents } from '@/lib/data'

export const metadata = { title: 'Agent Configuration — VoiceAI Platform' }

export default function AgentConfigPage({ params }: { params: { id: string } }) {
  const agent = agents.find((a) => a.id === params.id) ?? agents[0]
  return (
    <Shell>
      <AgentConfig agent={agent} />
    </Shell>
  )
}
