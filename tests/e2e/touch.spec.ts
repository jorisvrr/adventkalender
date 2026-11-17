import { expect, test, type Page } from '@playwright/test'

/** Echte touch-sleepbewegingen via het Chrome DevTools Protocol (alleen Chromium). */
async function touchDrag(page: Page, points: { x: number; y: number }[]) {
  const cdp = await page.context().newCDPSession(page)
  const send = (type: string, p?: { x: number; y: number }) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y }] : [] })
  await send('touchStart', points[0])
  for (const p of points.slice(1)) await send('touchMove', p)
  await send('touchEnd')
}

test.skip(({ browserName }) => browserName !== 'chromium', 'CDP-touch werkt alleen in Chromium')

async function login(page: Page, at: string) {
  await page.clock.setFixedTime(new Date(at))
  await page.goto('/')
  await page.getByRole('button', { name: 'Open de kalender' }).click()
}

test('kraskaart werkt met de vinger', async ({ page }) => {
  await login(page, '2026-12-01T09:00:00+01:00')
  await page.goto('/#/dag/1')
  const box = (await page.getByTestId('kraslaag').boundingBox())!
  const pts: { x: number; y: number }[] = []
  for (let y = 8; y < box.height; y += 22) {
    for (let x = 6; x < box.width; x += 14) pts.push({ x: box.x + x, y: box.y + y })
  }
  await touchDrag(page, pts)
  await expect(page.getByTestId('kraslaag')).toHaveCount(0)
  await expect(page.getByText('Ook al zijn we niet altijd op dezelfde plek')).toBeVisible()
})

test('woordzoeker: woord slepen met de vinger', async ({ page }) => {
  await login(page, '2026-12-02T09:00:00+01:00')
  await page.goto('/#/dag/2')
  const center = async (id: string) => {
    const b = (await page.locator(`[data-cell="${id}"]`).boundingBox())!
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  }
  const start = await center('2-7')
  const end = await center('6-7')
  const pts = Array.from({ length: 12 }, (_, i) => ({ x: start.x, y: start.y + ((end.y - start.y) * i) / 11 }))
  const scrollBefore = await page.evaluate(() => window.scrollY)
  await touchDrag(page, pts)
  await expect(page.locator('[data-word="SNOEP"]')).toHaveClass(/is-found/)
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore)

  // Direct daarna een woord aantikken werkt ook.
  await page.locator('[data-cell="7-0"]').tap()
  await page.locator('[data-cell="7-3"]').tap()
  await expect(page.locator('[data-word="MAAS"]')).toHaveClass(/is-found/)
})

test('fotopuzzel: tegels wisselen door te tikken', async ({ page }) => {
  await login(page, '2026-12-03T09:00:00+01:00')
  await page.goto('/#/dag/3')
  const t0 = await page.locator('[data-slot="0"]').getAttribute('data-tile')
  const t4 = await page.locator('[data-slot="4"]').getAttribute('data-tile')
  await page.locator('[data-slot="0"]').tap()
  await page.locator('[data-slot="4"]').tap()
  await expect(page.locator('[data-slot="0"]')).toHaveAttribute('data-tile', t4!)
  await expect(page.locator('[data-slot="4"]')).toHaveAttribute('data-tile', t0!)
})
