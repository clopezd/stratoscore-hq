export interface Project {
  id: number
  title: string
  category: 'comercial' | 'pintura' | 'restauracion' | 'waterproofing'
  description: string
  image: string
  location?: string
  date?: string
}

export const projectsData: Project[] = [
  {
    id: 1,
    title: 'Hotel Miami - Renovación Completa',
    category: 'comercial',
    description: 'Renovación de 2000 sqft en hotel premium',
    image: '/tico-restoration/images/001_hotel.jpg',
    location: 'Miami, FL',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Office Space - Pintura Profesional',
    category: 'pintura',
    description: 'Pintura interior de espacio comercial',
    image: '/tico-restoration/images/002_office.jpg',
    location: 'Sarasota, FL',
    date: '2024-01-20'
  },
  {
    id: 3,
    title: 'Condo Miami Beach - Restauración',
    category: 'restauracion',
    description: 'Restauración completa de 3000 sqft',
    image: '/tico-restoration/images/003_condo.jpg',
    location: 'Miami Beach, FL',
    date: '2024-02-01'
  },
  {
    id: 4,
    title: 'Restaurant - Waterproofing',
    category: 'waterproofing',
    description: 'Impermeabilización y sellado profesional',
    image: '/tico-restoration/images/004_restaurant.jpg',
    location: 'Tampa, FL',
    date: '2024-02-10'
  },
  {
    id: 5,
    title: 'Exterior Painting - Edificio Comercial',
    category: 'pintura',
    description: 'Pintura exterior de 5000 sqft',
    image: '/tico-restoration/images/005_exterior.jpg',
    location: 'Orlando, FL',
    date: '2024-02-20'
  },
  {
    id: 6,
    title: 'Multi-Family Project - Sarasota',
    category: 'restauracion',
    description: 'Proyecto multi-familia completo',
    image: '/tico-restoration/images/006_multifamily.jpg',
    location: 'Sarasota, FL',
    date: '2024-03-01'
  }
]

export const categoryLabels = {
  todos: 'Todos',
  comercial: 'Comercial',
  pintura: 'Pintura',
  restauracion: 'Restauración',
  waterproofing: 'Waterproofing'
}

export const contactInfo = {
  phone: '(941) 302-2837',
  email: 'service@ticorestorations.com',
  address: '1646 Clark Center Ave Unit B, Sarasota, FL 34238',
  instagram: 'https://www.instagram.com/ticorestorations/',
  hours: {
    weekdays: 'Lunes - Viernes: 8:00 AM - 6:00 PM',
    saturday: 'Sábados: 9:00 AM - 2:00 PM',
    sunday: 'Domingos: Cerrado'
  }
}
