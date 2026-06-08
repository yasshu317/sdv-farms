import { test, expect } from '@playwright/test'

test.describe('/list-your-land — public listing form', () => {
  test('loads without authentication', async ({ page }) => {
    await page.goto('/list-your-land')
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page).toHaveURL(/\/list-your-land/)
  })

  test('page title contains "List Your Land"', async ({ page }) => {
    await page.goto('/list-your-land')
    await expect(page).toHaveTitle(/List Your Land/i)
  })

  test('shows step 1 heading and required fields', async ({ page }) => {
    await page.goto('/list-your-land')
    await expect(page.getByRole('heading', { name: /List Your Land/i })).toBeVisible()
    await expect(page.getByPlaceholder(/First name/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Last name/i)).toBeVisible()
    await expect(page.getByPlaceholder(/10-digit mobile/i)).toBeVisible()
    await expect(page.getByText(/State/i).first()).toBeVisible()
    await expect(page.getByText(/Village/i).first()).toBeVisible()
  })

  test('step 1 → step 2 navigation blocked when fields empty', async ({ page }) => {
    await page.goto('/list-your-land')
    await page.getByRole('button', { name: /Next/i }).click()
    // Should stay on step 1 — error shown, URL unchanged
    await expect(page).toHaveURL(/\/list-your-land/)
    await expect(page.getByPlaceholder(/First name/i)).toBeVisible()
  })

  test('step 1 → step 2 navigation works with valid data', async ({ page }) => {
    await page.goto('/list-your-land')

    await page.getByPlaceholder(/First name/i).fill('Ravi')
    await page.getByPlaceholder(/Last name/i).fill('Kumar')
    await page.getByPlaceholder(/10-digit mobile/i).fill('9876543210')

    // Select state
    await page.selectOption('select', { label: 'Telangana' })
    // Wait for district options to populate then select
    await page.waitForFunction(() => {
      const selects = document.querySelectorAll('select')
      return selects[1] && selects[1].options.length > 1
    })
    await page.locator('select').nth(1).selectOption({ index: 1 })
    // Mandal
    await page.waitForFunction(() => {
      const selects = document.querySelectorAll('select')
      return selects[2] && selects[2].options.length > 1
    })
    await page.locator('select').nth(2).selectOption({ index: 1 })

    await page.getByPlaceholder(/Village name/i).fill('Kongara')

    await page.getByRole('button', { name: /Next/i }).click()

    // Step 2 should now be visible
    await expect(page.getByPlaceholder(/Exact name on Pahani/i)).toBeVisible()
  })

  test('back button returns to step 1', async ({ page }) => {
    await page.goto('/list-your-land')

    // Fill step 1
    await page.getByPlaceholder(/First name/i).fill('Ravi')
    await page.getByPlaceholder(/Last name/i).fill('Kumar')
    await page.getByPlaceholder(/10-digit mobile/i).fill('9876543210')
    await page.selectOption('select', { label: 'Telangana' })
    await page.waitForFunction(() => document.querySelectorAll('select')[1]?.options.length > 1)
    await page.locator('select').nth(1).selectOption({ index: 1 })
    await page.waitForFunction(() => document.querySelectorAll('select')[2]?.options.length > 1)
    await page.locator('select').nth(2).selectOption({ index: 1 })
    await page.getByPlaceholder(/Village name/i).fill('Kongara')
    await page.getByRole('button', { name: /Next/i }).click()

    // Click back
    await page.getByRole('button', { name: /Back/i }).click()
    await expect(page.getByPlaceholder(/First name/i)).toBeVisible()
  })

  test('"List Your Land" nav link points to /list-your-land, not registration', async ({ page }) => {
    await page.goto('/')
    const listLink = page.getByRole('link', { name: /List your land/i }).first()
    await expect(listLink).toHaveAttribute('href', '/list-your-land')
  })
})
