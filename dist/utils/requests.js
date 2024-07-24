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
exports.spotifyDown = exports.recentlySpotifyTracks = exports.nowSpotifyTrack = exports.spotifyTokenRefresh = exports.spotifyAuthCode = void 0;
const user_model_1 = require("../models/user.model");
const axios_1 = __importDefault(require("axios"));
const basicHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: "Basic " + btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`),
};
;
const spotifyApiRequest = (config) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)(config);
        return { data: response.data, status: response.status, message: 'ok' };
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error("RESPONSE", error.response.data);
            console.error("STATUS", error.response.status);
            return {
                status: error.response.status,
                error: {
                    data: error.response.data,
                    message: "Api error"
                },
            };
        }
        else {
            console.error(error);
            return {
                status: 500,
                error: {
                    message: "Server error"
                },
            };
        }
    }
});
const spotifyAuthCode = (code, redirectUri) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        url: "https://accounts.spotify.com/api/token",
        method: "POST",
        data: {
            code: code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        },
        headers: basicHeaders,
        timeout: 2000,
    };
    return spotifyApiRequest(config);
});
exports.spotifyAuthCode = spotifyAuthCode;
const spotifyTokenRefresh = (token, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        url: "https://accounts.spotify.com/api/token",
        method: "POST",
        data: {
            grant_type: "refresh_token",
            refresh_token: token,
        },
        headers: basicHeaders,
        timeout: 2000,
    };
    const response = yield spotifyApiRequest(config);
    if (response.data) {
        yield user_model_1.User.findOneAndUpdate({ userId }, { $set: {
                spotifyRefreshed: Date.now(),
                spotifyAccessToken: response.data.access_token
            } });
    }
    ;
    return response;
});
exports.spotifyTokenRefresh = spotifyTokenRefresh;
const nowSpotifyTrack = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        method: 'GET',
        params: { 'limit': 1 },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    return yield spotifyApiRequest(config);
});
exports.nowSpotifyTrack = nowSpotifyTrack;
const recentlySpotifyTracks = (token, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        url: 'https://api.spotify.com/v1/me/player/recently-played',
        method: 'GET',
        params: { 'limit': limit },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    return yield spotifyApiRequest(config);
});
exports.recentlySpotifyTracks = recentlySpotifyTracks;
const spotifyDown = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        url: `https://api.spotifydown.com/download/${id}`,
        method: 'GET',
        headers: {
            Origin: "https://spotifydown.com",
            Referer: "https://spotifydown.com"
        }
    };
    return yield spotifyApiRequest(config);
});
exports.spotifyDown = spotifyDown;
