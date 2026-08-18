import { Shell } from '@/components/layout/shell'
import { LiveCallsView } from '@/components/telephony/live-calls'

export const metadata = { title: 'Live Calls — VoiceAI Platform' }

export default function LiveCallsPage() {
  return (
    <Shell>
      <LiveCallsView />
    </Shell>
  )
}
