import { expect, test, type Page } from '@playwright/test'

const VRIENDIN = '3012'
const DEV = '1502'

async function login(page: Page, code: string, { at }: { at?: string } = {}) {
  if (at) await page.clock.setFixedTime(new Date(at))
  await page.goto('/')
  await page.getByRole('textbox', { name: 'Code' }).fill(code)
  await page.getByRole('textbox', { name: 'Code' }).press('Enter')
  await expect(page.getByRole('list', { name: 'Adventskalender' })).toBeVisible()
}

const tile = (page: Page, day: number) => page.locator(`.calendar [data-day="${day}"]`)

async function exit(page: Page) {
  await page.getByRole('button', { name: 'Afsluiten' }).click()
  await expect(page.getByRole('heading', { name: '24 dagen, speciaal voor jou' })).toBeVisible()
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
}

/** Selecteer een woord door begin- en eindletter aan te tikken. */
async function tapWord(page: Page, from: string, to: string) {
  await page.locator(`[data-cell="${from}"]`).click()
  await page.locator(`[data-cell="${to}"]`).click()
}

test.describe('toegang', () => {
  test('landing toont geen codes of ontwikkelaarsoptie', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '24 dagen, speciaal voor jou' })).toBeVisible()
    await expect(page.getByText('Elke dag een kleine verrassing.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open mijn kalender' })).toBeVisible()
    const text = (await page.locator('body').innerText()).toLowerCase()
    expect(text).not.toContain(VRIENDIN)
    expect(text).not.toContain(DEV)
    expect(text).not.toContain('ontwikkelaar')
    const input = page.getByRole('textbox', { name: 'Code' })
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(input).toHaveAttribute('maxlength', '4')
    await noHorizontalScroll(page)
  })

  test('onjuiste code geeft een vriendelijke melding', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('textbox', { name: 'Code' }).fill('1234')
    await page.getByRole('button', { name: 'Open mijn kalender' }).click()
    await expect(page.getByRole('alert')).toHaveText('Deze code klopt niet helemaal. Probeer het nog eens.')
    await expect(page.getByRole('list', { name: 'Adventskalender' })).toHaveCount(0)
  })

  test('3012 opent vriendinmodus, onthoudt de sessie en Afsluiten werkt', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-12-05T09:00:00+01:00' })
    await expect(page.getByTestId('badge-ontwikkelaar')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Ontwikkelaarspaneel' })).toHaveCount(0)
    await expect(page.locator('.calendar > li')).toHaveCount(24)
    await page.reload()
    await expect(page.getByRole('list', { name: 'Adventskalender' })).toBeVisible()
    await exit(page)
    await page.reload()
    await expect(page.getByRole('textbox', { name: 'Code' })).toBeVisible()
  })

  test('1502 opent ontwikkelaarsmodus met badge en paneel', async ({ page }) => {
    await login(page, DEV, { at: '2026-11-16T12:00:00+01:00' })
    await expect(page.getByTestId('badge-ontwikkelaar')).toHaveText('Ontwikkelaarsmodus')
    await expect(page.getByRole('heading', { name: 'Ontwikkelaarspaneel' })).toBeVisible()
    // In november: toch alles open.
    for (const d of [1, 2, 3, 4, 24]) await expect(tile(page, d)).toHaveAttribute('data-status', 'beschikbaar')
    await noHorizontalScroll(page)
  })
})

test.describe('datumvergrendeling (vriendin)', () => {
  test('in november is alles dicht', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-11-30T23:59:00+01:00' })
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'gesloten')
    await expect(tile(page, 1)).toContainText('Opent op 1 december')
  })

  test('middernacht Amsterdamse tijd opent dag 1', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-11-30T23:30:00Z' }) // = 00:30 in Amsterdam
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'beschikbaar')
    await expect(tile(page, 2)).toHaveAttribute('data-status', 'gesloten')
  })

  test('op 3 december: 1–3 open, 4 dicht, toekomstige dag niet te openen via de url', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-12-03T08:00:00+01:00' })
    for (const d of [1, 2, 3]) await expect(tile(page, d)).toHaveAttribute('data-status', 'beschikbaar')
    await expect(tile(page, 4)).toHaveAttribute('data-status', 'gesloten')
    await expect(tile(page, 4)).toContainText('Opent op 4 december')
    await expect(tile(page, 4).getByRole('button')).toHaveCount(0)
    await page.goto('/#/dag/4')
    await expect(page.getByRole('heading', { name: 'Nog even geduld' })).toBeVisible()
    await expect(page.getByText('Dit vakje opent op 4 december.')).toBeVisible()
  })

  test('beschikbare placeholder toont dat de verrassing nog wordt klaargemaakt', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-12-10T08:00:00+01:00' })
    await tile(page, 7).getByRole('button').click()
    await expect(page.getByRole('heading', { name: 'De verrassing wordt nog klaargemaakt' })).toBeVisible()
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(page.getByRole('list', { name: 'Adventskalender' })).toBeVisible()
  })
})

