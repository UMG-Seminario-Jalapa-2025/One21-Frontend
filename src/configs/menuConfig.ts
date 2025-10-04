// src/config/menuConfig.ts


export const menuConfig = [
  {
    type: 'item',
    label: 'Inicio',
    icon: 'tabler-smart-home',
    href: '/inicio',
    roles: ['app-admin', 'patient', 'default-roles-master', 'uma_authorization']
  },
  {
    type: 'section',
    label: 'Módulos ERP',
    children: [
      {
        type: 'item',
        label: 'Empleados',
        href: '/Empleados',
        icon: 'tabler-user',
        roles: ['app-admin', 'uma_authorization']
      },
      {
        type: 'item',
        label: 'Personas',
        href: '/personas',
        icon: 'tabler-users',
        roles: ['app-admin', 'patient', 'uma_authorization']
      },
      {
        type: 'submenu',
        label: 'Ticket',
        icon: 'tabler-box',
        roles: ['app-admin'],
        children: [
          { type: 'item', label: 'Asignar Tickets', href: '/ticket/asignar', roles: ['app-admin'] },
          { type: 'item', label: 'Prioridades', href: '/prioridades', roles: ['app-admin'] },
          { type: 'item', label: 'Categorías', href: '/categorias', roles: ['app-admin'] }
        ]
      },
      {
        type: 'submenu',
        label: 'Configuración',
        icon: 'tabler-settings',
        roles: ['app-admin'],
        children: [
          { type: 'item', label: 'Paises', href: '/countries', roles: ['app-admin', 'uma_authorization'] },
          { type: 'item', label: 'Roles', href: '/roles', roles: ['app-admin'] }
        ]
      }
    ]
  }
]
