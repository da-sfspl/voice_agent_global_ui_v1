import { Shell } from '@/components/layout/shell'
import { CampaignScheduling } from '@/components/campaigns/scheduling'

export const metadata = { title: 'Campaign Scheduling — VoiceAI Platform' }

export default function SchedulingPage() {
  return (
    <Shell>
      <CampaignScheduling />
    </Shell>
  )
}
