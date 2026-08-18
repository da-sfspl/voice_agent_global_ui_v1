import { Shell } from '@/components/layout/shell'
import { InboundCalls } from '@/components/telephony/inbound-calls'

export const metadata = { title: 'Inbound Calls — VoiceAI Platform' }

export default function InboundCallsPage() {
  return (
    <Shell>
      <InboundCalls />
    </Shell>
  )
}
