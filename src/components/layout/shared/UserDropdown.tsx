'use client'

import { useRef, useState, useEffect } from 'react'
import type { MouseEvent } from 'react'

import { useRouter } from 'next/navigation'

import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

import { useSettings } from '@core/hooks/useSettings'

// ✅ Styled component para el indicador verde
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)',
})

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { settings } = useSettings()

  // Estado para almacenar el nombre del partner
  const [partnerName, setPartnerName] = useState<string>('')

  // useEffect que se ejecuta al montar el componente
  useEffect(() => {
  const fetchCookies = async () => {
    try {
      const res = await fetch('/api/sistem/auth')
      
      if (!res.ok) return
      const data = await res.json()

      setPartnerName( data.email || 'Usuario' )
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error)
    }
  }

  fetchCookies()
}, [])

  const handleDropdownOpen = () => setOpen(prev => !prev)

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) router.push(url)
    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) return
    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.replace('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap="circular"
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="mis-2"
      >
        <Avatar
          alt="User Avatar"
          src="/images/avatars/1.png"
          onClick={handleDropdownOpen}
          className="cursor-pointer bs-[38px] is-[38px]"
        />
      </Badge>

      <Popper
        open={open}
        transition
        disablePortal
        placement="bottom-end"
        anchorEl={anchorRef.current}
        className="min-is-[240px] !mbs-3 z-[1]"
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className="flex items-center plb-2 pli-6 gap-2" tabIndex={-1}>
                    <Avatar alt="User Avatar" src="/images/avatars/1.png" />
                    <div className="flex items-start flex-col">
                      <Typography className="font-medium" color="text.primary">
                        {partnerName || 'Usuario'}
                      </Typography>
                      <Typography variant="caption">
                        {partnerName ? 'Cuenta registrada' : 'Sin información'}
                      </Typography>
                    </div>
                  </div>
                  <Divider className="mlb-1" />
                  <div className="flex items-center plb-2 pli-3">
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="small"
                      endIcon={<i className="tabler-logout" />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
