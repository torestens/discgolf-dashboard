import React, { useState } from 'react'

const PLAYER_COLORS = [
  { bg: '#1a3a2a', text: '#4ade80' },
  { bg: '#1a2a3a', text: '#38bdf8' },
  { bg: '#3a2a1a', text: '#fbbf24' },
  { bg: '#2a1a3a', text: '#a78bfa' },
  { bg: '#3a1a2a', text: '#f472b6' },
  { bg: '#1a3a3a', text: '#34d399' },
]

function getColorForName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length]
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function PlayerAvatar({ name, size = 36, avatarUrl }) {
  const [imgError, setImgError] = useState(false)
  const color = getColorForName(name)

  const resolvedUrl = avatarUrl || `/avatars/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.08)',
    }}>
      {!imgError ? (
        <img
          src={resolvedUrl}
          alt={name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: color.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.35,
          fontWeight: 600,
          color: color.text,
          letterSpacing: 0.5,
        }}>
          {getInitials(name)}
        </div>
      )}
    </div>
  )
}
