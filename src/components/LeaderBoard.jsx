import React from 'react'
import { Trophy, Star, TrendingUp } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar.jsx'

function getBestRatings(playerName, rounds, upToIndex, topN) {
  const ratings = []
  for (let i = 0; i <= upToIndex; i++) {
    const round = rounds[i]
    const player = round.players?.find(p => p.name === playerName)
    if (player && player.rating != null) {
      ratings.push({ rating: player.rating, roundNumber: i + 1, course: round.course })
    }
  }
  ratings.sort((a, b) => b.rating - a.rating)
  return ratings.slice(0, topN)
}

function getAllPlayers(rounds, upToIndex) {
  const names = new Set()
  for (let i = 0; i <= upToIndex; i++) {
    rounds[i].players?.forEach(p => names.add(p.name))
  }
  return [...names]
}

export default function LeaderBoard({ rounds, upToRoundIndex, roundsToCount, isCurrentFinal }) {
  if (!rounds.length) return null

  const allPlayers = getAllPlayers(rounds, upToRoundIndex)

  const standings = allPlayers.map(name => {
    const bestRounds = getBestRatings(name, rounds, upToRoundIndex, roundsToCount)
    const totalRating = bestRounds.reduce((s, r) => s + r.rating, 0)
    const roundsPlayed = rounds.slice(0, upToRoundIndex + 1).filter(r =>
      r.players?.some(p => p.name === name)
    ).length

    return {
      name,
      totalRating,
      bestRounds,
      roundsPlayed,
      avgRating: bestRounds.length > 0 ? Math.round(totalRating / bestRounds.length) : 0,
    }
  }).sort((a, b) => b.totalRating - a.totalRating)

  const roundLabel = isCurrentFinal
    ? `Final standings — best ${roundsToCount} of ${rounds.length} rounds`
    : `Through Round ${upToRoundIndex + 1} — best ${roundsToCount} rounds`

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(74,222,128,0.04) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent-amber-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={16} color="var(--accent-amber)" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, letterSpacing: 2,
              color: 'var(--text-primary)', lineHeight: 1,
            }}>
              Tournament Leader
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {roundLabel}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <Star size={12} color="var(--accent-amber)" />
          Ranked by total round rating
        </div>
      </div>

      {/* Standings list */}
      <div>
        {standings.map((player, i) => {
          const isLeader = i === 0
          const gap = isLeader ? 0 : standings[0].totalRating - player.totalRating

          return (
            <div
              key={player.name}
              style={{
                padding: '16px 24px',
                borderBottom: i < standings.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', gap: 16,
                background: isLeader ? 'rgba(251,191,36,0.03)' : 'transparent',
                transition: 'background 0.1s',
                flexWrap: 'wrap',
              }}
              onMouseEnter={e => !isLeader && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => !isLeader && (e.currentTarget.style.background = 'transparent')}
            >
              {/* Rank */}
              <div style={{
                width: 28, textAlign: 'center', flexShrink: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 22, letterSpacing: 1,
                color: i === 0 ? 'var(--accent-amber)' :
                       i === 1 ? '#94a3b8' :
                       i === 2 ? '#cd7c3e' :
                       'var(--text-muted)',
              }}>
                {i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : i + 1}
              </div>

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 140 }}>
                <div style={{ position: 'relative' }}>
                  <PlayerAvatar name={player.name} size={42} />
                  {isLeader && (
                    <div style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'var(--accent-amber)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: 'pulse-green 2s infinite',
                    }}>
                      <Trophy size={9} color="#000" />
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                    {player.roundsPlayed} round{player.roundsPlayed !== 1 ? 's' : ''} played
                    {player.bestRounds.length > 0 && ` · avg ${player.avgRating}`}
                  </div>
                </div>
              </div>

              {/* Best rounds breakdown */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, minWidth: 160 }}>
                {player.bestRounds.map((r, ri) => (
                  <div
                    key={ri}
                    title={`Round ${r.roundNumber}: ${r.course}`}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 5,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      fontSize: 12, color: 'var(--text-secondary)',
                    }}
                  >
                    R{r.roundNumber} <span style={{ color: 'var(--accent-amber)', fontWeight: 500 }}>{r.rating}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, roundsToCount - player.bestRounds.length) }).map((_, ri) => (
                  <div
                    key={`empty-${ri}`}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 5,
                      background: 'var(--bg-primary)',
                      border: '1px dashed var(--border)',
                      fontSize: 12, color: 'var(--text-muted)',
                    }}
                  >
                    —
                  </div>
                ))}
              </div>

              {/* Total + gap */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26, letterSpacing: 1,
                  color: isLeader ? 'var(--accent-amber)' : 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  {player.totalRating || '—'}
                </div>
                {!isLeader && gap > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    -{gap} pts
                  </div>
                )}
                {isLeader && (
                  <div style={{ fontSize: 11, color: 'var(--accent-green)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                    <TrendingUp size={10} /> Leader
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-primary)',
        fontSize: 11, color: 'var(--text-muted)',
      }}>
        Only the {roundsToCount} highest-rated rounds count toward the total. Rounds without a rating are excluded.
      </div>
    </div>
  )
}
