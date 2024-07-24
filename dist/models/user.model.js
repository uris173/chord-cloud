"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
exports.User = (0, mongoose_1.model)("user", new mongoose_1.Schema({
    userId: Number,
    name: String,
    language: String,
    action: String,
    languageCode: String,
    spotify: {
        type: Boolean,
        default: false
    },
    spotifyRefreshed: {
        type: Date,
        default: null
    },
    spotifyAccessToken: {
        type: String,
        default: null
    },
    spotifyRefreshToken: {
        type: String,
        default: null
    },
    spotifyTokenType: {
        type: String,
        default: null
    },
    spotifyExpiresIn: {
        type: Number,
        default: null
    },
    spotifyScope: {
        type: String,
        default: null
    },
}, { timestamps: true }));
