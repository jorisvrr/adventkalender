import { expect, test, type Page } from '@playwright/test'
import { contentWarnings, formatRanges, missingDays } from '../../src/lib/contentStatus'

const DEV = '1502'

/** Publieke ervaring: startpagina → "Open de kalender". */
async function openPublic(page: Page, { at }: { at?: string } = {}) {
  if (at) await page.clock.setFixedTime(new Date(at))
  await page.goto('/')
  await page.getByRole('button', { name: 'Open de kalender' }).click()
  await expect(page.getByRole('list', { name: 'Adventskalender' })).toBeVisible()
}

/** Ontwikkelaarsmodus via /#/dev met code. */
async function openDev(page: Page, { at }: { at?: string } = {}) {
  if (at) await page.clock.setFixedTime(new Date(at))
  await page.goto('/#/dev')
  await page.getByRole('textbox', { name: 'Code' }).fill(DEV)
  await page.getByRole('textbox', { name: 'Code' }).press('Enter')
  await expect(page.getByTestId('badge-ontwikkelaar')).toBeVisible()
}

const tile = (page: Page, day: number) => page.locator(`.calendar [data-day="${day}"]`)

/** Zichtbare tekst van een element (zonder tekst die alleen voor schermlezers is). */
async function visibleText(page: Page, selector: string) {
  return page.locator(selector).evaluate((el: HTMLElement) => {
    const hidden = [...el.querySelectorAll<HTMLElement>('.visually-hidden')]
    hidden.forEach((h) => (h.style.display = 'none'))
    const text = el.innerText
    hidden.forEach((h) => (h.style.display = ''))
    return text.replace(/\s+/g, ' ').trim()
  })
}

/** Selecteer een woord door begin- en eindletter aan te tikken. */
async function tapWord(page: Page, from: string, to: string) {
  await page.locator(`[data-cell="${from}"]`).click()
  await page.locator(`[data-cell="${to}"]`).click()
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
}

/** Woorden die publiek nooit zichtbaar mogen zijn. */
const NIET_PUBLIEK = ['klaargemaakt', 'binnenkort', 'placeholder', 'geen inhoud', 'inhoud', 'ontwikkelaar', 'vriendin', 'gf mode', 'debug', 'test', '1502', '3012']

