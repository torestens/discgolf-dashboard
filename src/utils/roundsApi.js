export async function fetchRounds(tournamentId) {
  const url = tournamentId ? `/api/rounds?tournament=${encodeURIComponent(tournamentId)}` : '/api/rounds'
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Server error ${res.status}`)
  }
  return res.json()
}

export async function saveRound(round, adminPin, tournamentId) {
  const url = tournamentId ? `/api/rounds?tournament=${encodeURIComponent(tournamentId)}` : '/api/rounds'
  const headers = { 'Content-Type': 'application/json' }
  if (adminPin) headers['X-Admin-Secret'] = adminPin
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ round }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to save round')
  }
}
