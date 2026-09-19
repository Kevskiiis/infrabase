import { useState } from 'react'
import { Alert, Box, Button } from '@mui/material'
import { useAuth } from './AuthProvider'

export function SignOutButton() {
  const { logout } = useAuth()
  const [error, setError] = useState<string | null>(null)

  async function handleSignOut() {
    setError(null)
    try {
      await logout()
      window.location.assign('/')
    } catch {
      setError('Sign-out is temporarily unavailable. Try again.')
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
      <Button variant="outlined" size="small" onClick={handleSignOut}>
        Sign out
      </Button>
      {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
    </Box>
  )
}
