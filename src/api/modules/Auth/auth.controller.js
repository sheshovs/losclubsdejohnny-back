import AuthService from "./auth.service.js";
import bcrypt from "bcryptjs";
import { EncodeData, DecodeData } from "../../utils/jwtEncoder.js";
import { setSpotifyToken } from "../../../config/store.js";

const AuthController = {
  Login: async (req, res) => {
    const { username, password } = req.body;

    let [user] = await AuthService.getUserByUsername(username)

    if (!user) {
      return res
        .status(404)
        .json({ error: "El usuario no se encuentra registrado" });
    }

    const passCorrect = await bcrypt.compare(password, user.password)

    if (!passCorrect) {
      return res.status(400).send({ error: 'Contraseña incorrecta' })
    }

    const payload = {
      uuid: user.uuid,
      username
    }

    const token = EncodeData(payload)

    return res.status(200).json({ token })
  },
  CurrentUser: async (req, res) => {
    const { authorization } = req.headers
    const payload = DecodeData(authorization)
    const { uuid } = payload

    if (!uuid) {
      return res.status(400).send({ error: 'Faltan parámetros' })
    }

    let [user] = await AuthService.getUserByUUID(uuid)

    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' })
    }

    const userData = {
      ...user,
    }
    delete userData.password

    res.status(200).send(userData)
  },

  // getSpotifyToken: (clientId: string, clientSecret: string): Promise<SpotifyTokenResponse> => {
  //   return spotifyTokenInstance.post(`/token`, new URLSearchParams({
  //     grant_type: `client_credentials`,
  //     client_id: clientId,
  //     client_secret: clientSecret,
  //   }), {
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //   })
  // },
  SpotifyToken: async (req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        })
      });

      if (!response.ok) {
        return res.status(response.status).send({ error: 'Error al obtener el token de Spotify' });
      }

      const data = await response.json();
      setSpotifyToken(data.access_token);
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: 'Error interno del servidor' });
    }
  }
}

export default AuthController;