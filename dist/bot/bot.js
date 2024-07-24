"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStorage = void 0;
const grammy_1 = require("grammy");
const i18n_1 = require("./i18n");
const helper_1 = require("./options/helper");
const main_1 = require("./features/main");
const spotify_1 = require("./features/spotify");
const __1 = require("..");
const bot = new grammy_1.Bot(__1.token);
const initialSessionData = () => ({});
exports.sessionStorage = new grammy_1.MemorySessionStorage();
bot
    .use((0, grammy_1.session)({
    initial: initialSessionData,
    getSessionKey: helper_1.getSessionKey,
}))
    .use(helper_1.useSession)
    .use(i18n_1.i18n)
    .use(main_1.mainComposer)
    .use(spotify_1.spotifyComposer);
exports.default = bot;
