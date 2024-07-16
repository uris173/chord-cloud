import { Schema, model } from "mongoose";

export const User = model("user", new Schema({
  userId: Number,
  name: String,
  language: String,
  action: String,
  languageCode: String,
  createdAt: Date,
  updatedAt: Date,

  spotifyAccessToken: String,
  spotifyRefreshToken: String,
  spotifyTokenType: String,
  spotifyExpiresIn: Number,
  spotifyScope: String,
}));

export interface UserModel {
  _id: string;
  userId: number;
  name: string;
  language: string;
  action: string;
  languageCode: string;
  createdAt: Date;
  updatedAt: Date;

  spotifyAccessToken: string;
  spotifyRefreshToken: string;
  spotifyTokenType: string;
  spotifyExpiresIn: number;
  spotifyScope: string;
}