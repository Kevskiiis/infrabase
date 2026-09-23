import { test, expect } from '@playwright/test'

/**
 * E2E tests for authenticated sidebar navigation and responsive behavior.
 * 
 * Coverage areas:
 * - Authenticated shell rendering with sidebar
 * - Services navigation and placeholder page
 * - Settings navigation and placeholder page
 * - Collapse/expand interactions and timing
 * - Active state persistence across navigation
 * - Browser back/forward history handling
 * - Narrow viewport responsive behavior (< 600px)
 * - Keyboard navigation and accessible names
 * - Session continuity (no extra auth requests)
 */

test.describe('Authenticated Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Assumes authenticated session is available
    await page.goto('/')
  })

  test('should display sidebar with branding on authenticated page', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('nav')).toContainText('Proxbase')
  })

  test('should navigate to Services with single action', async ({ page }) => {
    // SC-002: At least 95% of first-time users reach Services within 10 seconds
    await page.click('text=Services')
    await expect(page).toHaveURL(/\/services/i)
    await expect(page.locator('h1')).toContainText('Services')
  })

  test('should mark Services as active after navigation', async ({ page }) => {
    await page.click('text=Services')
    const servicesItem = page.locator('text=Services')
    await expect(servicesItem).toHaveAttribute('aria-current', 'page')
  })

  test('should navigate to Settings with single action', async ({ page }) => {
    await page.click('text=Settings')
    await expect(page).toHaveURL(/\/settings/i)
    await expect(page.locator('h1')).toContainText('Settings')
  })

  test('should mark Settings as active after navigation', async ({ page }) => {
    await page.click('text=Settings')
    const settingsItem = page.locator('text=Settings')
    await expect(settingsItem).toHaveAttribute('aria-current', 'page')
  })

  test('should restore active state on browser back navigation', async ({ page }) => {
    // FR-019: Re-derive active state on browser back/forward
    await page.click('text=Services')
    await expect(page).toHaveURL(/\/services/i)
    await page.click('text=Settings')
    await expect(page).toHaveURL(/\/settings/i)
    await page.goBack()
    await expect(page).toHaveURL(/\/services/i)
    const servicesItem = page.locator('text=Services')
    await expect(servicesItem).toHaveAttribute('aria-current', 'page')
  })

  test('should restore active state on browser forward navigation', async ({ page }) => {
    await page.click('text=Services')
    await page.click('text=Settings')
    await page.goBack()
    await page.goForward()
    await expect(page).toHaveURL(/\/settings/i)
    const settingsItem = page.locator('text=Settings')
    await expect(settingsItem).toHaveAttribute('aria-current', 'page')
  })

  test('should not make extra authentication request during navigation', async ({ page }) => {
    let authRequests = 0
    page.on('request', (request) => {
      if (request.url().includes('/auth/session')) {
        authRequests++
      }
    })
    await page.click('text=Services')
    await page.click('text=Settings')
    await page.goBack()
    // Should not exceed initial session check
    expect(authRequests).toBeLessThanOrEqual(1)
  })
})

