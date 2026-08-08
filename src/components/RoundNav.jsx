import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function RoundNav({ rounds, currentIndex, onPrev, onNext, onSelect }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '24px 0 20px',
    }}>
      {/* Prev button */}
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        style={{
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
          background: currentIndex === 0 ? 'var(--bg-card)' : 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Round pills */}
      <div style={{
        flex: 1, display: 'flex', gap: 6, overflowX: 'auto',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        padding: '4px 0',
      }}>
        {rounds.map((round, i) => (
          <button
            key={round.id}
            onClick={() => onSelect(i)}
            style={{
              flexShrink: 0,
              padding: '5px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid',
              transition: 'all 0.15s',
              background: i === currentIndex ? 'var(--accent-season)' : 'var(--bg-card)',
              borderColor: i === currentIndex ? 'var(--accent-season)' : 'var(--border)',
              color: i === currentIndex ? '#0d0f1a' : 'var(--text-secondary)',
            }}
          >
            R{i + 1}
            {round.course && (
              <span style={{ marginLeft: 4, opacity: 0.7, display: 'none' }}>
                {round.course}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={currentIndex === rounds.length - 1}
        style={{
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
          background: currentIndex === rounds.length - 1 ? 'var(--bg-card)' : 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: currentIndex === rounds.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
