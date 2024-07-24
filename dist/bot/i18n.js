"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMultipleLocales = exports.i18n = void 0;
const path_1 = __importDefault(require("path"));
const i18n_1 = require("@grammyjs/i18n");
exports.i18n = new i18n_1.I18n({
    defaultLocale: "en",
    directory: path_1.default.join(__dirname, "locales"),
    useSession: true,
    fluentBundleOptions: {
        useIsolating: false,
    },
});
exports.isMultipleLocales = exports.i18n.locales.length > 1;