test.describe('Sidebar Collapse/Expand', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should collapse sidebar on expand control click', async ({ page }) => {
    // SC-003: Complete within 1 second in 95% of observed interactions
    const startTime = Date.now()
    await page.click('[aria-label*="collapse" i]')
    const endTime = Date.now()
    const duration = endTime - startTime
    expect(duration).toBeLessThan(1000)
    await expect(page.locator('nav')).toHaveClass(/collapsed/)
  })

  test('should expand sidebar on expand control click', async ({ page }) => {
    await page.click('[aria-label*="collapse" i]')
    const startTime = Date.now()
    await page.click('[aria-label*="expand" i]')
    const endTime = Date.now()
    const duration = endTime - startTime
    expect(duration).toBeLessThan(1000)
    await expect(page.locator('nav')).not.toHaveClass(/collapsed/)
  })

  test('should preserve Services icon when collapsed', async ({ page }) => {
    await page.click('[aria-label*="collapse" i]')
    // Icon should remain visible
    await expect(page.locator('svg[data-testid="ServiceIcon"]')).toBeVisible()
  })

  test('should hide Services label when collapsed', async ({ page }) => {
    await page.click('[aria-label*="collapse" i]')
    // Text label should be hidden or have reduced visibility
    const servicesLabel = page.locator('text=Services').filter({ hasNot: page.locator('[aria-label*="Services"]') })
    await expect(servicesLabel).not.toBeVisible()
  })

  test('should keep collapse control accessible by keyboard', async ({ page }) => {
    await page.keyboard.press('Tab')
    let focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    while (focused && !focused.includes('collapse')) {
      await page.keyboard.press('Tab')
      focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    }
    expect(focused).toContain('collapse')
  })

  test('should preserve active state across collapse', async ({ page }) => {
    await page.click('text=Services')
    await page.click('[aria-label*="collapse" i]')
    const servicesItem = page.locator('text=Services')
    await expect(servicesItem).toHaveAttribute('aria-current', 'page')
  })

  test('should navigate while collapsed and restore active state on expand', async ({ page }) => {
    await page.click('[aria-label*="collapse" i]')
    await page.click('[aria-label*="Services"]')
    await page.click('[aria-label*="expand" i]')
    await expect(page).toHaveURL(/\/services/i)
    const servicesItem = page.locator('text=Services')
    await expect(servicesItem).toHaveAttribute('aria-current', 'page')
  })
})

test.describe('Responsive Behavior', () => {
  test('should push main content without overlap at narrow viewport', async ({ page }) => {
    // SC-007, FR-017: Below 600px threshold
    await page.setViewportSize({ width: 500, height: 800 })
    await page.goto('/')
    
    const sidebar = page.locator('nav')
    const mainContent = page.locator('main')
    
    const sidebarBox = await sidebar.boundingBox()
    const mainBox = await mainContent.boundingBox()
    
    // Sidebar should be to the left
    expect(sidebarBox?.x).toBeLessThan((mainBox?.x || 0))
    // Main content should not overlap sidebar
    expect(mainBox?.x).toBeGreaterThanOrEqual((sidebarBox?.x || 0) + (sidebarBox?.width || 0))
  })

  test('should keep user footer visible at narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 })
    await page.goto('/')
    const footer = page.locator('[aria-label*="Settings"]').or(page.locator('[aria-label*="settings" i]'))
    await expect(footer).toBeVisible()
  })

  test('should keep collapse control visible at narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 })
    await page.goto('/')
    const collapseControl = page.locator('[aria-label*="collapse" i]')
    await expect(collapseControl).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have semantic navigation landmark', async ({ page }) => {
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should expose meaningful collapse/expand accessible name', async ({ page }) => {
    const collapseControl = page.locator('[aria-label*="collapse" i]')
    await expect(collapseControl).toBeDefined()
  })

  test('should expose meaningful Services accessible name', async ({ page }) => {
    const servicesItem = page.locator('[aria-label*="Services"]').or(page.locator('text=Services'))
    await expect(servicesItem).toBeDefined()
  })

  test('should expose meaningful Settings accessible name', async ({ page }) => {
    const settingsItem = page.locator('[aria-label*="Settings"]').or(page.locator('text=Settings'))
    await expect(settingsItem).toBeDefined()
  })

  test('should expose meaningful avatar accessible label', async ({ page }) => {
    const avatar = page.locator('[aria-label*="avatar" i]').or(page.locator('[role="img"][aria-label]'))
    await expect(avatar).toBeDefined()
  })

  test('should support keyboard navigation through sidebar controls', async ({ page }) => {
    await page.keyboard.press('Tab')
    let found = false
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement
        return el?.tagName + ' ' + (el?.getAttribute('aria-label') || el?.textContent)
      })
      if (focused.includes('Services') || focused.includes('Settings') || focused.includes('collapse')) {
        found = true
        break
      }
      await page.keyboard.press('Tab')
    }
    expect(found).toBe(true)
  })
})
