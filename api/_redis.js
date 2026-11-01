const MAX_TOKEN_LENGTH = 4096
const ID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ID_LENGTH = 5

export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export function isValidToken(token) {
  return typeof token === 'string' && token.length > 0 && token.length <= MAX_TOKEN_LENGTH && /^[A-Za-z0-9_-]+$/.test(token)
}

export function isValidId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9]{5,8}$/.test(id)
}

export function runKey(id) {
  return `run:${id}`
}

export function randomId() {
  const bytes = new Uint8Array(ID_LENGTH)
  crypto.getRandomValues(bytes)
  let id = ''
  for (const byte of bytes) id += ID_CHARS[byte % ID_CHARS.length]
  return id
}

export async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    const error = new Error('redis not configured')
    error.status = 503
    throw error
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  const data = await response.json()
  if (!response.ok || data.error) {
    const error = new Error(data.error || 'redis request failed')
    error.status = 502
    throw error
  }
  return data.result
}
