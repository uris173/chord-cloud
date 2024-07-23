import bot from "../bot"
import { Context } from "../context"

import { join, resolve } from 'path';
import { readFile, writeFile } from 'fs'
import { promisify } from 'util';
import NodeID3 from 'node-id3';
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

import { User } from "../../models/user.model"
import { spotifyDown, spotifyTokenRefresh } from "../../utils/requests"
import { spotifyInlineTracks } from "../options/spotify";
import { connectToService, messageInlineMedia } from "../options/helper";
import axios from "axios";
// import { spotifyInlineTracks } from "../options/helpers"

export const spotifySuccessAuth = async (userId: number, messageId: number, language: string) => {
  const text = language === 'en' ? "Authorization was successful!\n\nType the command /logout to log out." : language === 'uk' ? "Авторизація пройшла успішно!\n\nНапишіть команду /logout, щоб вийти." : "Авторизация прошла успешно!\n\nНапишите комманду /logout чтобы выйти.";

  const keyboardText = language === 'en' ? "Try it now..." : language === 'uk' ? "Спробуй це зараз..." : "Попробуй это сейчас...";

  await bot.api.deleteMessage(userId, messageId);
  await bot.api.sendMessage(userId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ 
          text: keyboardText,
          switch_inline_query_chosen_chat: {
            query: "spotify",
            allow_user_chats: true,
            allow_group_chats: true,
          }
        }]
      ]
    }
  })
};

export const spotifyTracks = async (ctx: Context) => {
  const userId = ctx.from!.id;

  const user = await User.findOne({ userId }, 'spotifyAccessToken spotifyRefreshToken spotifyRefreshed')
  if (user) {
    let spotifyAccessToken = user.spotifyAccessToken
    if (!spotifyAccessToken) 
      return ctx.answerInlineQuery([], { ...connectToService(ctx), cache_time: 0 })

    const now = new Date();
    const diffInMillis = now.getTime() - user.spotifyRefreshed!.getTime()
    const fiftyInMillis = 50 * 60 * 1000

    if (diffInMillis > fiftyInMillis) {
      if (user.spotifyRefreshToken) {
        let { data, message } = await spotifyTokenRefresh(user.spotifyRefreshToken, userId)
        if (message === 'ok') spotifyAccessToken = data!.access_token 
      }
    }

    let result = await spotifyInlineTracks(spotifyAccessToken, ctx)
    if (result.length) return ctx.answerInlineQuery(result, { cache_time: 0 })
    return ctx.answerInlineQuery([], {
      button: {
        text: ctx.t('emptyResult'),
        start_parameter: 'info'
      },
      cache_time: 0
    })
  } else {
    ctx.answerInlineQuery([], { ...connectToService(ctx), cache_time: 0 })
  }
}

export const chosenSpotifyTrack = async (ctx: Context) => {
  const chosenResult  = ctx.chosenInlineResult
  const resultId: string[] = chosenResult?.result_id.split('-')!
  const inlineMessageId = chosenResult?.inline_message_id

  if (inlineMessageId) {
    const choosenId = resultId[1]

    try {
      const { data, message, status } = await spotifyDown(choosenId)
      if (status === 200 && data) {
        const { metadata, link } = data
  
        const filePath = join(__dirname, `../../../files/spotify/${metadata.title}.mp3`)

        const songResponse = await axios.get(link, { responseType: 'arraybuffer' });
        const songBuffer = Buffer.from(songResponse.data);
        const coverResponse = await axios.get(metadata.cover, { responseType: 'arraybuffer' });
        const coverBuffer = Buffer.from(coverResponse.data);

        const tags = {
          artist: metadata.artists,
          title: metadata.title,
          album: metadata.album,
          image: {
            mime: "image/jpeg",
            type: {
              id: 3,
              name: "front cover"
            },
            description: "Front Cover",
            imageBuffer: coverBuffer
          },
        }
  
        const successBuffer = NodeID3.write(tags, songBuffer);
        if (successBuffer) {
          await writeFileAsync(filePath, successBuffer);

          let trackLink = `<a href="https://open.spotify.com/track/${choosenId}">Spotify</a>`
          let caption = `${trackLink} | ${ctx.t('chanel')} | ${ctx.t('group')} | ${ctx.t('bot')}`
          let path = `${process.env.SERVER_URI}/files/music/Gravity.mp3`
          let inputMedia = messageInlineMedia(path, caption, ctx.t('try'))
          
          await ctx.api.editMessageMediaInline(inlineMessageId, inputMedia.input, {
            reply_markup: inputMedia.markup
          })
        } else {

        }
      } else {
  
      }
    } catch (error) {
      
    }

    // let trackLink = `<a href="https://open.spotify.com/track/${choosenId}">Spotify</a>`
    // try {
    //   await ctx.api.editMessageMediaInline(inlineMessageId, {
    //     type: 'audio',
    //     media: `${process.env.SERVER_URI}/files/oh-no_jojo.mp3`,
    //     caption: `${trackLink} | ${ctx.t('chanel')} | ${ctx.t('group')} | ${ctx.t('bot')}`,
    //     parse_mode: 'HTML',
    //   }, {
    //     reply_markup: {
    //       inline_keyboard: [ [ { text: ctx.t('try'), url: 'https://t.me/rhytmifybot?start=/start' } ] ]
    //     }
    //   })
    // } catch (error) {
    //   console.error(error);
    // }
  }
}