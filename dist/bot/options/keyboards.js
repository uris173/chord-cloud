"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyboards = void 0;
const grammy_1 = require("grammy");
const __1 = require("../..");
const musicInlineKeyboard = (userId, messageId) => {
    return new grammy_1.InlineKeyboard()
        .url('Spotify ↗️', `${__1.url}/spotify/auth/${userId}/${messageId}`);
};
const languagesKeyboard = (ctx) => {
    return new grammy_1.Keyboard()
        .text(ctx.t('en')).text(ctx.t('uk')).text(ctx.t('ru'))
        .row()
        .text(ctx.t('back'))
        .resized(true);
};
exports.keyboards = {
    'logIn': musicInlineKeyboard,
    'languages': languagesKeyboard
};
