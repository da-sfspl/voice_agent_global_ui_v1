import { Shell } from '@/components/layout/shell'
import { ContactsManager } from '@/components/campaigns/contacts'

export const metadata = { title: 'Contacts — VoiceAI Platform' }

export default function ContactsPage() {
  return (
    <Shell>
      <ContactsManager />
    </Shell>
  )
}
