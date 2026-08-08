import React, { useState, useRef, useEffect } from 'react'
import { Lock, X, AlertCircle } from 'lucide-react'

export default function AdminPinModal({ onSuccess, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const validate = () => {
    const expected = import.meta.env.VITE_ADMIN_PIN
    if (!expected || pin === expected) {
      onSuccess(pin)
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        width: '100%', maxWidth: 340,
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(167,139,250,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={16} color="#a78bfa" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                Admin access
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Enter your PIN to continue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <input
            ref={inputRef}
            type="password"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && pin && validate()}
            placeholder="PIN"
            style={{
              width: '100%', padding: '11px 14px',
              background: 'var(--bg-primary)',
              border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: 20, letterSpacing: 6,
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            autoComplete="current-password"
          />

          {error && (
            <div style={{
              marginTop: 10,
              display: 'flex', alignItems: 'center', gap: 7,
              color: '#f87171', fontSize: 13,
            }}>
              <AlertCircle size={13} />
              Incorrect PIN
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={validate}
              disabled={!pin}
              style={{
                flex: 2, padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                background: pin ? 'rgba(167,139,250,0.15)' : 'var(--bg-elevated)',
                border: `1px solid ${pin ? 'rgba(167,139,250,0.35)' : 'var(--border)'}`,
                color: pin ? '#a78bfa' : 'var(--text-muted)',
                fontSize: 14, fontWeight: 600,
                cursor: pin ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
