import { Bot } from "grammy";
import { Context } from "./context";
import { i18n } from "./i18n";

const bot = new Bot<Context>(process.env.TOKEN!);

bot
.use(i18n)


export default bot