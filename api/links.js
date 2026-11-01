import { isValidToken, json, randomId, redis, runKey } from './_redis.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'method not allowed' })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      json(res, 400, { error: 'invalid body' })
      return
    }
  }

  const token = body?.token
  if (!isValidToken(token)) {
    json(res, 400, { error: 'invalid token' })
    return
  }

  try {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const id = randomId()
      const created = await redis(['SET', runKey(id), token, 'NX'])
      if (created === 'OK') {
        json(res, 200, { id })
        return
      }
    }
    json(res, 503, { error: 'could not mint' })
  } catch (error) {
    json(res, error.status || 500, { error: error.message || 'share failed' })
  }
}
