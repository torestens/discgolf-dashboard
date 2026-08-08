import React from 'react'
import { Plus, Disc } from 'lucide-react'

export default function Header({ tournamentName, totalRounds, completedRounds, onAddRound }) {
  const progress = (completedRounds / totalRounds) * 100

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--accent-season-dim)',
            border: '1.5px solid var(--accent-season-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Disc size={18} color="var(--accent-season)" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            letterSpacing: 2,
            color: 'var(--text-primary)',
          }}>
            {tournamentName}
          </span>
        </div>

        {/* Progress bar + round count */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: 'var(--border)',
            overflow: 'hidden',
            maxWidth: 200,
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--accent-season) 0%, #22d3ee 100%)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {completedRounds} / {totalRounds} rounds
          </span>
        </div>

        {/* Add round button — only shown when onAddRound is provided */}
        {onAddRound && (
          <button
            onClick={onAddRound}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-season-dim)',
              border: '1px solid var(--accent-season-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-season)',
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent-season-dim)'
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--accent-season-dim)'
              e.currentTarget.style.opacity = '1'
            }}
          >
            <Plus size={14} />
            Add Round
          </button>
        )}
      </div>
    </header>
  )
}
