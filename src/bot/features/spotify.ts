import { Composer } from "grammy";
import { Context } from "../context";
const composer = new Composer<Context>()

import { spotifyNowPlay } from "../handlers/spotify";
import { InlineQueryResultAudio } from "grammy/types";

composer.inlineQuery('spotify-', spotifyNowPlay)


export { composer as spotifyComposer }