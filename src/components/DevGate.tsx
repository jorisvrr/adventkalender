import { useRef, useState } from 'react'
import { isDevCode } from '../lib/session'

/** Toegang tot de ontwikkelaarsmodus op /#/dev. Nergens publiek gelinkt. */
export function DevGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isDevCode(code)) return onUnlock()
    setError(true)
    setShake((n) => n + 1)
    setCode('')
    inputRef.current?.focus()
  }

  return (
    <main className="landing">
      <h1 className="landing-title landing-title-small">Ontwikkelaarsmodus</h1>
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
          autoFocus
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
            setError(false)
          }}
        />
        <button type="submit" className="btn btn-primary btn-wide">
          Ontgrendel
        </button>
        <p id="code-error" className="landing-error" role="alert">
          {error ? 'Deze code klopt niet.' : ''}
        </p>
      </form>
    </main>
  )
}
