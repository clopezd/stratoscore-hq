import { redirect } from 'next/navigation'

export default function RootPage() {
  // Si llegan aquí es porque el middleware dejó pasar (tiene sesión)
  // Usuarios sin sesión ven /landing.html via rewrite en middleware
  redirect('/videndum')
}
