export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'pickup'
  | 'received'
  | 'washing'
  | 'drying'
  | 'folding'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled'

export interface LaundryOrder {
  id: string
  customer_id: string
  customer_name: string
  customer_phone: string
  status: OrderStatus
  pickup_address: string
  delivery_address: string
  pickup_date: string
  delivery_date: string | null
  assigned_driver_id: string | null
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
  | 'wash_fold'
  | 'wash_iron'
  | 'dry_clean'
  | 'iron_only'
  | 'special'

export interface Driver {
  id: string
  user_id: string
  full_name: string
  phone: string
  vehicle_type: string
  is_active: boolean
  current_location: { lat: number; lng: number } | null
  active_orders: number
}

export interface DashboardStats {
  orders_today: number
  orders_in_progress: number
  orders_ready: number
  orders_delivering: number
  revenue_today: number
  active_drivers: number
}
