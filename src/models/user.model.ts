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

  spotifyRefreshed: Date | null;
  spotifyAccessToken: string | null;
  spotifyRefreshToken: string | null;
  spotifyTokenType: string | null;
  spotifyExpiresIn: number | null;
  spotifyScope: string | null;
}