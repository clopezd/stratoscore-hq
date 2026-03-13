/**
 * Configuración de marca del cliente activo.
 *
 * Para cambiar el cliente (white-label):
 *   1. Cambia `ClientLogo` al componente SVG del nuevo cliente.
 *   2. Cambia `CLIENT_NAME` al nombre de la empresa.
 *   3. (Opcional) Actualiza `CLIENT_SUBTITLE` para la barra lateral.
 *
 * Esta es la única fuente de verdad para la identidad del cliente
 * en el área autenticada (Header + SidebarNav).
 * La pantalla de login siempre muestra <StratoscoreLogo />.
 */

export { VidendumLogo as ClientLogo } from '@/shared/components/VidendumLogo'

export const CLIENT_NAME     = 'Videndum'
export const CLIENT_SUBTITLE = 'Sales Intelligence Platform'