test.describe('dag 1 — kraskaart', () => {
  test('openkrassen onthult het bericht en markeert voltooid', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-12-01T09:00:00+01:00' })
    await tile(page, 1).getByRole('button').click()
    await expect(page.getByRole('heading', { name: 'Een klein begin' })).toBeVisible()
    const canvas = page.getByTestId('kraslaag')
    const box = (await canvas.boundingBox())!
    await page.mouse.move(box.x + 5, box.y + 5)
    await page.mouse.down()
    for (let y = 10; y < box.height; y += 24) {
      await page.mouse.move(box.x + 5, box.y + y, { steps: 2 })
      await page.mouse.move(box.x + box.width - 5, box.y + y, { steps: 8 })
    }
    await page.mouse.up()
    await expect(canvas).toHaveCount(0)
    await expect(page.getByText('Ook al zijn we niet altijd op dezelfde plek')).toBeVisible()
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')
    await page.reload()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')
  })

  test('knop "Onthul mijn bericht" werkt ook', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-12-01T09:00:00+01:00' })
    await page.goto('/#/dag/1')
    await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
    await expect(page.getByText('24 kleine verrassingen, speciaal voor jou. ❤️')).toBeVisible()
    await page.reload()
    await expect(page.getByText('Dit kaartje heb je al opengekrast.')).toBeVisible()
  })
})

test.describe('dag 2 — woordzoeker', () => {
  test('alle woorden vinden, codewoord, beloning blijft na herladen', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-12-02T09:00:00+01:00' })
    await tile(page, 2).getByRole('button').click()
    await expect(page.getByRole('heading', { name: 'Zoek je verrassing' })).toBeVisible()
    await expect(page.locator('.ws-words li')).toHaveText(['CHOCOLA', 'AVOND', 'DROOM', 'ETEN', 'ARM', 'UITJE'])

    // Fout: schuin
    await tapWord(page, '0-0', '2-2')
    await expect(page.getByRole('status').first()).toContainText('één rij of in één kolom')

    // CHOCOLA via slepen
    const a = (await page.locator('[data-cell="1-1"]').boundingBox())!
    const b = (await page.locator('[data-cell="1-7"]').boundingBox())!
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 })
    await page.mouse.up()
    await expect(page.locator('[data-word="CHOCOLA"]')).toHaveClass(/is-found/)

    await tapWord(page, '2-0', '6-0') // AVOND
    await tapWord(page, '6-4', '6-0') // DROOM, achterstevoren getikt
    await page.reload()
    await expect(page.locator('.ws-words li.is-found')).toHaveCount(3)
    await expect(page.getByRole('textbox', { name: 'Welk woord krijg je?' })).toHaveCount(0)

    await tapWord(page, '4-4', '4-7') // ETEN
    await tapWord(page, '1-7', '3-7') // ARM
    await tapWord(page, '2-5', '6-5') // UITJE
    await expect(page.locator('.ws-words li.is-found')).toHaveCount(6)

    await page.getByRole('button', { name: 'Geef me een hint' }).click()
    await expect(page.getByText('Pak van elk woord in de lijst de eerste letter')).toBeVisible()

    const answer = page.getByRole('textbox', { name: 'Welk woord krijg je?' })
    await answer.fill('kado')
    await answer.press('Enter')
    await expect(page.getByRole('alert')).toContainText('Bijna!')

    await answer.fill('  cadeau ')
    await page.getByRole('button', { name: 'Controleer' }).click()
    await expect(page.getByTestId('beloning')).toContainText('Goed gevonden! Je hebt €5 gewonnen')
    await expect(page.getByTestId('beloning')).not.toContainText('Al opgelost')

    await page.reload()
    await expect(page.getByTestId('beloning')).toContainText('Al opgelost')
    await expect(page.getByTestId('beloning')).toContainText('Jouw beloning')
    await expect(page.getByTestId('beloning')).toContainText('€5')
    await expect(page.getByRole('textbox', { name: 'Welk woord krijg je?' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(tile(page, 2)).toHaveAttribute('data-status', 'voltooid')
  })
})

