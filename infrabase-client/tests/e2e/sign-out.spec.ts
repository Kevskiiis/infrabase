import { test, expect } from '@playwright/test'

test('sign out clears the controlled browser session', async ({ page }) => {
  await page.route('**/auth/session', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true, user: { subject: 'test', tenant_id: 'tenant', name: 'Test User' } }) }))
  await page.route('**/auth/logout', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: false }) }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/localhost:5173\/$/)
})
