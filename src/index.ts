import dotenv from "dotenv";
dotenv.config();

const isDev = true
const url = isDev ? process.env.LOCAL_URI : process.env.SERVER_URI
const token = isDev ? process.env.DEV_TOKEN : process.env.TOKEN
export { url, token }

import express from "express";
import bot from "./bot/bot";
import { webhookCallback } from "grammy";
import { connect } from "mongoose";
import { join } from "path";
import { spotify } from './routers/spotify';

const app = express();
app.use(express.json());
app.use("/files", express.static(join(__dirname, "../", "files")));
app.use('/spotify', spotify);

(async () => {
  try {
    if (process.env.NODE_ENV === "DEVELOPMENT") bot.start();
    else app.use(`/${bot.token}`, webhookCallback(bot, "express"));

    await connect(process.env.MONGO_URI!)
    .then(() => console.log("MongoDB connected succesfuly!"))
    .catch((error) => console.log(error));
    
    app.listen(process.env.PORT!, () =>
      console.log(`Server is running on ${process.env.PORT!} PORT`)
    );
  } catch (error) {
    console.error(error);
  }
})()