export interface SpotifyErrorDto {
  data?: any;
  message: string;
}

export interface SpotifyAuthCodeDto {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string
};

export interface SpotifyRefreshTokenDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string
};

export interface SpotifyItemDto {
  album: {
    name: string;
    release_date: string;
    images: [{
      height: number;
      url: string;
      width: number;
    }];
  };
  artists: [{ name: string }];
  duration_ms: number;
  external_urls: { spotify: string };
  href: string;
  id: string;
  name: string;
};

export interface SpotifyTracksDto {
  items: [{
    track: SpotifyItemDto;
  }]
}

export interface SpotifyDown {
  success: boolean;
  metadata: {
    artists: string;
    title: string;
    album: string;
    cover: string;
  };
  link: string;
}