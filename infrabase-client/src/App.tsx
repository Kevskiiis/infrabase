import { AppBar, Box, Container, Stack, Toolbar, Typography } from '@mui/material'
import './App.css'
import { ProtectedRoute } from './features/entra-session-auth/ProtectedRoute'
import { SignOutButton } from './features/entra-session-auth/SignOutButton'
import { useAuth } from './features/entra-session-auth/AuthProvider'

function Workspace() {
  const { user } = useAuth()

  return (
    <Box sx={{ minHeight: '100svh', background: 'linear-gradient(135deg, #f7f4ed 0%, #eef3ef 52%, #e1eceb 100%)' }}>
      <AppBar position="static" sx={{ boxShadow: 'none', borderBottom: '1px solid rgba(29, 42, 42, .14)', background: 'transparent' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 34,
                height: 34,
                background: '#d3563c',
                color: '#fffaf2',
                fontWeight: 700,
                fontSize: '0.75rem',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              IB
            </Box>
            <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif', fontWeight: 700 }}>
              Infrabase
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="body2">
              {user?.name ?? user?.email ?? 'Authenticated user'}
            </Typography>
            <SignOutButton />
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: '#d3563c',
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
              }}
            >
              Private workspace
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Georgia, serif',
                fontWeight: 400,
                lineHeight: 0.98,
                my: 1,
              }}
            >
              Build with a clear view of your infrastructure.
            </Typography>
            <Typography sx={{ color: '#526161', fontSize: '1.1rem', maxWidth: 540 }}>
              Your backend session is active. Protected resources can now be loaded without exposing provider tokens to the browser.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              color: '#526161',
              fontSize: '.78rem',
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              alignItems: 'center',
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#39806c', boxShadow: '0 0 0 5px rgba(57, 128, 108, .12)' }} />
            <Typography variant="caption">Session verified</Typography>
            <Box sx={{ width: 1, height: 16, background: 'rgba(29, 42, 42, .2)' }} />
            <Typography variant="caption">Expires within 12 hours</Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

function App() {
  return <ProtectedRoute><Workspace /></ProtectedRoute>
}

export default App
