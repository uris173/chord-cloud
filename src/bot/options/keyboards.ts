import { InlineKeyboard } from "grammy";

const musicInlineKeyboard = (userId: number, messageId: number) => {
  return new InlineKeyboard()
  .url('Spotify ↗️', `${process.env.LOCAL_URI}/spotify/auth/${userId}/${messageId}`)
}

export const keyboards = {
  'logIn': musicInlineKeyboard
}