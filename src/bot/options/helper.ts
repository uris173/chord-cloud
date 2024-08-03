import { InputFile, NextFunction } from "grammy";
import { InlineKeyboardMarkup, InputMediaAudio } from '@grammyjs/types';
import { User } from "../../models/user.model";
import { Context, SessionData } from "../context";
import { keyboards } from "./keyboards";
import { i18n } from "../i18n";

interface MessageInlineMedia {
  input: InputMediaAudio<InputFile>;
  markup: InlineKeyboardMarkup;
}

export const languageFilter = (ctx: Context) => [ctx.t('en'), ctx.t('uk'), ctx.t('ru')].includes(ctx.message?.text!)

export const connectToService = (ctx: Context) => {
  return {
    button: {
      text: ctx.t('connectService'),
      start_parameter: 'start'
    }
  }
}

export const checkUserAuthService = async (ctx: Context, text: string) => {
  const chatId = ctx.from!.id
  const messageId = ctx.message!.message_id

  const user = await User.findOne({ userId: chatId })

  if (user) {
    if (user.spotify) {
      let service = user.spotify ? 'spotify' : 'yandex'
      return ctx.reply(text, {
        reply_markup: {
          inline_keyboard: [
            [{
              text: ctx.t('share'),
              switch_inline_query_chosen_chat: {
                query: "spotify",
                allow_user_chats: true,
                allow_group_chats: true,
              }
            }]
          ]
        }
      })
    }

    else return ctx.reply(ctx.t('linkAccountService'), {
      reply_markup: keyboards['logIn'](chatId, messageId + 1)
    })
  } else {
    ctx.reply(ctx.t('linkAccountService'), {
      reply_markup: keyboards['logIn'](chatId, messageId + 1)
    })
  }
}

export const initialSession = async (ctx: Context): Promise<SessionData> => {
  const userId = ctx.from?.id.toString();
  const findUser = await User.findOne({ userId });
  if (findUser) {
    return {
      userId,
      __language_code: findUser.language!,
      timestamp: Date.now()
    };
  }

  return {
    userId,
    __language_code: i18n.locales.includes(ctx.from?.language_code!) ? ctx.from?.language_code : 'en',
    timestamp: Date.now()
  };
}

export const getSessionKey = (ctx: Omit<Context, "session">): string | undefined => ctx.from?.id.toString();

export const useSession = async (ctx: Context, next: NextFunction) => {
  if (ctx.from) {
    const sessionKey = getSessionKey(ctx);
    if (sessionKey && !ctx.session?.userId) {
      ctx.session = await initialSession(ctx);
    }
  }
  await next();
}

export const messageInlineMedia = (media: string, caption: string, tryText: string): MessageInlineMedia => {
  const inputMedia: InputMediaAudio<InputFile > = {
    type: 'audio',
    // media: `https://chatapi.of-astora.uz/${media}`,
    media: `${process.env.SERVER_URI}/${media}`,
    caption,
    parse_mode: 'HTML',
  };

  const markup: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: tryText, url: 'https://t.me/ChordCloudBot?start=/start' }
      ]
    ]
  };

  return { input: inputMedia, markup };
}
