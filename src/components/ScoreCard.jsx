import React, { useState } from 'react'
import { MapPin, Calendar, Star, Pencil } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar.jsx'

function scoreColor(score, par) {
  const diff = score - par
  if (diff <= -2) return { bg: '#fbbf24', text: '#000', label: 'Eagle' }
  if (diff === -1) return { bg: '#4ade80', text: '#000', label: 'Birdie' }
  if (diff === 0) return { bg: 'transparent', text: 'var(--text-primary)', border: 'var(--border)', label: 'Par' }
  if (diff === 1) return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)', label: 'Bogey' }
  return { bg: 'rgba(239,68,68,0.3)', text: '#ef4444', border: 'rgba(239,68,68,0.5)', label: 'Double+' }
}

export default function ScoreCard({ round, roundNumber, onEdit }) {
  const [view, setView] = useState('front') // 'front' | 'back' | 'all'

  if (!round) return null

  const { course, date, holes = [], players = [], totalPar } = round
  const hasTwoNines = holes.length > 9

  const frontHoles = holes.slice(0, 9)
  const backHoles = holes.slice(9, 18)

  let displayHoles = holes
  if (hasTwoNines) {
    if (view === 'front') displayHoles = frontHoles
    else if (view === 'back') displayHoles = backHoles
    else displayHoles = holes
  }

  const frontPar = frontHoles.reduce((s, h) => s + (h.par || 0), 0)
  const backPar = backHoles.reduce((s, h) => s + (h.par || 0), 0)

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {/* Card header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{
              background: 'var(--accent-green-dim)',
              border: '1px solid var(--accent-green-border)',
              color: 'var(--accent-green)',
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: 20,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Round {roundNumber}
            </span>
            {onEdit && (
              <button
                onClick={onEdit}
                title="Re-upload score card"
                style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            letterSpacing: 2,
            color: 'var(--text-primary)',
            lineHeight: 1,
            marginBottom: 8,
          }}>
            {course || 'Unknown Course'}
          </h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {date && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
                <Calendar size={13} /> {date}
              </span>
            )}
            {totalPar && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
                <MapPin size={13} /> Par {totalPar}
              </span>
            )}
          </div>
        </div>

        {/* View toggle for 18-hole */}
        {hasTwoNines && (
          <div style={{
            display: 'flex', gap: 4,
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: 3,
            border: '1px solid var(--border)',
          }}>
            {['front', 'back', 'all'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '4px 12px', borderRadius: 5,
                  fontSize: 12, fontWeight: 500,
                  transition: 'all 0.15s',
                  background: view === v ? 'var(--bg-elevated)' : 'transparent',
                  color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: view === v ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                {v === 'front' ? 'Front 9' : v === 'back' ? 'Back 9' : 'All 18'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Score table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ background: 'var(--bg-primary)' }}>
              <th style={thStyle({ width: 160, textAlign: 'left', paddingLeft: 24 })}>Player</th>
              {displayHoles.map((h, i) => (
                <th key={i} style={thStyle({ minWidth: 40 })}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 1 }}>H{h.number}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>P{h.par}</div>
                </th>
              ))}
              {hasTwoNines && view === 'all' && (
                <>
                  <th style={thStyle({ minWidth: 44, background: 'rgba(74,222,128,0.04)' })}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>F9</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>P{frontPar}</div>
                  </th>
                  <th style={thStyle({ minWidth: 44, background: 'rgba(74,222,128,0.04)' })}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>B9</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>P{backPar}</div>
                  </th>
                </>
              )}
              <th style={thStyle({ minWidth: 52, background: 'rgba(74,222,128,0.06)' })}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total</div>
                <div style={{ fontSize: 11, color: 'var(--accent-green)' }}>P{totalPar || holes.reduce((s,h) => s + h.par, 0)}</div>
              </th>
              <th style={thStyle({ minWidth: 60, background: 'rgba(74,222,128,0.06)' })}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rating</div>
                <Star size={10} style={{ color: 'var(--accent-amber)' }} />
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, pi) => {
              const displayScores = view === 'front' ? player.scores?.slice(0, 9)
                : view === 'back' ? player.scores?.slice(9, 18)
                : player.scores || []

              const frontTotal = (player.scores || []).slice(0, 9).reduce((s, v) => s + v, 0)
              const backTotal = (player.scores || []).slice(9, 18).reduce((s, v) => s + v, 0)

              return (
                <tr
                  key={pi}
                  style={{
                    borderTop: '1px solid var(--border)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 24px 10px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <PlayerAvatar name={player.name} size={30} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {player.name}
                      </span>
                    </div>
                  </td>
                  {displayScores.map((score, hi) => {
                    const holeIdx = view === 'back' ? hi + 9 : hi
                    const par = holes[holeIdx]?.par || 3
                    const colors = scoreColor(score, par)
                    return (
                      <td key={hi} style={{ textAlign: 'center', padding: '10px 4px' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: colors.bg,
                          border: `1px solid ${colors.border || 'transparent'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto',
                          fontSize: 13, fontWeight: 500,
                          color: colors.text,
                        }}>
                          {score}
                        </div>
                      </td>
                    )
                  })}
                  {hasTwoNines && view === 'all' && (
                    <>
                      <td style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(74,222,128,0.04)' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{frontTotal}</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(74,222,128,0.04)' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{backTotal}</span>
                      </td>
                    </>
                  )}
                  <td style={{ textAlign: 'center', padding: '10px 8px', background: 'rgba(74,222,128,0.04)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {player.total ?? displayScores.reduce((s, v) => s + v, 0)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 8px', background: 'rgba(74,222,128,0.04)' }}>
                    {player.rating ? (
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: 'var(--accent-amber)',
                        background: 'var(--accent-amber-dim)',
                        padding: '2px 8px', borderRadius: 4,
                      }}>
                        {player.rating}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Score legend */}
      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 16, flexWrap: 'wrap',
      }}>
        {[
          { bg: '#fbbf24', text: '#000', label: 'Eagle or better' },
          { bg: '#4ade80', text: '#000', label: 'Birdie' },
          { bg: 'transparent', text: 'var(--text-secondary)', border: 'var(--border)', label: 'Par' },
          { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Bogey' },
          { bg: 'rgba(239,68,68,0.3)', text: '#ef4444', label: 'Double+' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3,
              background: item.bg,
              border: `1px solid ${item.border || 'transparent'}`,
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function thStyle(extra = {}) {
  return {
    padding: '10px 4px',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 400,
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border)',
    ...extra,
  }
}
