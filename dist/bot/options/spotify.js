"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spotifyInlineTracks = void 0;
const grammy_1 = require("grammy");
const requests_1 = require("../../utils/requests");
const spotifyInlineTracks = (token, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let nowPlayingTrack = yield (0, requests_1.nowSpotifyTrack)(token);
    // console.log(nowPlayingTrack.data?.item, '---');
    let limit = nowPlayingTrack.data ? 9 : 10;
    let recentlyPlayingTracks = yield (0, requests_1.recentlySpotifyTracks)(token, limit);
    if (recentlyPlayingTracks.data) {
        let data = (_a = recentlyPlayingTracks.data) === null || _a === void 0 ? void 0 : _a.items.map(val => val.track);
        data = nowPlayingTrack.data ? [nowPlayingTrack.data.item, ...data] : data;
        // console.log(data[1], '===');
        const description = ctx.t('wait');
        const result = data.map((val, index) => {
            let duration = val.duration_ms / 1000;
            let url = `${process.env.SERVER_URI}/files/yes-yes-yes_jojo.mp3`;
            // let url = `${process.env.SERVER_URI}/files/yes-yes-yes_jojo.mp3`;
            return grammy_1.InlineQueryResultBuilder.audio(`spotify-${val.id}-${index}`, val.name, url, {
                audio_duration: parseInt(duration.toString(), 10),
                caption: description,
                performer: val.artists.map(artist => artist.name).join(' | '),
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: ctx.t('process'), callback_data: 'loading' }]]
                },
            });
        });
        return result;
    }
    return [];
});
exports.spotifyInlineTracks = spotifyInlineTracks;
