import { requestScoreCardParse } from '../../src/utils/scoreCardParsing.js'

export async function onRequestPost(context) {
  const secret = context.env.ADMIN_SECRET
  if (secret) {
    const provided = context.request.headers.get('X-Admin-Secret')
    if (provided !== secret) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }
  }

  try {
    const body = await context.request.json()
    const parsed = await requestScoreCardParse({
      imageData: body.imageData,
      mediaType: body.mediaType,
      apiKey: context.env.ANTHROPIC_API_KEY,
      model: context.env.ANTHROPIC_MODEL,
    })

    return jsonResponse(parsed, 200)
  } catch (error) {
    return jsonResponse({ error: error.message || 'Failed to parse score card.' }, error.status || 500)
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}