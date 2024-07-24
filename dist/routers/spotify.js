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
exports.spotify = void 0;
const user_model_1 = require("../models/user.model");
const querystring_1 = require("querystring");
const express_1 = require("express");
const requests_1 = require("../utils/requests");
const spotify_1 = require("../bot/handlers/spotify");
const __1 = require("..");
const redirectUri = `${__1.url}/spotify/auth-code`;
const router = (0, express_1.Router)();
exports.spotify = router;
router.get('/auth/:userId/:messageId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messageId } = req.params;
    res.redirect('https://accounts.spotify.com/authorize?' +
        (0, querystring_1.stringify)({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: 'user-read-currently-playing user-read-recently-played user-modify-playback-state',
            redirect_uri: redirectUri,
            state: `${userId}-${messageId}`
        }));
}));
router.get('/auth-code', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let { code, error, state } = req.query;
    if (error)
        return res.status(400).json({ message: error });
    if (state === null)
        return res.status(400).json({ message: 'State mismatch' });
    let response = yield (0, requests_1.spotifyAuthCode)(code.toString(), redirectUri);
    if (response.message !== 'ok')
        return res.status(response.status).json({
            status: response.status,
            error: (_a = response.error) === null || _a === void 0 ? void 0 : _a.message
        });
    state = state.toString().split('-');
    let userId = parseInt(state[0]);
    let messageId = parseInt(state[1]);
    if (response.data) {
        const { access_token, expires_in, refresh_token, scope, token_type } = response.data;
        yield user_model_1.User.findOneAndUpdate({ userId }, {
            $set: {
                spotify: true,
                spotifyRefreshed: Date.now(),
                spotifyAccessToken: access_token,
                spotifyExpiresIn: expires_in,
                spotifyRefreshToken: refresh_token,
                spotifyScope: scope,
                spotifyTokenType: token_type
            }
        });
        const user = yield user_model_1.User.findOne({ userId });
        if (user)
            yield (0, spotify_1.spotifySuccessAuth)(userId, messageId, user.language);
        res.status(200).json({ message: 'Auth success' });
    }
    else {
        res.status(500).json({ message: 'Unknown error!' });
    }
}));
