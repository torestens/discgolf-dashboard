import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { requestScoreCardParse } from './src/utils/scoreCardParsing.js'

function getDevRoundsFile(url) {
  const tournamentId = new URL(`http://localhost${url}`).searchParams.get('tournament')
  // spring-2026 maps to the original file for backward compatibility
  if (!tournamentId || tournamentId === 'spring-2026') {
    return join(process.cwd(), 'rounds.dev.json')
  }
  return join(process.cwd(), `rounds.${tournamentId}.dev.json`)
}

function readDevRounds(file) {
  if (!existsSync(file)) return []
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return [] }
}

function roundsDevPlugin(adminSecret) {
  return {
    name: 'rounds-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url.split('?')[0]
        if (pathname !== '/api/rounds') return next()

        const send = (data, status = 200) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }

        const file = getDevRoundsFile(req.url)

        if (req.method === 'GET') {
          send(readDevRounds(file))
          return
        }

        if (req.method === 'POST') {
          if (adminSecret && req.headers['x-admin-secret'] !== adminSecret) {
            send({ error: 'Unauthorized' }, 401)
            return
          }
          readJsonBody(req)
            .then(body => {
              if (!body.round) throw Object.assign(new Error('Missing round'), { status: 400 })
              const rounds = readDevRounds(file)
              const idx = rounds.findIndex(r => r.id === body.round.id)
              if (idx >= 0) rounds[idx] = body.round
              else rounds.push(body.round)
              writeFileSync(file, JSON.stringify(rounds, null, 2))
              send({ ok: true })
            })
            .catch(err => send({ error: err.message }, err.status || 500))
          return
        }

        send({ error: 'Method not allowed' }, 405)
      })
    },
  }
}

function scoreCardApiPlugin(apiKey, model) {
  return {
    name: 'score-card-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url.split('?')[0]
        
        if (pathname !== '/api/parse-scorecard') {
          return next()
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        readJsonBody(req)
          .then(body => requestScoreCardParse({
            imageData: body.imageData,
            mediaType: body.mediaType,
            apiKey,
            model,
          }))
          .then(parsed => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(parsed))
          })
          .catch(error => {
            res.statusCode = error.status || 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: error.message || 'Failed to parse score card.' }))
          })
      })
    },
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = ''

    req.on('data', chunk => {
      rawBody += chunk
    })

    req.on('end', () => {
      try {
        resolve(JSON.parse(rawBody || '{}'))
      } catch {
        reject(new Error('Invalid JSON request body.'))
      }
    })

    req.on('error', reject)
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), scoreCardApiPlugin(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL), roundsDevPlugin(env.VITE_ADMIN_PIN)],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
