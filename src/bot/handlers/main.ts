import { User } from "../../models/user.model";
import { sessionStorage } from "../bot";
import { Context } from "../context";
import { i18n } from "../i18n";
import { checkUserAuthService } from "../options/helper";
import { keyboards } from "../options/keyboards";

enum LanguageCode {
  EN = 'en',
  RU = 'ru',
  UK = 'uk',
}

export const start = async (ctx: Context) => {
  if (ctx.match === 'info') return ctx.reply(ctx.t('emptyTrackInfo'))

  const chatId = ctx.from?.id;
  let languageCode = ctx.session.__language_code || 'en'
  const locale: LanguageCode = i18n.locales.includes(languageCode) ? languageCode as LanguageCode : LanguageCode.EN;
  await ctx.i18n.renegotiateLocale();
  
  ctx.api.setMyCommands([
    { command: '/start', description: ctx.t('start') },
    { command: "/login", description: ctx.t('logIn') },
    { command: "/try", description: ctx.t('try') },
    { command: "/links", description: ctx.t('links') },
    { command: "/donate", description: ctx.t('donate') },
    { command: "/language", description: ctx.t('changeLanguage') },
  ], {
    scope: {
      chat_id: chatId!,
      type: "chat",
    },
  });

  const user = await User.findOne({ userId: chatId })
  
  if (user) {
    if (!user.spotify) return logIn(ctx)
    
    let platform = user.spotify ? 'spotify' : 'yandex'
    await ctx.reply(ctx.t('share'), {
      reply_markup: {
        inline_keyboard: [
          [{
            text: ctx.t('tryIt'),
            switch_inline_query_chosen_chat: { query: platform, allow_user_chats: true, allow_group_chats: true, }
          }]
        ]
      }
    })
  } else {
    await ctx.reply(`${ctx.t("selectMenu")}\n\n/start - ${ctx.t('start')}\n/login - ${ctx.t('logIn')}\n/try - ${ctx.t('try')}\n/links - ${ctx.t('links')}\n/donate - ${ctx.t('donate')}\n/language - ${ctx.t('changeLanguage')}`)
    await User.create({
      userId: chatId,
      name: ctx.from!.first_name,
      language: locale,
      languageCode: ctx.from!.language_code
    });
  }
}

export const logIn = async (ctx: Context) => {
  await checkUserAuthService(ctx, ctx.t('alreadyAuthorized'))
}

export const tryIt = async (ctx: Context) => {
  await checkUserAuthService(ctx, ctx.t('tryIt'))
}

export const links = async (ctx: Context) => {
  ctx.reply(`${ctx.t('botSlogan')}\n${ctx.t('chanelLink')}\n${ctx.t('groupLink')}`, {
    parse_mode: 'HTML'
  })
}

export const donate = async (ctx: Context) => {
  ctx.reply(ctx.t('donateWallets'), {
    parse_mode: 'HTML'
  })
}

export const changeLanguage = async (ctx: Context) => {
  ctx.reply(ctx.t('selectLanguage'), {
    reply_markup: keyboards.languages(ctx)
  })
}

export const selectLanguage = async (ctx: Context) => {
  const text = ctx.message?.text
  const userId = ctx.from?.id
  if (text && userId) {
    const language = text === ctx.t('en') ? 'en' : text === ctx.t('uk') ? 'uk' : 'ru'

    if (i18n.locales.includes(language)) {
      await ctx.i18n.setLocale(language)
      ctx.session.__language_code = language;
      await User.findOneAndUpdate({ userId }, { $set: { language } })

      await ctx.api.setMyCommands([
        { command: '/start', description: ctx.t('start') },
        { command: "/login", description: ctx.t('logIn') },
        { command: "/try", description: ctx.t('try') },
        { command: "/links", description: ctx.t('links') },
        { command: "/donate", description: ctx.t('donate') },
        { command: "/language", description: ctx.t('changeLanguage') },
      ], {
        scope: {
          chat_id: userId!,
          type: "chat",
        },
      });

      ctx.reply(ctx.t('languageChanged'), {
        reply_markup: {
          remove_keyboard: true
        }
      })
    }
  }
}

export const logOut = async (ctx: Context) => {
  let userId = ctx.from?.id!
  const user = await User.findOne({ userId })
  if (user?.spotify) {
    await User.findByIdAndUpdate(user._id, { $set: {
      spotify: false,
      spotifyRefreshed: null,
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      spotifyTokenType: null,
      spotifyExpiresIn: null,
      spotifyScope: null
    } })
  }

  return ctx.reply(ctx.t('logedOut'))
}