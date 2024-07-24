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
exports.token = exports.url = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isDev = false;
const url = isDev ? process.env.LOCAL_URI : process.env.SERVER_URI;
exports.url = url;
const token = isDev ? process.env.DEV_TOKEN : process.env.TOKEN;
exports.token = token;
const express_1 = __importDefault(require("express"));
const bot_1 = __importDefault(require("./bot/bot"));
const grammy_1 = require("grammy");
const mongoose_1 = require("mongoose");
const path_1 = require("path");
const spotify_1 = require("./routers/spotify");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/files", express_1.default.static((0, path_1.join)(__dirname, "../", "files")));
app.use('/spotify', spotify_1.spotify);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (process.env.NODE_ENV === "DEVELOPMENT")
            bot_1.default.start();
        else
            app.use(`/${bot_1.default.token}`, (0, grammy_1.webhookCallback)(bot_1.default, "express"));
        yield (0, mongoose_1.connect)(process.env.MONGO_URI)
            .then(() => console.log("MongoDB connected succesfuly!"))
            .catch((error) => console.log(error));
        app.listen(process.env.PORT, () => console.log(`Server is running on ${process.env.PORT} PORT`));
    }
    catch (error) {
        console.error(error);
    }
}))();
