import path from "path";
import { Context } from "./context";
import { I18n } from "@grammyjs/i18n";

export const i18n = new I18n<Context>({
  defaultLocale: "en",
  directory: path.join(__dirname, "locales"),
  useSession: true,
  fluentBundleOptions: {
    useIsolating: false,
  },
});

export const isMultipleLocales = i18n.locales.length > 1;