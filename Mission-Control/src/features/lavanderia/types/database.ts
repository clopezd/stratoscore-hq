export type OrderStatus = 'pendiente' | 'listo' | 'entregado'

export type CcOrderStatus = 'pendiente' | 'recogido' | 'en_preparacion' | 'en_camino' | 'entregado'

export interface CcOrder {
  id: string
  user_id: string
  client_name: string
  bags_count: number
  pickup_day: string
  pickup_time: 'AM' | 'PM'
  status: CcOrderStatus
  created_at: string
}

export interface OrderLead {
  id: string
  nombre: string
  bags_quantity: number
  pickup_day: string
  total: number
  status: OrderStatus
  created_at: string
}
