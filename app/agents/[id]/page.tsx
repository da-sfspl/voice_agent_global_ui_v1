import { Shell } from '@/components/layout/shell'
import { AgentDetail } from '@/components/agents/agent-detail'
import { agents } from '@/lib/data'

export const metadata = { title: 'Agent Details — VoiceAI Platform' }

export default async function AgentDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const agent = agents.find((a) => a.id === id) ?? agents[0]
  
  return (
    <Shell>
      <AgentDetail agent={agent} />
    </Shell>
  )
}