async function solvePuzzle(page: Page) {
  for (let slot = 0; slot < 9; slot++) {
    if (await page.getByTestId('puzzel-klaar').isVisible()) return
    const current = Number(await page.locator(`[data-slot="${slot}"]`).getAttribute('data-tile'))
    if (current === slot) continue
    const from = await page.locator(`[data-tile="${slot}"]`).getAttribute('data-slot')
    await page.locator(`[data-slot="${slot}"]`).click()
    await page.locator(`[data-slot="${from}"]`).click()
  }
}

test.describe('dag 3 — fotopuzzel', () => {
  test('geschud begin, posities bewaard, oplossen toont boodschap', async ({ page }) => {
    await login(page, VRIENDIN, { at: '2026-12-03T09:00:00+01:00' })
    await page.goto('/#/dag/3')
    await expect(page.getByRole('heading', { name: 'Stukjes van ons' })).toBeVisible()
    const order = () => page.locator('[data-slot]').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-tile'))))
    const start = await order()
    expect(start).not.toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])

    await page.getByRole('button', { name: 'Bekijk het voorbeeld' }).click()
    await expect(page.getByRole('button', { name: 'Voorbeeld sluiten' })).toBeVisible()
    await page.getByRole('button', { name: 'Voorbeeld sluiten' }).click()

    await page.locator('[data-slot="0"]').click()
    await page.locator('[data-slot="8"]').click()
    const afterSwap = await order()
    expect(afterSwap[0]).toBe(start[8])
    expect(afterSwap[8]).toBe(start[0])
    await page.reload()
    expect(await order()).toEqual(afterSwap)

    await solvePuzzle(page)
    await expect(page.getByTestId('puzzel-klaar')).toContainText('Jij maakt het plaatje compleet. ❤️')
    await page.reload()
    await expect(page.getByTestId('puzzel-klaar')).toBeVisible()
    await expect(page.getByText('Deze puzzel heb je al gelegd.')).toBeVisible()
  })
})

test.describe('ontwikkelaarsmodus', () => {
  test('testvoortgang staat los van vriendinvoortgang', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-05T09:00:00+01:00'))
    // Vriendin voltooit dag 1
    await login(page, VRIENDIN)
    await page.goto('/#/dag/1')
    await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')
    await exit(page)

    // Ontwikkelaar ziet dag 1 als niet voltooid, voltooit dag 2's kraskaart niet maar dag 1 wel
    await login(page, DEV)
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'beschikbaar')
    await page.goto('/#/dag/1')
    await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
    await expect(page.getByText('Test · dag 1 voltooid')).toBeVisible()
    await page.getByRole('button', { name: 'Reset deze dag' }).click()
    await expect(page.getByRole('button', { name: 'Onthul mijn bericht' })).toBeVisible()
    await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')

    // Alles resetten vraagt bevestiging
    await page.getByRole('button', { name: 'Reset alle testvoortgang' }).click()
    await page.getByRole('button', { name: 'Annuleren' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')
    await page.getByRole('button', { name: 'Reset alle testvoortgang' }).click()
    await page.getByRole('button', { name: 'Ja, alles wissen' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'beschikbaar')
    await exit(page)

    // Vriendinvoortgang is ongemoeid
    await login(page, VRIENDIN)
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')
  })

  test('reset per dag via het paneel', async ({ page }) => {
    await login(page, DEV)
    await page.goto('/#/dag/1')
    await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')
    await page.getByLabel('Dag', { exact: true }).selectOption('1')
    await page.getByRole('button', { name: 'Reset deze dag' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'beschikbaar')
  })

  test('vriendin-preview met voorbeeld-datum en altijd terug naar het paneel', async ({ page }) => {
    await login(page, DEV, { at: '2026-11-16T12:00:00+01:00' })
    await page.getByLabel('Voorbeeld-datum').fill('2026-12-02')
    await page.getByText('Bekijk als vriendin op 2 december').click()
    await expect(page.getByTestId('badge-ontwikkelaar')).toContainText('preview')
    await expect(page.getByRole('heading', { name: 'Ontwikkelaarspaneel' })).toHaveCount(0)
    await expect(tile(page, 2)).toHaveAttribute('data-status', 'beschikbaar')
    await expect(tile(page, 3)).toHaveAttribute('data-status', 'gesloten')
    await expect(tile(page, 3)).toContainText('Opent op 3 december')

    // Vanuit een dag in de preview terug naar het paneel
    await tile(page, 2).getByRole('button').click()
    await expect(page.getByRole('heading', { name: 'Zoek je verrassing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reset deze dag' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Terug naar ontwikkelaarspaneel' }).click()
    await expect(page.getByRole('heading', { name: 'Ontwikkelaarspaneel' })).toBeVisible()
    await expect(tile(page, 3)).toHaveAttribute('data-status', 'beschikbaar')
    await noHorizontalScroll(page)
  })
})
