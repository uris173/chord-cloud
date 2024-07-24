import { Bot, session, MemorySessionStorage } from "grammy";

import { Context, SessionData } from "./context";
import { i18n } from "./i18n";
import { getSessionKey, useSession } from "./options/helper";
import { mainComposer } from "./features/main"
import { spotifyComposer } from "./features/spotify"
import { token } from "..";

const bot = new Bot<Context>(token!);

const initialSessionData = (): SessionData => ({ });
export const sessionStorage = new MemorySessionStorage<SessionData>()

bot
.use(session({
  initial: initialSessionData,
  getSessionKey,
}))
.use(useSession)
.use(i18n)
.use(mainComposer)
.use(spotifyComposer)


export default bot