import bot from "../bot"
import { Context } from "../context"

import { User, UserModel } from "../../models/user.model"
import { spotifyTokenRefresh } from "../../utils/requests"
import { spotifyInlineTracks } from "../options/spotify";
import { connectToService } from "../options/helper";
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
    let trackLink = `<a href="https://open.spotify.com/track/${resultId[1]}">Spotify</a>`
    try {
      await ctx.api.editMessageMediaInline(inlineMessageId, {
        type: 'audio',
        media: `https://chatapi.of-astora.uz/files/music/Yen.mp3`,
        caption: `${trackLink} | ${ctx.t('chanel')} | ${ctx.t('group')} | ${ctx.t('bot')}`,
        parse_mode: 'HTML',
      }, {
        reply_markup: {
          inline_keyboard: [[{ text: ctx.t('try'), url: 'https://t.me/rhytmifybot?start=/start' }]]
        }
      })
    } catch (error) {
      console.error(error);
    }
  }
}