async function expectCleanPublicText(page: Page) {
  const text = (await page.locator('body').innerText()).toLowerCase()
  for (const word of NIET_PUBLIEK) expect(text, `"${word}" staat publiek in beeld`).not.toContain(word)
  await expect(page.getByTestId('badge-ontwikkelaar')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Ontwikkelaarspaneel' })).toHaveCount(0)
  await expect(page.locator('a[href*="dev"]')).toHaveCount(0)
}

/** Kalenderpagina: alleen "ADVENTSKALENDER" en de vakjes, geen titel of introtekst. */
async function expectOnlyCalendar(page: Page) {
  expect((await visibleText(page, '.app-header')).toUpperCase()).toBe('ADVENTSKALENDER')
  const main = await visibleText(page, 'main')
  const tiles = await visibleText(page, '.calendar')
  expect(main).toBe(tiles)
}

async function expectLockedDay(page: Page, day: number, opensText: string) {
  await expect(page.getByRole('heading', { name: 'Nog even geduld' })).toBeVisible()
  await expect(page.getByText(opensText)).toBeVisible()
  await expect(page.locator('[data-testid="kraslaag"], .ws-grid, .puzzle-grid, .scratch-message')).toHaveCount(0)
  await expect(page.locator('.day-eyebrow')).toContainText(`Dag ${day}`)
}

/** Simuleert een eerder gebruikte ontwikkelaarssessie: ontgrendeld, preview aan, testvoortgang, oude sessiesleutel. */
async function useDevSessionFirst(page: Page) {
  await openDev(page)
  await page.goto('/#/dev/dag/1')
  await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
  await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
  await page.getByLabel('Voorbeeld-datum').fill('2026-12-24')
  await page.getByText(/Bekijk als vriendin op/).click()
  await expect(page.getByTestId('badge-ontwikkelaar')).toContainText('preview')
  await page.evaluate(() => sessionStorage.setItem('adventskalender:v1:modus', 'ontwikkelaar'))
}

test.describe('publieke toegang', () => {
  test('startpagina: één knop, geen codeveld en geen verwijzing naar de ontwikkelaarsmodus', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Adventkalender voor Nien')
    // Alleen de knop: geen andere zichtbare tekst, geen hartje of andere afbeelding.
    expect(await visibleText(page, 'body')).toBe('Open de kalender')
    await expect(page.locator('svg, img')).toHaveCount(0)
    await expect(page.getByRole('button')).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Open de kalender' })).toBeVisible()
    await expect(page.getByRole('textbox')).toHaveCount(0)
    await expect(page.locator('a')).toHaveCount(0)
    await expectCleanPublicText(page)
    await noHorizontalScroll(page)
  })

  test('de knop opent direct de gewone kalender; terug-gebaar gaat naar de startpagina', async ({ page }) => {
    await openPublic(page, { at: '2026-12-05T09:00:00+01:00' })
    await expect(page.locator('.calendar > li')).toHaveCount(24)
    await expect(page.getByRole('button', { name: 'Afsluiten' })).toHaveCount(0)
    await expectCleanPublicText(page)
    await page.goBack()
    await expect(page.getByRole('button', { name: 'Open de kalender' })).toBeVisible()
  })

  test('vóór 1 december (schone sessie): alles dicht, alleen nummer, slotje en openingsdatum', async ({ page }) => {
    await openPublic(page, { at: '2026-11-17T12:00:00+01:00' })
    await expectOnlyCalendar(page)
    for (let d = 1; d <= 24; d++) {
      await expect(tile(page, d)).toHaveAttribute('data-status', 'gesloten')
      await expect(tile(page, d).locator('svg')).toHaveCount(1)
      expect(await visibleText(page, `.calendar [data-day="${d}"]`)).toBe(`${d} Opent op ${d} december`)
    }
    await expect(page.locator('.calendar button')).toHaveCount(0)
    await expectCleanPublicText(page)
    await noHorizontalScroll(page)
  })

  test('directe daglinks vóór de openingsdatum tonen geen inhoud', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-30T23:59:00+01:00'))
    for (const d of [1, 2, 3, 4, 24]) {
      await page.goto(`/#/dag/${d}`)
      await expectLockedDay(page, d, `Dit vakje opent op ${d} december.`)
      await expectCleanPublicText(page)
    }
    // Ontwikkelaarsroute zonder code geeft ook geen inhoud.
    await page.goto('/#/dev/dag/1')
    await expect(page.getByRole('textbox', { name: 'Code' })).toBeVisible()
    await expect(page.locator('.scratch-message, .day-card')).toHaveCount(0)
  })

  test('directe daglink op 2 december: dag 2 open, dag 3 nog dicht', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-02T23:59:00+01:00'))
    await page.goto('/#/dag/3')
    await expectLockedDay(page, 3, 'Dit vakje opent op 3 december.')
    await page.goto('/#/dag/2')
    await expect(page.getByRole('heading', { name: 'Zoek je verrassing' })).toBeVisible()
    await expect(page).toHaveTitle('Adventkalender voor Nien')
  })

  test('middernacht Amsterdamse tijd opent dag 1', async ({ page }) => {
    await openPublic(page, { at: '2026-11-30T23:30:00Z' }) // = 00:30 in Amsterdam
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'beschikbaar')
    await expect(tile(page, 2)).toHaveAttribute('data-status', 'gesloten')
    await expectOnlyCalendar(page)
  })

  test('op 3 december: 1–3 open, 4 dicht', async ({ page }) => {
    await openPublic(page, { at: '2026-12-03T08:00:00+01:00' })
    for (const d of [1, 2, 3]) await expect(tile(page, d)).toHaveAttribute('data-status', 'beschikbaar')
    await expect(tile(page, 4)).toHaveAttribute('data-status', 'gesloten')
    await expect(tile(page, 4)).toContainText('Opent op 4 december')
    await expect(tile(page, 4).getByRole('button')).toHaveCount(0)
  })

  test('een vakje zonder inhoud blijft na zijn datum gesloten, zonder melding', async ({ page }) => {
    const missing = missingDays()
    test.skip(missing.length === 0, 'Alle dagen hebben inhoud')
    const d = missing[0]
    await openPublic(page, { at: `2026-12-${String(d).padStart(2, '0')}T12:00:00+01:00` })
    await expect(tile(page, d)).toHaveAttribute('data-status', 'gesloten')
    expect(await visibleText(page, `.calendar [data-day="${d}"]`)).toBe(String(d))
    await expectOnlyCalendar(page)
    await expectCleanPublicText(page)
    await page.goto(`/#/dag/${d}`)
    await expectLockedDay(page, d, 'Dit vakje is nog dicht.')
    await expectCleanPublicText(page)
  })

  test('een eerder gebruikte ontwikkelaarssessie beïnvloedt de publieke kalender niet', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-17T12:00:00+01:00'))
    await useDevSessionFirst(page)

    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Open de kalender' })).toBeVisible()
    await expect(page.getByRole('textbox')).toHaveCount(0)
    await page.getByRole('button', { name: 'Open de kalender' }).click()
    await expectOnlyCalendar(page)
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'gesloten')
    await expect(page.getByRole('region', { name: 'Preview' })).toHaveCount(0)
    await expectCleanPublicText(page)

    await page.goto('/#/dag/1')
    await expectLockedDay(page, 1, 'Dit vakje opent op 1 december.')
    expect(await page.evaluate(() => sessionStorage.getItem('adventskalender:v1:modus'))).toBeNull()

    // Herladen op een publieke route verandert daar niets aan.
    await page.reload()
    await expectLockedDay(page, 1, 'Dit vakje opent op 1 december.')

    // De ontwikkelaarsmodus zelf onthoudt de sessie wel.
    await page.goto('/#/dev')
    await expect(page.getByTestId('badge-ontwikkelaar')).toBeVisible()
  })
})

