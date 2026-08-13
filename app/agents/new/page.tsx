import { Shell } from '@/components/layout/shell'
import { CreateAgentWizard } from '@/components/agents/create-agent-wizard'
import { Suspense } from 'react'

export const metadata = { title: 'Create Agent — VoiceAI Platform' }

export default function NewAgentPage() {
  return (
    <Shell>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Loading wizard...</p>
        </div>
      }>
        <CreateAgentWizard />
      </Suspense>
    </Shell>
  )
}