import { Routes, Route } from 'react-router-dom'
import { Box, Container, Stack, Typography } from '@mui/material'
import './App.css'
import { ProtectedRoute } from './features/authentication/ProtectedRoute'
import { SignOutButton } from './features/authentication/SignOutButton'
import { useAuth } from './features/authentication/AuthProvider'
import { AppSidebar } from './features/navigation/AppSidebar'

/**
 * Services Placeholder Page
 * 
 * A non-blank authenticated page that demonstrates sidebar navigation
 * and serves as a placeholder until Services functionality is separately specified.
 */
function ServicesPage() {
  const { user } = useAuth()

  return (
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
            Workspace
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
            Services
          </Typography>
          <Typography sx={{ color: '#526161', fontSize: '1.1rem', maxWidth: 540 }}>
            Services management will be available here. This is a placeholder page while Services functionality is being developed.
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
          <Typography variant="caption">Session active for {user?.name ?? user?.email ?? 'user'}</Typography>
        </Stack>
      </Stack>
    </Container>
  )
}

/**
 * Settings Placeholder Page
 * 
 * A non-blank authenticated page that demonstrates sidebar navigation
 * and serves as a placeholder until Settings functionality is separately specified.
 */
function SettingsPage() {
  const { user } = useAuth()

  return (
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
            Configuration
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
            Settings
          </Typography>
          <Typography sx={{ color: '#526161', fontSize: '1.1rem', maxWidth: 540 }}>
            Account settings and preferences will be available here. This is a placeholder page while Settings functionality is being developed.
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
          <Typography variant="caption">Session active for {user?.name ?? user?.email ?? 'user'}</Typography>
          <Box sx={{ width: 1, height: 16, background: 'rgba(29, 42, 42, .2)' }} />
          <SignOutButton />
        </Stack>
      </Stack>
    </Container>
  )
}

/**
 * Authenticated Landing Page
 * 
 * The default authenticated workspace with sidebar, branding, and session status.
 */
function AuthenticatedLandingPage() {
  return (
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
  )
}

/**
 * AuthenticatedShell Component
 * 
 * The main authenticated workspace with:
 * - Persistent sidebar with navigation
 * - Content area that renders pages via React Router
 * - Protected by the existing ProtectedRoute guard
 */
function AuthenticatedShell() {
  return (
    <AppSidebar>
      <Box sx={{ background: 'linear-gradient(135deg, #f7f4ed 0%, #eef3ef 52%, #e1eceb 100%)' }}>
        <Routes>
          <Route path="/" element={<AuthenticatedLandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Box>
    </AppSidebar>
  )
}

function App() {
  return (
    <ProtectedRoute>
      <AuthenticatedShell />
    </ProtectedRoute>
  )
}

export default App
