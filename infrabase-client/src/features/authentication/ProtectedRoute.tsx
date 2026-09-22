import { useEffect, type ReactNode } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'
import { startLogin } from './authApi'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, error, refresh } = useAuth()

  useEffect(() => {
    if (!loading && !user && !error) startLogin()
  }, [error, loading, user])

  useEffect(() => {
    const revalidate = () => refresh()
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'infrabase-auth-change') revalidate()
    }
    window.addEventListener('focus', revalidate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('focus', revalidate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [refresh])

  if (loading)
    return (
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100svh',
          gap: 0,
          padding: 3,
        }}
        role="status"
        aria-live="polite"
      >
        <Typography>Checking your session...</Typography>
      </Box>
    )

  if (error)
    return (
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100svh',
          gap: 2,
          padding: 3,
        }}
        role="alert"
      >
        <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Connection issue
          </Typography>
          <Alert severity="error" sx={{ my: 2 }}>
            {error.message}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </Box>
      </Box>
    )

  if (!user)
    return (
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100svh',
          padding: 3,
        }}
        aria-live="polite"
      >
        <Typography>Redirecting to sign in...</Typography>
      </Box>
    )

  return <>{children}</>
}
