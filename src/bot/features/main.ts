import { Composer } from "grammy";
import { Context } from "../context";
const composer = new Composer<Context>();
import {
  start,
  logIn,
  tryIt,
  links,
  donate,
  changeLanguage,
  selectLanguage
} from "../handlers/main";
import { languageFilter } from "../options/helper";

composer.command('start', start)
composer.command('login', logIn)
composer.command('try', tryIt)
composer.command('links', links)
composer.command('donate', donate)
composer.command('language', changeLanguage)

composer.filter(languageFilter).on(':text', selectLanguage)


export { composer as mainComposer }