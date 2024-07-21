import { Schema, model } from "mongoose";

export const User = model("user", new Schema({
  userId: Number,
  name: String,
  language: String,
  action: String,
  languageCode: String,

  spotify: {
    type: Boolean,
    default: false
  },

  spotifyRefreshed: Date,
  spotifyAccessToken: String,
  spotifyRefreshToken: String,
  spotifyTokenType: String,
  spotifyExpiresIn: Number,
  spotifyScope: String,
}, { timestamps: true }));

export interface UserModel {
  _id: string;
  userId: number;
  name: string;
  language: string;
  action: string;
  languageCode: string;
  createdAt: Date;
  updatedAt: Date;

  spotify: boolean;

  spotifyRefreshed: Date;
  spotifyAccessToken: string;
  spotifyRefreshToken: string;
  spotifyTokenType: string;
  spotifyExpiresIn: number;
  spotifyScope: string;
}