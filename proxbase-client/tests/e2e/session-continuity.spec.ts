import { test, expect } from '@playwright/test'

test('session bootstrap displays the protected shell with a controlled session', async ({ page }) => {
  await page.route('**/auth/session', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true, user: { subject: 'test', tenant_id: 'tenant', name: 'Test User' } }) }))
  await page.goto('/')
  await expect(page.getByText('Private workspace')).toBeVisible()
})
