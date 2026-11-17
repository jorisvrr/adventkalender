import { settings } from '../content/settings'

export function Landing({ onOpen }: { onOpen: () => void }) {
  return (
    <main className="landing">
      <div className="landing-ornament" aria-hidden="true">
        <span />
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M12 21s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 8.3 4.3 4.3 0 0 1 19.5 11c0 5.4-7.5 10-7.5 10Z" fill="currentColor" />
        </svg>
        <span />
      </div>
      <h1 className="landing-title">{settings.landing.title}</h1>
      <p className="landing-subtitle">{settings.landing.subtitle}</p>
      <div className="landing-form">
        <button type="button" className="btn btn-primary btn-wide" onClick={onOpen}>
          {settings.landing.button}
        </button>
      </div>
    </main>
  )
}