test.describe('dag 1 — kraskaart', () => {
  test('openkrassen onthult het bericht en markeert voltooid', async ({ page }) => {
    await openPublic(page, { at: '2026-12-01T09:00:00+01:00' })
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
    await openPublic(page, { at: '2026-12-01T09:00:00+01:00' })
    await page.goto('/#/dag/1')
    await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
    await expect(page.getByText('24 kleine verrassingen, speciaal voor jou.', { exact: false })).toBeVisible()
    await expect(page.locator('.scratch-message')).toHaveText(/speciaal voor jou\.$/)
    await page.reload()
    await expect(page.getByText('Dit kaartje heb je al opengekrast.')).toBeVisible()
  })
})

test.describe('dag 2 — woordzoeker', () => {
  const ANSWER_LABEL = 'Vul hier je eerste 6 letters in'

  test('alle woorden vinden, beginletters invullen, beloning blijft na herladen', async ({ page }) => {
    await openPublic(page, { at: '2026-12-02T09:00:00+01:00' })
    await tile(page, 2).getByRole('button').click()
    await expect(page.getByRole('heading', { name: 'Zoek je verrassing' })).toBeVisible()
    await expect(page.getByText('Zoek de zes woorden. Neem daarna de beginletters van de woorden.')).toBeVisible()
    await expect(page.locator('.ws-words li')).toHaveText(['KIKKER', 'PASTA', 'NOODLES', 'ROOKIE', 'SNOEP', 'MAAS'])

    // Fout: schuin
    await tapWord(page, '0-0', '2-2')
    await expect(page.getByRole('status').first()).toContainText('één rij of in één kolom')

    // KIKKER via slepen
    const a = (await page.locator('[data-cell="0-0"]').boundingBox())!
    const b = (await page.locator('[data-cell="0-5"]').boundingBox())!
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 })
    await page.mouse.up()
    await expect(page.locator('[data-word="KIKKER"]')).toHaveClass(/is-found/)

    await tapWord(page, '3-1', '7-1') // PASTA (verticaal)
    await tapWord(page, '2-7', '2-1') // NOODLES, achterstevoren getikt
    await page.reload()
    await expect(page.locator('.ws-words li.is-found')).toHaveCount(3)
    await expect(page.getByRole('textbox', { name: ANSWER_LABEL })).toHaveCount(0)

    await tapWord(page, '5-2', '5-7') // ROOKIE
    await tapWord(page, '2-7', '6-7') // SNOEP (verticaal, deelt de S met NOODLES)
    await tapWord(page, '7-0', '7-3') // MAAS (deelt de A met PASTA)
    await expect(page.locator('.ws-words li.is-found')).toHaveCount(6)

    await page.getByRole('button', { name: 'Geef me een hint' }).click()
    await expect(page.getByText('Neem van elk woord in de lijst de eerste letter')).toBeVisible()

    const answer = page.getByRole('textbox', { name: ANSWER_LABEL })
    await expect(answer).toBeVisible()
    await expect(page.getByRole('button', { name: 'Controleer' })).toBeVisible()
    await answer.fill('kpnrs')
    await answer.press('Enter')
    await expect(page.getByRole('alert')).toHaveText('Nog niet helemaal. Probeer het nog eens.')

    await answer.fill(' k p n r s m ')
    await page.getByRole('button', { name: 'Controleer' }).click()
    await expect(page.getByTestId('beloning')).toContainText('Goed gevonden! App mij deze letters, dan krijg je een cadeau.')
    await expect(page.getByTestId('beloning')).not.toContainText('Al opgelost')

    await page.reload()
    await expect(page.getByTestId('beloning')).toContainText('Al opgelost')
    await expect(page.getByTestId('beloning')).toContainText('App mij deze letters')
    await expect(page.getByRole('textbox', { name: ANSWER_LABEL })).toHaveCount(0)
    const text = await page.locator('body').innerText()
    for (const old of ['CADEAU', '€5', 'screenshot']) expect(text).not.toContain(old)
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(tile(page, 2)).toHaveAttribute('data-status', 'voltooid')
  })

  test('oude voortgang van het vorige rooster botst niet', async ({ page }) => {
    await openPublic(page, { at: '2026-12-05T09:00:00+01:00' })
    await page.evaluate(() => {
      localStorage.setItem(
        'adventskalender:v1:voortgang:vriendin',
        JSON.stringify({
          1: { completed: true },
          2: { completed: true, state: { found: ['CHOCOLA', 'AVOND', 'DROOM', 'ETEN', 'ARM', 'UITJE'], solved: true } },
        }),
      )
    })
    await page.reload()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid') // kraskaart blijft gewoon staan
    await expect(tile(page, 2)).toHaveAttribute('data-status', 'beschikbaar')
    await tile(page, 2).getByRole('button').click()
    await expect(page.locator('.ws-words li.is-found')).toHaveCount(0)
    await expect(page.getByTestId('beloning')).toHaveCount(0)
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('adventskalender:v1:voortgang:vriendin')!))
    expect(stored[2]).toBeUndefined()
    expect(stored[1].completed).toBe(true)
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
    await openPublic(page, { at: '2026-12-03T09:00:00+01:00' })
    await page.goto('/#/dag/3')
    await expect(page.getByRole('heading', { name: 'Stukjes van ons' })).toBeVisible()
    const order = () => page.locator('[data-slot]').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-tile'))))
    const start = await order()
    expect(start).not.toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    await expect
      .poll(() => page.locator('.puzzle-tile img').first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
      .toBe(true)

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
  test('/#/dev vraagt de code en toont daarna alles, met inhoudsstatus', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-17T12:00:00+01:00'))
    await page.goto('/#/dev')
    await page.getByRole('textbox', { name: 'Code' }).fill('1234')
    await page.getByRole('button', { name: 'Ontgrendel' }).click()
    await expect(page.getByRole('alert')).toHaveText('Deze code klopt niet.')
    await page.getByRole('textbox', { name: 'Code' }).fill(DEV)
    await page.getByRole('textbox', { name: 'Code' }).press('Enter')

    await expect(page.getByTestId('badge-ontwikkelaar')).toHaveText('Ontwikkelaarsmodus')
    await expect(page.getByRole('heading', { name: 'Ontwikkelaarspaneel' })).toBeVisible()
    for (const d of [1, 2, 3, 4, 24]) await expect(tile(page, d)).toHaveAttribute('data-status', 'beschikbaar')

    const status = page.getByTestId('inhoudsstatus')
    const missing = missingDays()
    if (missing.length) await expect(status).toContainText(`Nog leeg: ${formatRanges(missing)}`)
    for (const w of contentWarnings()) await expect(status).toContainText(`Dag ${w.day} ${w.text}`)
    await expect(status).not.toContainText('niet gevonden')

    if (missing.length) {
      await expect(tile(page, missing[0])).toContainText('Geen inhoud')
      await page.goto(`/#/dev/dag/${missing[0]}`)
      await expect(page.getByRole('heading', { name: 'Nog geen inhoud' })).toBeVisible()
    }
    await noHorizontalScroll(page)
  })

  test('Afsluiten vergrendelt de ontwikkelaarsmodus weer', async ({ page }) => {
    await openDev(page)
    await page.getByRole('button', { name: 'Afsluiten' }).click()
    await expect(page.getByRole('button', { name: 'Open de kalender' })).toBeVisible()
    await page.goto('/#/dev')
    await expect(page.getByRole('textbox', { name: 'Code' })).toBeVisible()
  })

  test('testvoortgang staat los van de publieke voortgang', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-05T09:00:00+01:00'))
    // Publiek: dag 1 voltooien
    await openPublic(page)
    await page.goto('/#/dag/1')
    await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')

    // Ontwikkelaar ziet dag 1 als niet voltooid
    await openDev(page)
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'beschikbaar')
    await page.goto('/#/dev/dag/1')
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

    // Publieke voortgang is ongemoeid
    await page.goto('/#/kalender')
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')
  })

  test('reset per dag via het paneel', async ({ page }) => {
    await openDev(page)
    await page.goto('/#/dev/dag/1')
    await page.getByRole('button', { name: 'Onthul mijn bericht' }).click()
    await page.getByRole('button', { name: 'Terug naar de kalender' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'voltooid')
    await page.getByLabel('Dag', { exact: true }).selectOption('1')
    await page.getByRole('button', { name: 'Reset deze dag' }).click()
    await expect(tile(page, 1)).toHaveAttribute('data-status', 'beschikbaar')
  })

  test('preview met voorbeeld-datum toont de publieke kalender en altijd terug naar het paneel', async ({ page }) => {
    await openDev(page, { at: '2026-11-16T12:00:00+01:00' })
    await page.getByLabel('Voorbeeld-datum').fill('2026-12-02')
    await page.getByText('Bekijk als vriendin op 2 december').click()
    await expect(page.getByTestId('badge-ontwikkelaar')).toContainText('preview')
    await expect(page.getByRole('heading', { name: 'Ontwikkelaarspaneel' })).toHaveCount(0)
    await expect(tile(page, 2)).toHaveAttribute('data-status', 'beschikbaar')
    await expect(tile(page, 3)).toHaveAttribute('data-status', 'gesloten')
    await expect(tile(page, 3)).toContainText('Opent op 3 december')
    await expect(page.locator('.calendar')).not.toContainText('Geen inhoud')

    // Vanuit een dag in de preview terug naar het paneel
    await tile(page, 2).getByRole('button').click()
    await expect(page).toHaveURL(/#\/dev\/dag\/2$/)
    await expect(page.getByRole('heading', { name: 'Zoek je verrassing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reset deze dag' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Terug naar ontwikkelaarspaneel' }).click()
    await expect(page.getByRole('heading', { name: 'Ontwikkelaarspaneel' })).toBeVisible()
    await expect(tile(page, 3)).toHaveAttribute('data-status', 'beschikbaar')
    await noHorizontalScroll(page)
  })
})
