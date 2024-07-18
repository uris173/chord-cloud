import bot from "../bot"
import { Context } from "../context"

import { User, UserModel } from "../../models/user.model"
import { spotifyTokenRefresh } from "../../utils/requests"
import { spotifyInlineTracks } from "../options/spotify";
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
            query: "spotify-",
            allow_user_chats: true,
            allow_group_chats: true,
          }
        }]
      ]
    }
  })
};

export const spotifyNowPlay = async (ctx: Context) => {
  const userId = ctx.from!.id;

  const user = await User.findOne({ userId }, 'spotifyAccessToken spotifyRefreshToken updatedAt')
  if (user) {
    let spotifyAccessToken: string = user.spotifyAccessToken || ''
    const now = new Date()
    const diffInMillis = now.getTime() - user.updatedAt.getTime()
    const fiftyInMillis = 50 * 60 * 1000

    if (diffInMillis > fiftyInMillis) {
      if (user.spotifyRefreshToken) {
        let { data, message } = await spotifyTokenRefresh(user.spotifyRefreshToken, userId)
        if (message === 'ok') spotifyAccessToken = data!.access_token 
      }
    }

    let result = await spotifyInlineTracks(spotifyAccessToken, ctx)
    console.log(result.length);
    
    // try {
    //   ctx.answerInlineQuery(result)
    // } catch (error) {
    //   console.error(error);
    // }
  }
}

export const choosenSpotifyTrack = async (ctx: Context) => {

}