import { Context } from "../context";
import { InlineQueryResultBuilder } from 'grammy';
import { nowSpotifyTrack, recentlySpotifyTracks, spotifyDown } from '../../utils/requests';
import { SpotifyItemDto } from '../../dto/spotify.dto';

export const spotifyInlineTracks = async (token: string, ctx: Context) => {
  let nowPlayingTrack = await nowSpotifyTrack(token)
  // console.log(nowPlayingTrack.data?.item, '---');
  let limit = nowPlayingTrack.data ? 9 : 10
  let recentlyPlayingTracks = await recentlySpotifyTracks(token, limit)
  
  if (recentlyPlayingTracks.data) {
    let data: SpotifyItemDto[] = recentlyPlayingTracks.data?.items.map(val => val.track)
    data = nowPlayingTrack.data ? [nowPlayingTrack.data.item, ...data] : data
    // console.log(data[1], '===');
    
    const description = ctx.t('wait');
    const result = data.map((val, index) => {
      let duration = val.duration_ms / 1000
      let url = `${process.env.SERVER_URI}/files/yes-yes-yes_jojo.mp3`;
      // let url = `${process.env.SERVER_URI}/files/yes-yes-yes_jojo.mp3`;
      
      return InlineQueryResultBuilder.audio(`spotify-${val.id}-${index}`, val.name, url, {
        audio_duration: parseInt(duration.toString(), 10),
        caption: description,
        performer: val.artists.map(artist => artist.name).join(' | '),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: ctx.t('process'), callback_data: 'loading' }]]
        },
      })
    })

    return result
  }
  return []
}