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

  if (idx < 0 && context.env.SLACK_WEBHOOK_URL) {
    const tournamentId = new URL(context.request.url).searchParams.get('tournament') || 'spring-2026'
    const message = {
      text: `🥏 A new round (${body.round.roundNumber}) has been added to ${tournamentId}. View tournament scores: <https://bogeyatbest.com/|bogeyatbest.com>`,
    }
    try {
      const slackResponse = await fetch(context.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })
      if (!slackResponse.ok) {
        console.error(`Slack notification failed with status ${slackResponse.status}`)
      }
    } catch (error) {
      console.error('Slack notification failed:', error)
    }
  }

  return jsonResponse({ ok: true })
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context)
  if (context.request.method === 'POST') return onRequestPost(context)
  return jsonResponse({ error: 'Method not allowed' }, 405)
}
