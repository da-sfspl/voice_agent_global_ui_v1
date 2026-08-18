import { Shell } from '@/components/layout/shell'
import { PublishAgent } from '@/components/agents/publish-agent'
import { agents } from '@/lib/data'

export const metadata = { title: 'Publish Agent — VoiceAI Platform' }

export default function PublishAgentPage({ params }: { params: { id: string } }) {
  const agent = agents.find((a) => a.id === params.id) ?? agents[0]
  return (
    <Shell>
      <PublishAgent agent={agent} />
    </Shell>
  )
}
