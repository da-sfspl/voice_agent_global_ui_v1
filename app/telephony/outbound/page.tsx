import { Shell } from '@/components/layout/shell'
import { OutboundCalls } from '@/components/telephony/outbound-calls'

export const metadata = { title: 'Outbound Calls — VoiceAI Platform' }

export default function OutboundCallsPage() {
  return (
    <Shell>
      <OutboundCalls />
    </Shell>
  )
}
