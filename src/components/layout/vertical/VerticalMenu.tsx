import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'

import { Menu, MenuItem, SubMenu, MenuSection } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'

import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: any
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/home' icon={<i className='tabler-smart-home' />}>Inicio</MenuItem>
        <MenuItem href='/dashboard' icon={<i className='tabler-dashboard' />}>Panel de control</MenuItem>

        <MenuSection label='Módulos ERP'>
          <SubMenu label='Compras' icon={<i className='tabler-shopping-cart' />}>
            <MenuItem href='/purchases/orders'>Órdenes</MenuItem>
            <MenuItem href='/purchases/requests'>Solicitudes</MenuItem>
            <MenuItem href='/purchases/reports'>Reportes</MenuItem>
          </SubMenu>

          <MenuItem href='/Empleados' icon={<i className='tabler-user' />}>Empleados</MenuItem>

          <SubMenu label='Ventas' icon={<i className='tabler-cash-register' />}>
            <MenuItem href='/sales/invoices'>Facturas</MenuItem>
            <MenuItem href='/sales/clients'>Clientes</MenuItem>
            <MenuItem href='/sales/reports'>Reportes</MenuItem>
          </SubMenu>

          <SubMenu label='Ticket' icon={<i className='tabler-box' />}>
            <MenuItem href='/ticket'>Productos</MenuItem>
            <MenuItem href='/inventory/movements'>Movimientos</MenuItem>
            <MenuItem href='/inventory/categories'>Categorías</MenuItem>
          </SubMenu>

          <SubMenu label='Administración' icon={<i className='tabler-settings' />}>
            <MenuItem href='/Empleados'>Usuarios</MenuItem>
            <MenuItem href='/admin/roles'>Roles</MenuItem>
            <MenuItem href='/admin/suppliers'>Proveedores</MenuItem>
          </SubMenu>
        </MenuSection>
        <MenuItem href='/configuracion' icon={<i className='tabler-settings' />}>Configuración</MenuItem>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
