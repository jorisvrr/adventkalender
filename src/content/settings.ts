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
   * Toegangscodes. Dit is een persoonlijke app: dit is een eenvoudige
   * toegangspoort, geen echte beveiliging (de code staat in de broncode).
   */
  codes: {
    vriendin: '3012',
    ontwikkelaar: '1502',
  },

  landing: {
    title: '24 dagen, speciaal voor jou',
    subtitle: 'Elke dag een kleine verrassing.',
    button: 'Open mijn kalender',
    wrongCode: 'Deze code klopt niet helemaal. Probeer het nog eens.',
  },

  /** Tekst in een vakje dat al open is maar nog geen inhoud heeft. */
  placeholderText: 'De verrassing wordt nog klaargemaakt',
} as const

export type Mode = 'vriendin' | 'ontwikkelaar'
