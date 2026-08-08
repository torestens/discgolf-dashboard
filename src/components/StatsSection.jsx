import React from 'react'
import { Bird, Award, MessageSquare } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar.jsx'

function getBestRatings(playerName, rounds, upToIndex, topN) {
  const ratings = []
  for (let i = 0; i <= upToIndex; i++) {
    const round = rounds[i]
    const player = round.players?.find(p => p.name === playerName)
    if (player && player.rating != null) {
      ratings.push({ rating: player.rating, roundNumber: i + 1 })
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

function countBirdiesInRound(player, holes) {
  return (player.scores || []).reduce((count, score, i) => {
    const par = holes[i]?.par
    return par && score === par - 1 ? count + 1 : count
  }, 0)
}

function getBirdieSnatchers(rounds, upToIndex, roundsToCount) {
  return getAllPlayers(rounds, upToIndex)
    .map(name => {
      const bestRoundRefs = getBestRatings(name, rounds, upToIndex, roundsToCount)
      const birdies = bestRoundRefs.reduce((sum, { roundNumber }) => {
        const round = rounds[roundNumber - 1]
        const player = round.players?.find(p => p.name === name)
        return sum + (player && round.holes ? countBirdiesInRound(player, round.holes) : 0)
      }, 0)
      return { name, birdies }
    })
    .filter(p => p.birdies > 0)
    .sort((a, b) => b.birdies - a.birdies)
}

function getBestRoundOfTour(rounds, upToIndex) {
  let bestRating = null
  let best = []
  for (let i = 0; i <= upToIndex; i++) {
    for (const player of rounds[i].players || []) {
      if (player.rating != null) {
        if (bestRating === null || player.rating > bestRating) {
          bestRating = player.rating
          best = [{ name: player.name, rating: player.rating, roundNumber: i + 1 }]
        } else if (player.rating === bestRating) {
          best.push({ name: player.name, rating: player.rating, roundNumber: i + 1 })
        }
      }
    }
  }
  return best
}

function numWord(n) {
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  return n >= 0 && n <= 10 ? words[n] : String(n)
}

function pick(arr, seed) {
  return arr[seed % arr.length]
}

function generateRoundSummary(round) {
  if (!round) return null
  const holes = round.holes || []
  const players = round.players || []
  if (!players.length) return null

  const sentences = players.map((player, playerIdx) => {
    const scores = player.scores || []
    const firstName = player.name.split(' ')[0]
    let aces = 0, birdies = 0, bogeys = 0, doubles = 0

    scores.forEach((score, i) => {
      const par = holes[i]?.par
      if (!par) return
      const diff = score - par
      if (score === 1) aces++
      else if (diff === -1) birdies++
      if (diff === 1) bogeys++
      else if (diff >= 2) doubles++
    })

    // Seed per-player so different players in the same round get different variants
    const seed = (scores.reduce((a, b) => a + b, 0) + playerIdx * 7) || playerIdx

    if (aces > 0) return pick([
      `ACE! ${firstName} hit a hole-in-one — stop everything, history was made today.`,
      `${firstName} carded an ace. Absolute scenes.`,
      `A hole-in-one for ${firstName}. That one goes in the memory bank forever.`,
    ], seed)

    if (birdies >= 4 && bogeys === 0 && doubles === 0) return pick([
      `Impressive round from ${firstName} with ${numWord(birdies)} birdies and no bogeys, looking like a tour favorite.`,
      `${firstName} was on fire — ${numWord(birdies)} birdies and a clean scorecard.`,
      `${numWord(birdies)} birdies, zero bogeys. ${firstName} made it look easy today.`,
      `${firstName} brought their A-game: ${numWord(birdies)} birdies and nothing dropped.`,
    ], seed)

    if (birdies >= 2 && bogeys === 0 && doubles === 0) return pick([
      `${firstName} kept it clean — ${numWord(birdies)} birdies and zero bogeys.`,
      `Bogey-free for ${firstName}, picking up ${numWord(birdies)} birdies along the way.`,
      `${firstName} played tidy disc golf today — ${numWord(birdies)} birdies, nothing dropped.`,
    ], seed)

    if (birdies >= 3 && (bogeys + doubles) >= 2) return pick([
      `${firstName} came out hot with ${numWord(birdies)} birdies, but then the bogeys came.`,
      `${firstName} had ${numWord(birdies)} birdies in the bag but couldn't shake the dropped holes.`,
      `Great stretches from ${firstName} — ${numWord(birdies)} birdies — but the mistakes crept in too.`,
      `${firstName} showed plenty of promise with ${numWord(birdies)} birdies, yet the round had its rough patches.`,
    ], seed)

    if (birdies >= 2 && (bogeys + doubles) >= 3) return pick([
      `${firstName} had the birdies but also collected the bogeys — a proper rollercoaster.`,
      `Up and down all day for ${firstName}: birdies on one hole, dropped shots on the next.`,
      `${firstName}'s round was all peaks and valleys — never dull, never clean.`,
    ], seed)

    if (birdies >= 2 && bogeys >= 1) return pick([
      `${firstName} found ${numWord(birdies)} birdies out there, though not without ${numWord(bogeys)} bogey${bogeys > 1 ? 's' : ''}.`,
      `${numWord(birdies)} birdies for ${firstName}, offset by ${numWord(bogeys)} bogey${bogeys > 1 ? 's' : ''} — a mixed bag.`,
      `${firstName} traded birdies for bogeys today, ending with ${numWord(birdies)} of each (more or less).`,
    ], seed)

    if (doubles >= 3) return pick([
      `Rough day for ${firstName}, picking up ${numWord(doubles)} doubles.`,
      `${firstName} ran into trouble on several holes — ${numWord(doubles)} double bogeys tells the story.`,
      `The course bit ${firstName} hard today: ${numWord(doubles)} doubles on the card.`,
    ], seed)

    if (bogeys >= 5) return pick([
      `${firstName} fought hard but the course got the better of them today — ${numWord(bogeys)} bogeys.`,
      `${numWord(bogeys)} bogeys for ${firstName}. One of those rounds where nothing quite clicked.`,
      `${firstName} was battling all day — ${numWord(bogeys)} bogeys on the scorecard to prove it.`,
    ], seed)

    if (birdies >= 2) return pick([
      `${firstName} was quietly efficient, carding ${numWord(birdies)} birdies.`,
      `${numWord(birdies)} birdies for ${firstName} — solid work without any drama.`,
      `${firstName} picked up ${numWord(birdies)} birdies and kept the round under control.`,
    ], seed)

    if (bogeys >= 3) return pick([
      `${firstName} struggled a bit, carding ${numWord(bogeys)} bogeys.`,
      `Not ${firstName}'s best day — ${numWord(bogeys)} bogeys made it a tough one.`,
      `${firstName} dropped ${numWord(bogeys)} holes today and will be keen to move on.`,
    ], seed)

    if (birdies === 1 && bogeys === 0) return pick([
      `${firstName} was solid today — mostly pars with a birdie to show for it.`,
      `Steady and clean for ${firstName}: pars all around and one birdie earned.`,
      `${firstName} played it safe and smart — one birdie, no damage done.`,
    ], seed)

    return pick([
      `${firstName} had a steady, uneventful round.`,
      `All pars for ${firstName} today — consistent, if not spectacular.`,
      `${firstName} grinded through it — nothing flashy, nothing ugly.`,
    ], seed)
  })

  return sentences.filter(Boolean).join(' ')
}

export function RoundSummary({ round }) {
  const summary = generateRoundSummary(round)
  if (!summary) return null

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '14px 20px',
      marginTop: 16,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      <div style={{
        width: 28, height: 28, flexShrink: 0,
        borderRadius: 7,
        background: 'rgba(139,92,246,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        <MessageSquare size={14} color="#a78bfa" />
      </div>
      <div>
        <div style={{
          fontSize: 11, color: 'var(--text-muted)',
          marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Round recap
        </div>
        <p style={{
          fontSize: 13, color: 'var(--text-secondary)',
          lineHeight: 1.65, margin: 0, fontStyle: 'italic',
        }}>
          {summary}
        </p>
      </div>
    </div>
  )
}

export function BottomStats({ rounds, upToRoundIndex, roundsToCount }) {
  if (!rounds.length) return null

  const birdieSnatchers = getBirdieSnatchers(rounds, upToRoundIndex, roundsToCount)
  const bestRounds = getBestRoundOfTour(rounds, upToRoundIndex)

  if (birdieSnatchers.length === 0 && !bestRounds.length) return null

  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>

      {/* Birdie Snatchers */}
      {birdieSnatchers.length > 0 && (
        <div style={{
          flex: 1, minWidth: 220,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(74,222,128,0.04) 100%)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'rgba(74,222,128,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bird size={13} color="var(--accent-green)" />
            </div>
            <div>
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16, letterSpacing: 1.5,
                color: 'var(--text-primary)', lineHeight: 1, margin: 0,
              }}>
                Birdie Snatchers
              </h4>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                Best {roundsToCount} rounds
              </p>
            </div>
          </div>
          <div>
            {birdieSnatchers.map((player, i) => (
              <div
                key={player.name}
                style={{
                  padding: '10px 18px',
                  borderBottom: i < birdieSnatchers.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{
                  width: 18, textAlign: 'center', flexShrink: 0,
                  fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: 1,
                  color: i === 0 ? 'var(--accent-green)' : 'var(--text-muted)',
                }}>
                  {i + 1}
                </span>
                <PlayerAvatar name={player.name} size={28} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>
                  {player.name.split(' ')[0]}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22, letterSpacing: 1,
                    color: 'var(--accent-green)', lineHeight: 1,
                  }}>
                    {player.birdies}
                  </span>
                  <Bird size={11} color="var(--accent-green)" style={{ opacity: 0.6 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Round of the Tour */}
      {bestRounds.length > 0 && (
        <div style={{
          flex: 1, minWidth: 220,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(251,191,36,0.04) 100%)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'var(--accent-amber-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Award size={13} color="var(--accent-amber)" />
            </div>
            <div>
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16, letterSpacing: 1.5,
                color: 'var(--text-primary)', lineHeight: 1, margin: 0,
              }}>
                Best Round of the Tour
              </h4>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                Highest rated single round
              </p>
            </div>
          </div>
          <div>
            {bestRounds.map((entry, i) => (
              <div
                key={`${entry.name}-${entry.roundNumber}`}
                style={{
                  padding: bestRounds.length === 1 ? '16px 18px' : '10px 18px',
                  borderBottom: i < bestRounds.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <PlayerAvatar name={entry.name} size={bestRounds.length === 1 ? 38 : 28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: bestRounds.length === 1 ? 14 : 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {entry.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Round {entry.roundNumber}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: bestRounds.length === 1 ? 36 : 22, letterSpacing: 1,
                  color: 'var(--accent-amber)', lineHeight: 1,
                }}>
                  {entry.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
