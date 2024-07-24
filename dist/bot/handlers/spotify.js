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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chosenSpotifyTrack = exports.spotifyTracks = exports.spotifySuccessAuth = void 0;
const bot_1 = __importDefault(require("../bot"));
const path_1 = require("path");
const fs_1 = require("fs");
const util_1 = require("util");
const node_id3_1 = __importDefault(require("node-id3"));
const writeFileAsync = (0, util_1.promisify)(fs_1.writeFile);
const user_model_1 = require("../../models/user.model");
const requests_1 = require("../../utils/requests");
const spotify_1 = require("../options/spotify");
const helper_1 = require("../options/helper");
const axios_1 = __importDefault(require("axios"));
// import { spotifyInlineTracks } from "../options/helpers"
const spotifySuccessAuth = (userId, messageId, language) => __awaiter(void 0, void 0, void 0, function* () {
    const text = language === 'en' ? "Authorization was successful!\n\nType the command /logout to log out." : language === 'uk' ? "Авторизація пройшла успішно!\n\nНапишіть команду /logout, щоб вийти." : "Авторизация прошла успешно!\n\nНапишите комманду /logout чтобы выйти.";
    const keyboardText = language === 'en' ? "Try it now..." : language === 'uk' ? "Спробуй це зараз..." : "Попробуй это сейчас...";
    yield bot_1.default.api.deleteMessage(userId, messageId);
    yield bot_1.default.api.sendMessage(userId, text, {
        reply_markup: {
            inline_keyboard: [
                [{
                        text: keyboardText,
                        switch_inline_query_chosen_chat: {
                            query: "spotify",
                            allow_user_chats: true,
                            allow_group_chats: true,
                        }
                    }]
            ]
        }
    });
});
exports.spotifySuccessAuth = spotifySuccessAuth;
const spotifyTracks = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id;
    const user = yield user_model_1.User.findOne({ userId }, 'spotifyAccessToken spotifyRefreshToken spotifyRefreshed');
    if (user) {
        let spotifyAccessToken = user.spotifyAccessToken;
        if (!spotifyAccessToken)
            return ctx.answerInlineQuery([], Object.assign(Object.assign({}, (0, helper_1.connectToService)(ctx)), { cache_time: 0 }));
        const now = new Date();
        const diffInMillis = now.getTime() - user.spotifyRefreshed.getTime();
        const fiftyInMillis = 50 * 60 * 1000;
        if (diffInMillis > fiftyInMillis) {
            if (user.spotifyRefreshToken) {
                let { data, message } = yield (0, requests_1.spotifyTokenRefresh)(user.spotifyRefreshToken, userId);
                if (message === 'ok')
                    spotifyAccessToken = data.access_token;
            }
        }
        let result = yield (0, spotify_1.spotifyInlineTracks)(spotifyAccessToken, ctx);
        if (result.length)
            return ctx.answerInlineQuery(result, { cache_time: 0 });
        return ctx.answerInlineQuery([], {
            button: {
                text: ctx.t('emptyResult'),
                start_parameter: 'info'
            },
            cache_time: 0
        });
    }
    else {
        ctx.answerInlineQuery([], Object.assign(Object.assign({}, (0, helper_1.connectToService)(ctx)), { cache_time: 0 }));
    }
});
exports.spotifyTracks = spotifyTracks;
const chosenSpotifyTrack = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const chosenResult = ctx.chosenInlineResult;
    const resultId = chosenResult === null || chosenResult === void 0 ? void 0 : chosenResult.result_id.split('-');
    const inlineMessageId = chosenResult === null || chosenResult === void 0 ? void 0 : chosenResult.inline_message_id;
    if (inlineMessageId) {
        const choosenId = resultId[1];
        try {
            const { data, status, error } = yield (0, requests_1.spotifyDown)(choosenId);
            if (status === 200 && data) {
                const { metadata, link } = data;
                const filePath = (0, path_1.join)(__dirname, `../../../files/spotify/${metadata.title}.mp3`);
                const songResponse = yield axios_1.default.get(link, { responseType: 'arraybuffer' });
                const songBuffer = Buffer.from(songResponse.data);
                const coverResponse = yield axios_1.default.get(metadata.cover, { responseType: 'arraybuffer' });
                const coverBuffer = Buffer.from(coverResponse.data);
                const tags = {
                    artist: metadata.artists,
                    title: metadata.title,
                    album: metadata.album,
                    image: {
                        mime: "image/jpeg",
                        type: {
                            id: 3,
                            name: "front cover"
                        },
                        description: "Front Cover",
                        imageBuffer: coverBuffer
                    },
                };
                const successBuffer = node_id3_1.default.write(tags, songBuffer);
                if (successBuffer) {
                    yield writeFileAsync(filePath, successBuffer);
                    let trackLink = `<a href="https://open.spotify.com/track/${choosenId}">Spotify</a>`;
                    let caption = `${trackLink} | ${ctx.t('chanel')} | ${ctx.t('group')} | ${ctx.t('bot')}`;
                    let path = `files/spotify/${metadata.title}.mp3`;
                    // let path = `files/music/Skeletal I - Mourning Repairs.mp3`
                    // let path = `files/music/${metadata.title}.mp3`
                    let inputMedia = (0, helper_1.messageInlineMedia)(encodeURI(path), caption, ctx.t('try'));
                    ctx.api.editMessageMediaInline(inlineMessageId, inputMedia.input, {
                        reply_markup: inputMedia.markup
                    }).then(() => {
                        if ((0, fs_1.existsSync)(path))
                            (0, fs_1.unlinkSync)(path);
                    });
                }
            }
            else {
                let caption = `${ctx.t('trackError')}\n\n${ctx.t('chanel')} | ${ctx.t('group')} | ${ctx.t('bot')}`;
                let path = 'files/oh-no_jojo.mp3';
                let inputMedia = (0, helper_1.messageInlineMedia)(path, caption, ctx.t('try'));
                yield ctx.api.editMessageMediaInline(inlineMessageId, inputMedia.input, {
                    reply_markup: inputMedia.markup
                });
                console.log(error);
            }
        }
        catch (error) {
            let caption = `${ctx.t('trackError')}\n\n${ctx.t('chanel')} | ${ctx.t('group')} | ${ctx.t('bot')}`;
            let path = 'files/oh-no_jojo.mp3';
            let inputMedia = (0, helper_1.messageInlineMedia)(path, caption, ctx.t('try'));
            yield ctx.api.editMessageMediaInline(inlineMessageId, inputMedia.input, {
                reply_markup: inputMedia.markup
            });
            console.error(error);
        }
    }
});
exports.chosenSpotifyTrack = chosenSpotifyTrack;
