import { FormularioAgendarEstudio } from '@/features/medcare/components/FormularioAgendarEstudio'

// Página PÚBLICA - no requiere autenticación
// URL para compartir: /medcare/agendar-estudio
// Soporta UTM params: ?utm_source=google&utm_medium=cpc&utm_campaign=mamografia
export default function AgendarEstudioPage() {
  return <FormularioAgendarEstudio />
}
