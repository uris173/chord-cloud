import { Context as DefaultContect, SessionFlavor } from "grammy";
import { I18nFlavor } from "@grammyjs/i18n";

interface SessionData {
  __language_code?: string;
  spotify: string;
}

export type Context = DefaultContect & I18nFlavor; // SessionFlavor<SessionData> &
