import { useRef, useState } from 'react'
import { settings, type Mode } from '../content/settings'
import { modeForCode } from '../lib/session'

export function Landing({ onEnter }: { onEnter: (mode: Mode) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const mode = modeForCode(code)
    if (mode) {
      onEnter(mode)
    } else {
      setError(true)
      setShake((n) => n + 1)
      setCode('')
      inputRef.current?.focus()
    }
  }

  return (
    <main className="landing">
      <div className="landing-ornament" aria-hidden="true">
        <span />
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 21s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 8.3 4.3 4.3 0 0 1 19.5 11c0 5.4-7.5 10-7.5 10Z" fill="currentColor" /></svg>
        <span />
      </div>
      <h1 className="landing-title">{settings.landing.title}</h1>
      <p className="landing-subtitle">{settings.landing.subtitle}</p>

      <form className="landing-form" onSubmit={submit} noValidate>
        <label htmlFor="code" className="visually-hidden">
          Code
        </label>
        <input
          key={shake}
          ref={inputRef}
          id="code"
          className={`code-input ${error ? 'has-error' : ''} ${shake ? 'shake' : ''}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          autoComplete="off"
          enterKeyHint="go"
          placeholder="· · · ·"
          value={code}
          aria-invalid={error}
          aria-describedby={error ? 'code-error' : undefined}
          autoFocus={shake > 0}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
            setError(false)
          }}
        />
        <button type="submit" className="btn btn-primary btn-wide">
          {settings.landing.button}
        </button>
        <p id="code-error" className="landing-error" role="alert">
          {error ? settings.landing.wrongCode : ''}
        </p>
      </form>
    </main>
  )
}
