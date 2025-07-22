'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import styled from '@emotion/styled'

import type { VerticalNavContextProps } from '@menu/contexts/verticalNavContext'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

type LogoTextProps = {
  isHovered?: VerticalNavContextProps['isHovered']
  isCollapsed?: VerticalNavContextProps['isCollapsed']
  transitionDuration?: VerticalNavContextProps['transitionDuration']
  isBreakpointReached?: VerticalNavContextProps['isBreakpointReached']
  color?: CSSProperties['color']
}

const LogoText = styled.span<LogoTextProps>`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 1rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.25px;
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, isBreakpointReached }) =>
    !isBreakpointReached && isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0;'
      : 'opacity: 1; margin-inline-start: 12px;'}
`

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  const logoTextRef = useRef<HTMLSpanElement>(null)

  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()
  const { layout, mode } = settings

  useEffect(() => {
    if (layout !== 'collapsed') return

    if (logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
  }, [isHovered, layout, isBreakpointReached])

  const logoSrc = mode === 'dark' ? '/images/project/logoWhite.png' : '/images/project/logo.png'

  return (
    <div className="flex items-center ms-3 mt-2">
      <img
        src={logoSrc}
        alt="Logo"
        className="w-12 h-auto object-contain"
      />
      <LogoText
        ref={logoTextRef}
        color={color}
        isHovered={isHovered}
        isCollapsed={layout === 'collapsed'}
        transitionDuration={transitionDuration}
        isBreakpointReached={isBreakpointReached}
      >
        One21 ERP
      </LogoText>
    </div>
  )
}

export default Logo
