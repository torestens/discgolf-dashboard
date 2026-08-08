function getKvKey(url) {
  const tournamentId = new URL(url).searchParams.get('tournament')
  // spring-2026 maps to the original 'rounds' key for backward compatibility
  if (!tournamentId || tournamentId === 'spring-2026') return 'rounds'
  return `rounds_${tournamentId}`
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function checkAuth(context) {
  const secret = context.env.ADMIN_SECRET
  if (!secret) return true
  return context.request.headers.get('X-Admin-Secret') === secret
}

export async function onRequestGet(context) {
  if (!context.env.ROUNDS_KV) {
    return jsonResponse({ error: 'ROUNDS_KV binding not configured' }, 503)
  }
  const key = getKvKey(context.request.url)
  const raw = await context.env.ROUNDS_KV.get(key)
  return jsonResponse(raw ? JSON.parse(raw) : [])
}

export async function onRequestPost(context) {
  if (!context.env.ROUNDS_KV) {
    return jsonResponse({ error: 'ROUNDS_KV binding not configured' }, 503)
  }
  if (!checkAuth(context)) return jsonResponse({ error: 'Unauthorized' }, 401)

  const body = await context.request.json()
  if (!body.round) return jsonResponse({ error: 'Missing round' }, 400)

  const key = getKvKey(context.request.url)
  const raw = await context.env.ROUNDS_KV.get(key)
  const rounds = raw ? JSON.parse(raw) : []

  const idx = rounds.findIndex(r => r.id === body.round.id)
  if (idx >= 0) rounds[idx] = body.round
  else rounds.push(body.round)

  await context.env.ROUNDS_KV.put(key, JSON.stringify(rounds))
  return jsonResponse({ ok: true })
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context)
  if (context.request.method === 'POST') return onRequestPost(context)
  return jsonResponse({ error: 'Method not allowed' }, 405)
}
