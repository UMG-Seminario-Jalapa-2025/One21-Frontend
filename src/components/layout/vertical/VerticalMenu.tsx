import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'

import { Menu, MenuItem, SubMenu, MenuSection } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

import { menuConfig } from '@/configs/menuConfig'

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
  roles: string[]
}

const VerticalMenu = ({ scrollMenu, roles }: Props) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const hasAccess = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true

    return roles.some(r => itemRoles.includes(r))
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? { className: 'bs-full overflow-y-auto overflow-x-hidden', onScroll: container => scrollMenu(container, false) }
        : { options: { wheelPropagation: false, suppressScrollX: true }, onScrollY: container => scrollMenu(container, true) })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => (
          <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
            <i className='tabler-chevron-right' />
          </StyledVerticalNavExpandIcon>
        )}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {menuConfig.map((item, index) => {
          if (item.type === 'item' && hasAccess(item.roles)) {
            return (
              <MenuItem key={index} href={item.href} icon={item.icon ? <i className={item.icon} /> : undefined}>
                {item.label}
              </MenuItem>
            )
          }

          if (item.type === 'section') {
            return (
              <MenuSection key={index} label={item.label}>

                {item.children?.map((child, cIndex) => {
                  if (child.type === 'item' && hasAccess(child.roles)) {
                    return (
                      <MenuItem key={cIndex} href={child.href} icon={child.icon ? <i className={child.icon} /> : undefined}>
                        {child.label}
                      </MenuItem>
                    )
                  }

                  if (child.type === 'submenu' && hasAccess(child.roles)) {
                    return (
                      <SubMenu key={cIndex} label={child.label} icon={child.icon ? <i className={child.icon} /> : undefined}>
                        {child.children?.map((sub, sIndex) =>
                          hasAccess(sub.roles) ? (
                            <MenuItem key={sIndex} href={sub.href}>
                              {sub.label}
                            </MenuItem>
                          ) : null
                        )}
                      </SubMenu>
                    )
                  }

                  return null
                })}
              </MenuSection>
            )
          }

          return null
        })}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
