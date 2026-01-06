import { DecodeData } from '../utils/jwtEncoder.js'

export default async (req, res, next) => {
  let token = req.headers.authorization
  const publicRoute =
    ((req.method === 'POST' && req.url.includes("/auth/login")) ||
      (req.method === 'GET' && req.url.includes("/auth/spotify/token")) ||
      (req.method === 'GET' && req.url.includes("/billboard/active")))
  if (publicRoute) {
    next()
  } else {
    if (!token) {
      return res.status(400).send({ error: 'ERROR_NO_TOKEN' })
    }


    // check if token comes with Bearer prefix
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }


    const decodedToken = DecodeData(token)

    if (!decodedToken) {
      return res.status(401).send({ error: 'ERROR_INVALID_TOKEN' })
    }

    const { uuid, username } = decodedToken
    if (!uuid || !username) {
      return res.status(401).send({ error: 'ERROR_INVALID_TOKEN' })
    }

    req.payload = {
      ...req.payload,
      username,
      uuid
    }
    next()
  }
}