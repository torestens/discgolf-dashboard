import React from 'react'

export default function TournamentSelector({ tournaments, currentId, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '20px 0 4px',
    }}>
      <span style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginRight: 4,
        flexShrink: 0,
      }}>
        Tournament
      </span>
      {tournaments.map(t => {
        const isActive = t.id === currentId
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              border: `1px solid ${isActive ? 'var(--accent-season-border)' : 'var(--border)'}`,
              background: isActive ? 'var(--accent-season-dim)' : 'transparent',
              color: isActive ? 'var(--accent-season)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: t.season === 'autumn' ? '#fb923c' : '#4ade80',
              flexShrink: 0,
              opacity: isActive ? 1 : 0.4,
            }} />
            {t.shortName}
            {t.completed && (
              <span style={{
                fontSize: 10,
                background: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                padding: '1px 6px',
                borderRadius: 10,
                letterSpacing: 0.5,
              }}>
                DONE
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
