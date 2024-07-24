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
exports.messageInlineMedia = exports.useSession = exports.getSessionKey = exports.initialSession = exports.checkUserAuthService = exports.connectToService = exports.languageFilter = void 0;
const user_model_1 = require("../../models/user.model");
const keyboards_1 = require("./keyboards");
const i18n_1 = require("../i18n");
const languageFilter = (ctx) => { var _a; return [ctx.t('en'), ctx.t('uk'), ctx.t('ru')].includes((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text); };
exports.languageFilter = languageFilter;
const connectToService = (ctx) => {
    return {
        button: {
            text: ctx.t('connectService'),
            start_parameter: 'start'
        }
    };
};
exports.connectToService = connectToService;
const checkUserAuthService = (ctx, text) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = ctx.from.id;
    const messageId = ctx.message.message_id;
    const user = yield user_model_1.User.findOne({ userId: chatId });
    if (user) {
        if (user.spotify) {
            let service = user.spotify ? 'spotify' : 'yandex';
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
            });
        }
        else
            return ctx.reply(ctx.t('linkAccountService'), {
                reply_markup: keyboards_1.keyboards['logIn'](chatId, messageId + 1)
            });
    }
    else {
        ctx.reply(ctx.t('linkAccountService'), {
            reply_markup: keyboards_1.keyboards['logIn'](chatId, messageId + 1)
        });
    }
});
exports.checkUserAuthService = checkUserAuthService;
const initialSession = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString();
    const findUser = yield user_model_1.User.findOne({ userId });
    if (findUser) {
        return {
            userId,
            __language_code: findUser.language,
            timestamp: Date.now()
        };
    }
    return {
        userId,
        __language_code: i18n_1.i18n.locales.includes((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.language_code) ? (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.language_code : 'en',
        timestamp: Date.now()
    };
});
exports.initialSession = initialSession;
const getSessionKey = (ctx) => { var _a; return (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString(); };
exports.getSessionKey = getSessionKey;
const useSession = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (ctx.from) {
        const sessionKey = (0, exports.getSessionKey)(ctx);
        if (sessionKey && !((_a = ctx.session) === null || _a === void 0 ? void 0 : _a.userId)) {
            ctx.session = yield (0, exports.initialSession)(ctx);
        }
    }
    yield next();
});
exports.useSession = useSession;
const messageInlineMedia = (media, caption, tryText) => {
    const inputMedia = {
        type: 'audio',
        media: `${process.env.SERVER_URI}/${media}`,
        caption,
        parse_mode: 'HTML',
    };
    const markup = {
        inline_keyboard: [
            [
                { text: tryText, url: 'https://t.me/ChordCloudBot?start=/start' }
            ]
        ]
    };
    return { input: inputMedia, markup };
};
exports.messageInlineMedia = messageInlineMedia;
