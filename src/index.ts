import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bot from "./bot/bot";
import { webhookCallback } from "grammy";
import { connect } from "mongoose";
import { join } from "path";

const app = express();
app.use(express.json());
app.use("/files", express.static(join(__dirname, "../", "files")));


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