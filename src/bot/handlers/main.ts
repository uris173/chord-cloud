import { User } from "../../models/user.model";
import { Context } from "../context";
import { i18n } from "../i18n";
import { keyboards } from "../options/keyboards";

enum LanguageCode {
  EN = 'en',
  RU = 'ru',
  UK = 'uk',
}

export const start = async (ctx: Context) => {
  const chatId = ctx.from?.id;
  const languageCode = ctx.from!.language_code || 'en';
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
    language_code: locale
  });

  const user = await User.findOne({ userId: chatId })
  await ctx.reply(`${ctx.t("chooseMenu")}\n\n/start - ${ctx.t('start')}\n/login - ${ctx.t('logIn')}\n/try - ${ctx.t('try')}\n/links - ${ctx.t('links')}\n/donate - ${ctx.t('donate')}\n/language - ${ctx.t('changeLanguage')}`)

  if (user) {
    let platform = user.spotify ? 'spotify-' : 'yandex-'
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
    await User.create({
      userId: chatId,
      name: ctx.from!.first_name,
      language: locale,
      languageCode: ctx.from!.language_code
    });
  }
}

export const logIn = async (ctx: Context) => {
  const chatId = ctx.from!.id
  const messageId = ctx.message!.message_id

  ctx.reply(ctx.t('linkAccountService'), {
    reply_markup: keyboards['logIn'](chatId, messageId + 1)
  })
}