/**
 * Algemene instellingen van de kalender.
 * Teksten en inhoud per dag staan in ./days.ts.
 */
export const settings = {
  /** Het jaar waarin de kalender loopt. Vakje N opent op N december van dit jaar. */
  year: 2026,
  /** Tijdzone die bepaalt wanneer een nieuwe dag begint. */
  timeZone: 'Europe/Amsterdam',
  /** Aantal vakjes in de kalender. */
  totalDays: 24,

  /**
   * Code voor de ontwikkelaarsmodus op /#/dev. Dit is een persoonlijke app: dit is een
   * eenvoudige toegangspoort, geen echte beveiliging (de code staat in de broncode).
   */
  devCode: '1502',

  landing: {
    title: '24 dagen, speciaal voor jou',
    button: 'Open de kalender',
  },
} as const
