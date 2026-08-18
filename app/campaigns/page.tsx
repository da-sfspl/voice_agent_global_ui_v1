import { Shell } from '@/components/layout/shell'
import { CampaignManagement } from '@/components/campaigns/campaign-management'

export const metadata = { title: 'Campaign Management — VoiceAI Platform' }

export default function CampaignsPage() {
  return (
    <Shell>
      <CampaignManagement />
    </Shell>
  )
}
