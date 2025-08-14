import { expect, test } from '@playwright/test'

test('digital tailor mode toggles', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Enter Digital Tailor' }).click()
  await expect(page.getByRole('heading', { name: 'Digital Tailor' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to Character Mode' }).click()
  await expect(
    page.getByRole('heading', { name: 'Character Morph Creator (GLB-only)' })
  ).toBeVisible()
})
