import { InlineKeyboard, Keyboard } from "grammy";
import { Context } from "../context";

const musicInlineKeyboard = (userId: number, messageId: number) => {
  return new InlineKeyboard()
  .url('Spotify ↗️', `${process.env.LOCAL_URI}/spotify/auth/${userId}/${messageId}`)
}

const languagesKeyboard = (ctx: Context) => {
  return new Keyboard()
  .text(ctx.t('en')).text(ctx.t('uk')).text(ctx.t('ru'))
  .row()
  .text(ctx.t('back'))
  .resized(true)
}


export const keyboards = {
  'logIn': musicInlineKeyboard,
  'languages': languagesKeyboard
}