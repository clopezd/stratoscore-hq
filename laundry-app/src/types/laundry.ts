export type OrderStatus =
  | 'pending'       // Cliente creó el pedido
  | 'confirmed'     // Lavandería confirmó
  | 'pickup'        // En camino a recoger
  | 'received'      // Recibida en lavandería
  | 'washing'       // En proceso de lavado
  | 'drying'        // Secando
  | 'folding'       // Doblando
  | 'ready'         // Lista para entrega
  | 'delivering'    // En camino al cliente
  | 'delivered'     // Entregada
  | 'cancelled'     // Cancelada

export interface LaundryOrder {
  id: string
  customer_id: string
  status: OrderStatus
  pickup_address: string
  delivery_address: string
  pickup_date: string
  delivery_date: string | null
  items: LaundryItem[]
  total_price: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LaundryItem {
  id: string
  order_id: string
  service_type: ServiceType
  quantity: number
  unit_price: number
  description: string | null
}

export type ServiceType =
  | 'wash_fold'      // Lavado y doblado
  | 'wash_iron'      // Lavado y planchado
  | 'dry_clean'      // Limpieza en seco
  | 'iron_only'      // Solo planchado
  | 'special'        // Servicio especial

export interface Customer {
  id: string
  user_id: string
  full_name: string
  phone: string
  email: string
  default_address: string
  created_at: string
}

export interface Driver {
  id: string
  user_id: string
  full_name: string
  phone: string
  vehicle_type: string
  is_active: boolean
  current_location: { lat: number; lng: number } | null
}
