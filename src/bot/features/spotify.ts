import { Composer } from "grammy";
import { Context } from "../context";
const composer = new Composer<Context>()

import { spotifyTracks, chosenSpotifyTrack } from "../handlers/spotify";

composer.inlineQuery('spotify', spotifyTracks)
composer.chosenInlineResult(/spotify-/, chosenSpotifyTrack)


export { composer as spotifyComposer }