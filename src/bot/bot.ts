import { Bot } from "grammy";
import { Context } from "./context";
import { i18n } from "./i18n";

import { mainComposer } from "./features/main"
import { spotifyComposer } from "./features/spotify"

const bot = new Bot<Context>(process.env.TOKEN!);

bot
.use(i18n)
.use(mainComposer)
.use(spotifyComposer)


export default bot