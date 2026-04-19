import { test, expect } from '@playwright/test'

test.describe('Register Page — 3-step flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
  })

  test('shows role selection on first step', async ({ page }) => {
    await expect(page.getByText('I want to…')).toBeVisible()
    await expect(page.getByText('Buy Land')).toBeVisible()
    await expect(page.getByText('Sell Land')).toBeVisible()
  })

  test('shows error if continuing without selecting a role', async ({ page }) => {
    await page.getByRole('button', { name: 'Continue →' }).click()
    await expect(page.getByText(/choose how you want to use/i)).toBeVisible()
  })

  test('buyer flow skips eligibility and goes straight to form', async ({ page }) => {
    await page.getByText('Buy Land').click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    // Should jump straight to registration form (no eligibility step for buyers)
    await expect(page.getByText('Create buyer account')).toBeVisible()
  })

  test('seller flow shows eligibility check step', async ({ page }) => {
    await page.getByText('Sell Land').click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await expect(page.getByRole('heading', { name: 'Eligibility Check' })).toBeVisible()
    await expect(page.getByText(/What type of land/i)).toBeVisible()
  })

  test('seller with disallowed land type (Poramboke) is blocked', async ({ page }) => {
    await page.getByText('Sell Land').click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await page.locator('select').first().selectOption('Poramboke')
    await page.getByRole('button', { name: 'Continue →' }).click()
    await expect(page.getByText('Land Not Eligible')).toBeVisible()
  })

  test('seller can go back from eligibility to role selection', async ({ page }) => {
    await page.getByText('Sell Land').click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await page.getByRole('button', { name: '← Back' }).click()
    await expect(page.getByText('I want to…')).toBeVisible()
  })

  test('eligible seller (Agriculture) can proceed to registration form', async ({ page }) => {
    await page.getByText('Sell Land').click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await page.selectOption('select', 'Agriculture')
    await page.getByRole('button', { name: '👨‍🌾 Farmer' }).click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await expect(page.getByText(/Register as farmer/i)).toBeVisible()
  })

  test('registration form validates password mismatch', async ({ page }) => {
    // Get to buyer registration form
    await page.getByText('Buy Land').click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await page.fill('input[placeholder="Your full name"]', 'Test User')
    await page.fill('input[placeholder="you@example.com"]', 'test@example.com')
    await page.fill('input[placeholder="+91 98765 43210"]', '9876543210')
    await page.locator('input[placeholder="Min. 6 characters"]').fill('password123')
    await page.locator('input[placeholder="Repeat password"]').fill('different123')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('has link back to login', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
  })
})
