import { User } from "../models/user.model";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  SpotifyAuthCodeDto,
  SpotifyErrorDto,
  SpotifyRefreshTokenDto,
  SpotifyItemDto,
  SpotifyTracksDto,
  SpotifyDown,
} from "../dto/spotify.dto";

const basicHeaders = {
  "Content-Type": "application/x-www-form-urlencoded",
  Authorization: "Basic " + btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`),
};

interface Response<T> {
  data?: T;
  error?: SpotifyErrorDto;
  status: number;
  message?: string
};

const spotifyApiRequest = async <T>(config: AxiosRequestConfig): Promise<Response<T>> => {
  try {
    const response: AxiosResponse = await axios(config);
    return { data: response.data as T, status: response.status, message: 'ok' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("RESPONSE", error.response);
      console.error("STATUS", error.status);
      return {
        status: error.response.status,
        error: {
          data: error.response.data,
          message: "Api error",
          description: 'Error in "spotifyApiRequest" function',
        },
      };
    } else {
      console.error(error);
      return {
        status: 500,
        error: {
          message: "Server error",
          description: 'Server error in "spotifyApiRequest" function',
        },
      };
    }
  }
}

export const spotifyAuthCode = async (code: string, redirectUri: string): Promise<Response<SpotifyAuthCodeDto>> => {
  const config: AxiosRequestConfig = {
    url: "https://accounts.spotify.com/api/token",
    method: "POST",
    data: {
      code: code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    },
    headers: basicHeaders,
    timeout: 2000,
  };

  return spotifyApiRequest<SpotifyAuthCodeDto>(config);
}

export const spotifyTokenRefresh = async (token: string, userId: number): Promise<Response<SpotifyRefreshTokenDto>> => {
  const config: AxiosRequestConfig = {
    url: "https://accounts.spotify.com/api/token",
    method: "POST",
    data: {
      grant_type: "refresh_token",
      refresh_token: token,
    },
    headers: basicHeaders,
    timeout: 2000,
  };

  const response = await spotifyApiRequest<SpotifyRefreshTokenDto>(config);
  if (response.data) {
    await User.findOneAndUpdate({ userId }, { $set: {
      spotifyAccessToken: response.data.access_token
    } });
  };
  return response;
}

export const nowSpotifyTrack = async (token: string): Promise<Response<{item: SpotifyItemDto}>> => {
  const config: AxiosRequestConfig = {
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    method: 'GET',
    params: { 'limit': 1 },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }

  return await spotifyApiRequest<{item: SpotifyItemDto}>(config);
};

export const recentlySpotifyTracks = async (token: string, limit: number): Promise<Response<SpotifyTracksDto>> => {
  const config: AxiosRequestConfig = {
    url: 'https://api.spotify.com/v1/me/player/recently-played',
    method: 'GET',
    params: { 'limit': limit },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }

  return await spotifyApiRequest<SpotifyTracksDto>(config);
}

export const spotifyDown = async (id: string): Promise<Response<SpotifyDown>> => {
  const config: AxiosRequestConfig = {
    url: `https://api.spotifydown.com/download/${id}`,
    method: 'GET',
    headers: {
      Origin: "https://spotifydown.com",
      Referer: "https://spotifydown.com"
    }
  }

  return await spotifyApiRequest<SpotifyDown>(config);
}