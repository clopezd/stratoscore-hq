import { ClientFeedbackForm } from '@/features/videndum/components/ClientFeedbackForm'

export const metadata = {
  title: 'Feedback - Videndum | StratosCore',
  description: 'Cuestionario para optimizar el dashboard de análisis Videndum'
}

export default function FeedbackPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientFeedbackForm />
    </div>
  )
}
