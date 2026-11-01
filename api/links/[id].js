import { isValidId, json, redis, runKey } from '../_redis.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    json(res, 405, { error: 'method not allowed' })
    return
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  if (!isValidId(id)) {
    json(res, 400, { error: 'invalid id' })
    return
  }

  try {
    const token = await redis(['GET', runKey(id)])
    if (!token) {
      json(res, 404, { error: 'not found' })
      return
    }
    json(res, 200, { token })
  } catch (error) {
    json(res, error.status || 500, { error: error.message || 'lookup failed' })
  }
}
