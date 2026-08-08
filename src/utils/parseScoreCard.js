import { validateParsed } from './scoreCardParsing.js'

export async function parseScoreCardWithClaude(imageFile, adminPin) {
  const base64Data = await fileToBase64(imageFile)
  const mediaType = imageFile.type || 'image/jpeg'

  const headers = { 'Content-Type': 'application/json' }
  if (adminPin) headers['X-Admin-Secret'] = adminPin

  const response = await fetch('/api/parse-scorecard', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      imageData: base64Data,
      mediaType,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || err.message || `API error ${response.status}`)
  }

  try {
    const parsed = await response.json()
    validateParsed(parsed)
    return parsed
  } catch (e) {
    throw new Error('Could not parse score card data. Please ensure the image is clear and try again.')
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
