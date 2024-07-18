import { Composer } from "grammy";
import { Context } from "../context";
const composer = new Composer<Context>();
import {
  start,
  logIn
} from "../handlers/main";

composer.command('start', start)
composer.command('login', logIn)


export { composer as mainComposer }