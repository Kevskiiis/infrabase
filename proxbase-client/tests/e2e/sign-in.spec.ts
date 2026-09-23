import { test, expect } from '@playwright/test'

test('unauthenticated protected entry reaches the sign-in boundary', async ({ page }) => {
  await page.route('**/auth/session', async (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Authentication failed', code: 'AUTH_REQUIRED', detail: 'Sign-in is required.' }) }))
  await page.goto('/')
  await expect(page).toHaveURL(/auth\/login|localhost:5173/)
})
