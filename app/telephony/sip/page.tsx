import { Shell } from '@/components/layout/shell'
import { SipConfiguration } from '@/components/telephony/sip-configuration'

export const metadata = { title: 'SIP Configuration — VoiceAI Platform' }

export default function SipConfigPage() {
  return (
    <Shell>
      <SipConfiguration />
    </Shell>
  )
}
