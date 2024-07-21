import { Context as DefaultContect, SessionFlavor } from "grammy";
import { I18nFlavor } from "@grammyjs/i18n";

export interface SessionData {
  __language_code?: string;
  userId?: string;
  timestamp?: number;
}

export type Context = DefaultContect & I18nFlavor & SessionFlavor<SessionData>;
