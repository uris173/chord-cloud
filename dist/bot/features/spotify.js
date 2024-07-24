"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spotifyComposer = void 0;
const grammy_1 = require("grammy");
const composer = new grammy_1.Composer();
exports.spotifyComposer = composer;
const spotify_1 = require("../handlers/spotify");
composer.inlineQuery('spotify', spotify_1.spotifyTracks);
composer.chosenInlineResult(/spotify-/, spotify_1.chosenSpotifyTrack);
