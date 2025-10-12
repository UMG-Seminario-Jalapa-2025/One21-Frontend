// src/config/menuConfig.ts


export const menuConfig = [
  {
    type: 'item',
    label: 'Inicio',
    icon: 'tabler-smart-home',
    href: '/inicio',
    roles: ['app-admin', 'patient', 'default-roles-master', 'uma_authorization', 'client']
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
        roles: ['app-admin']
      },
      {
        type: 'item',
        label: 'Personas',
        href: '/personas',
        icon: 'tabler-users',
        roles: ['app-admin']
      },
      {
        type: 'submenu',
        label: 'Ticket',
        icon: 'tabler-box',
        roles: ['app-admin', 'uma_authorization'],
        children: [
          { type: 'item', label: 'Crear Ticket', href: '/ticket/crear', roles: ['app-admin', 'client', 'employee'] },
          { type: 'item', label: 'Asignar Tickets', href: '/ticket/asignar', roles: ['app-admin'] },
          { type: 'item', label: 'Seguimiento de Tickets', href: '/kanban', roles: ['app-admin', 'employee'] },
          { type: 'item', label: 'Prioridades', href: '/prioridades', roles: ['app-admin'] },
          { type: 'item', label: 'Categorías', href: '/categorias', roles: ['app-admin'] },
          { type: 'item', label: 'Estados', href: '/status', roles: ['app-admin'] },
        ]
      },
      {
        type: 'submenu',
        label: 'Configuración',
        icon: 'tabler-settings',
        roles: ['app-admin', 'uma_authorization'],
        children: [
          { type: 'item', label: 'Paises', href: '/countries', roles: ['app-admin'] },
          { type: 'item', label: 'Roles', href: '/roles', roles: ['app-admin'] },
          { type: 'item', label: 'Puestos de trabajo', href: '/job_position', roles: ['app-admin'] },
          { type: 'item', label: 'Departamento de trabajo', href: '/employee_departaments', roles: ['app-admin'] },
          { type: 'item', label: 'Departamentos', href: '/departments', roles: ['app-admin'] },
          { type: 'item', label: 'Municipios', href: '/municipalities', roles: ['app-admin'] },
        ]
      }
    ]
  }
]
