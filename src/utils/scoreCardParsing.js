export const SCORE_CARD_SYSTEM_PROMPT = `You are a disc golf score card parser. Extract all data from the score card image and return ONLY valid JSON with no markdown or explanation.

Return this exact structure:
{
  "course": "Course name",
  "date": "YYYY-MM-DD or as shown",
  "layout": "Course layout/tees if shown, else null",
  "players": [
    {
      "name": "Player Full Name",
      "scores": [3, 4, 2, 3, 5, 4, 3, 2, 4, 3, 4, 2, 3, 4, 5, 3, 2, 4],
      "total": 62,
      "rating": 180
    }
  ],
  "holes": [
    { "number": 1, "par": 3, "distance": 220 }
  ],
  "totalPar": 54
}

Important:
- scores array = one score per hole in order
- rating = round rating as shown on card (a number usually between 100 and 200, with a plus icon in front of it). This is shown above the score card next to the player's name, calculate as null if not available.
- distance in meters as shown, null if not available
- If round score is shown as e.g. "-3" or similar
- Extract every player listed on the card`

const MODEL_FALLBACKS = [
  'claude-3-7-sonnet-latest',
  'claude-3-5-sonnet-latest',
  'claude-sonnet-4-20250514',
]

export async function requestScoreCardParse({ imageData, mediaType, apiKey, model, fetchImpl = fetch }) {
  if (!apiKey) {
    throw createHttpError(500, 'Anthropic API key is not configured on the server.')
  }

  if (!imageData || !mediaType) {
    throw createHttpError(400, 'Image data and media type are required.')
  }

  const candidateModels = buildModelCandidates(model)
  let lastModelError = null

  for (const candidateModel of candidateModels) {
    const response = await fetchImpl('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: candidateModel,
        max_tokens: 1000,
        system: SCORE_CARD_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageData,
                },
              },
              {
                type: 'text',
                text: 'Parse this disc golf score card and return JSON only.',
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const errorMessage = err.error?.message || `Anthropic API error ${response.status}`

      if (isModelNotFoundError(response.status, errorMessage)) {
        lastModelError = errorMessage
        continue
      }

      throw createHttpError(response.status, errorMessage)
    }

    const data = await response.json()
    const text = data.content?.find(block => block.type === 'text')?.text || ''
    const parsed = JSON.parse(cleanAnthropicText(text))

    validateParsed(parsed)
    return parsed
  }

  const triedModels = candidateModels.join(', ')
  const baseMessage = 'No available Anthropic model was found for this API key.'
  const detail = lastModelError ? ` Last error: ${lastModelError}` : ''
  throw createHttpError(500, `${baseMessage} Tried: ${triedModels}. Set ANTHROPIC_MODEL to a model your account can access.${detail}`)
}

export function validateParsed(data) {
  if (!data.players || !Array.isArray(data.players) || data.players.length === 0) {
    throw new Error('No players found on score card')
  }

  if (!data.holes || !Array.isArray(data.holes)) {
    throw new Error('No hole data found on score card')
  }
}

function cleanAnthropicText(text) {
  let cleaned = text.trim()

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  return cleaned
}

function buildModelCandidates(model) {
  const configured = (model || '').trim()
  const models = configured ? [configured, ...MODEL_FALLBACKS] : [...MODEL_FALLBACKS]
  return [...new Set(models)]
}

function isModelNotFoundError(status, errorMessage) {
  if (status !== 404) {
    return false
  }

  return /model/i.test(errorMessage || '')
}

function createHttpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}