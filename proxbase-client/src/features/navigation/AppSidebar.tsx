import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Tooltip, Typography } from '@mui/material'
import { Menu as MenuIcon, MenuOpen as MenuOpenIcon } from '@mui/icons-material'
import { getAllNavigationDestinations, getDestinationByPath } from './navigationItems'

interface AppSidebarProps {
  children?: React.ReactNode
}

export const AppSidebar: FC<AppSidebarProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = useState(true)

  const destinations = getAllNavigationDestinations()
  const activeDestination = useMemo(() => getDestinationByPath(location.pathname), [location.pathname])

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const sidebarWidth = expanded ? 240 : 80
  const headerHeight = 64

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh' }}>
      <Paper
        component="nav"
        sx={{
          width: sidebarWidth,
          height: '100svh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          transition: 'width 0.3s ease-in-out',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 1200,
        }}
      >
        {/* Header - Branding */}
        <Box
          sx={{
            height: headerHeight,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            px: 1.5,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            flexShrink: 0,
            gap: 1,
            overflow: 'hidden',
          }}
        >
          {expanded && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                flex: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 30,
                  height: 30,
                  background: '#d3563c',
                  color: '#fffaf2',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  fontFamily: 'Arial, sans-serif',
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              >
                IB
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em',
                  color: '#1f1f1f',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Proxbase
              </Typography>
            </Box>
          )}

          {!expanded && (
            <Tooltip title="Expand sidebar">
              <ListItemButton
                onClick={() => setExpanded(true)}
                sx={{
                  width: 40,
                  minHeight: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 0,
                  py: 0,
                  color: '#1f1f1f',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  ml: 'auto',
                  mr: 0,
                }}
              >
                <MenuIcon fontSize="small" sx={{ display: 'block' }} />
              </ListItemButton>
            </Tooltip>
          )}

          {expanded && (
            <Tooltip title="Collapse sidebar">
              <ListItemButton
                onClick={() => setExpanded(false)}
                sx={{
                  minWidth: 20,
                  width: 20,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 0,
                  py: 0,
                  color: '#1f1f1f',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  ml: 'auto',
                }}
              >
                <MenuOpenIcon fontSize="small" sx={{ display: 'block' }} />
              </ListItemButton>
            </Tooltip>
          )}
        </Box>

        {/* Body - Navigation */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: expanded ? 1 : 0.5, py: 1 }}>
          <List sx={{ width: '100%' }}>
            {destinations
              .filter((dest) => dest.location === 'body')
              .map((destination) => {
                const isActive = activeDestination?.id === destination.id
                const Icon = destination.icon
                return (
                  <ListItem key={destination.id} disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip title={expanded ? '' : destination.label}>
                      <ListItemButton
                        onClick={() => handleNavigate(destination.path)}
                        selected={isActive}
                        aria-current={isActive ? 'page' : undefined}
                        sx={{
                          borderRadius: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(211, 86, 60, 0.1)',
                            color: '#d3563c',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: expanded ? 40 : 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Icon />
                        </ListItemIcon>
                        {expanded && <ListItemText primary={destination.label} />}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                )
              })}
          </List>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, marginLeft: `${sidebarWidth}px`, transition: 'margin-left 0.3s ease-in-out', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  )
}
