import { User, UserModel } from "../models/user.model";
import { stringify } from "querystring";
import { Router, Request, Response } from "express";

import { spotifyAuthCode } from "../utils/requests";
import { spotifySuccessAuth } from "../bot/handlers/spotify";

const redirectUri = `${process.env.LOCAL_URI}/spotify/auth-code`;
const router = Router();

router.get('/auth/:userId/:messageId', async (req: Request, res: Response) => {
  const { userId, messageId } = req.params;

  res.redirect('https://accounts.spotify.com/authorize?' + 
    stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: 'user-read-currently-playing user-read-recently-played user-modify-playback-state',
      redirect_uri: redirectUri,
      state: `${userId}-${messageId}`
    })
  );
});

router.get('/auth-code', async (req: Request, res: Response) => {
  let { code, error, state } = req.query;

  if (error) return res.status(400).json({message: error});
  if (state === null) return res.status(400).json({message: 'State mismatch'})

  let response = await spotifyAuthCode(code!.toString(), redirectUri);

  if (response.message !== 'ok') return res.status(response.status).json({
    status: response.status,
    error: response.error?.message
  });

  state = state!.toString().split('-');
  let userId: number = parseInt(state[0]);
  let messageId = parseInt(state[1]);

  if (response.data) {
    const { access_token, expires_in, refresh_token, scope, token_type } = response.data;
    await User.findOneAndUpdate({ userId }, { 
      $set: {
        spotify: true,
        spotifyAccessToken: access_token,
        spotifyExpiresIn: expires_in,
        spotifyRefreshToken: refresh_token,
        spotifyScope: scope,
        spotifyTokenType: token_type
      }
    });

    const user: UserModel | null = await User.findOne({ userId });
    if (user)
      await spotifySuccessAuth(userId, messageId, user.language)

    res.status(200).json({message: 'Auth success'})
  } else {
    res.status(500).json({message: 'Unknown error!'})
  }
});


export { router as spotify }