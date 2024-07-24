"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOut = exports.selectLanguage = exports.changeLanguage = exports.donate = exports.links = exports.tryIt = exports.logIn = exports.start = void 0;
const user_model_1 = require("../../models/user.model");
const i18n_1 = require("../i18n");
const helper_1 = require("../options/helper");
const keyboards_1 = require("../options/keyboards");
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["EN"] = "en";
    LanguageCode["RU"] = "ru";
    LanguageCode["UK"] = "uk";
})(LanguageCode || (LanguageCode = {}));
const start = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (ctx.match === 'info')
        return ctx.reply(ctx.t('emptyTrackInfo'));
    const chatId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    let languageCode = ctx.session.__language_code || 'en';
    const locale = i18n_1.i18n.locales.includes(languageCode) ? languageCode : LanguageCode.EN;
    yield ctx.i18n.renegotiateLocale();
    ctx.api.setMyCommands([
        { command: '/start', description: ctx.t('start') },
        { command: "/login", description: ctx.t('logIn') },
        { command: "/try", description: ctx.t('try') },
        { command: "/links", description: ctx.t('links') },
        { command: "/donate", description: ctx.t('donate') },
        { command: "/language", description: ctx.t('changeLanguage') },
    ], {
        scope: {
            chat_id: chatId,
            type: "chat",
        },
    });
    const user = yield user_model_1.User.findOne({ userId: chatId });
    if (user) {
        if (!user.spotify)
            return (0, exports.logIn)(ctx);
        let platform = user.spotify ? 'spotify' : 'yandex';
        yield ctx.reply(ctx.t('share'), {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: ctx.t('tryIt'),
                            switch_inline_query_chosen_chat: { query: platform, allow_user_chats: true, allow_group_chats: true, }
                        }]
                ]
            }
        });
    }
    else {
        yield ctx.reply(`${ctx.t("selectMenu")}\n\n/start - ${ctx.t('start')}\n/login - ${ctx.t('logIn')}\n/try - ${ctx.t('try')}\n/links - ${ctx.t('links')}\n/donate - ${ctx.t('donate')}\n/language - ${ctx.t('changeLanguage')}`);
        yield user_model_1.User.create({
            userId: chatId,
            name: ctx.from.first_name,
            language: locale,
            languageCode: ctx.from.language_code
        });
    }
});
exports.start = start;
const logIn = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, helper_1.checkUserAuthService)(ctx, ctx.t('alreadyAuthorized'));
});
exports.logIn = logIn;
const tryIt = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, helper_1.checkUserAuthService)(ctx, ctx.t('tryIt'));
});
exports.tryIt = tryIt;
const links = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply(`${ctx.t('botSlogan')}\n${ctx.t('chanelLink')}\n${ctx.t('groupLink')}`, {
        parse_mode: 'HTML'
    });
});
exports.links = links;
const donate = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply(ctx.t('donateWallets'), {
        parse_mode: 'HTML'
    });
});
exports.donate = donate;
const changeLanguage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply(ctx.t('selectLanguage'), {
        reply_markup: keyboards_1.keyboards.languages(ctx)
    });
});
exports.changeLanguage = changeLanguage;
const selectLanguage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const text = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
    const userId = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
    if (text && userId) {
        const language = text === ctx.t('en') ? 'en' : text === ctx.t('uk') ? 'uk' : 'ru';
        if (i18n_1.i18n.locales.includes(language)) {
            yield ctx.i18n.setLocale(language);
            ctx.session.__language_code = language;
            yield user_model_1.User.findOneAndUpdate({ userId }, { $set: { language } });
            yield ctx.api.setMyCommands([
                { command: '/start', description: ctx.t('start') },
                { command: "/login", description: ctx.t('logIn') },
                { command: "/try", description: ctx.t('try') },
                { command: "/links", description: ctx.t('links') },
                { command: "/donate", description: ctx.t('donate') },
                { command: "/language", description: ctx.t('changeLanguage') },
            ], {
                scope: {
                    chat_id: userId,
                    type: "chat",
                },
            });
            ctx.reply(ctx.t('languageChanged'), {
                reply_markup: {
                    remove_keyboard: true
                }
            });
        }
    }
});
exports.selectLanguage = selectLanguage;
const logOut = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield user_model_1.User.findOne({ userId });
    if (user === null || user === void 0 ? void 0 : user.spotify) {
        yield user_model_1.User.findByIdAndUpdate(user._id, { $set: {
                spotify: false,
                spotifyRefreshed: null,
                spotifyAccessToken: null,
                spotifyRefreshToken: null,
                spotifyTokenType: null,
                spotifyExpiresIn: null,
                spotifyScope: null
            } });
    }
    return ctx.reply(ctx.t('logedOut'));
});
exports.logOut = logOut;
