import { settings } from '../content/settings'

/** Publieke startpagina: alleen de knop. De titel staat er alleen voor schermlezers. */
export function Landing({ onOpen }: { onOpen: () => void }) {
  return (
    <main className="landing">
      <h1 className="visually-hidden">{settings.landing.title}</h1>
      <div className="landing-form">
        <button type="button" className="btn btn-primary btn-wide" onClick={onOpen}>
          {settings.landing.button}
        </button>
      </div>
    </main>
  )
}
