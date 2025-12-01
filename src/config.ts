import dotenv from "dotenv";
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env${env === 'development' ? '' : '.' + env}`);

console.log(`Starting in ${env} mode.`);
dotenv.config({path: envPath});

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  MONGO_URI,
  RIOT_API_KEY,
  CHANNEL_ID,
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing Environment Variable");
}
if (!DISCORD_GUILD_ID) {
  throw new Error("Missing Dev Server ID");
}
if (!MONGO_URI) {
  throw new Error("Mongo URI not provided.");
}
if (!RIOT_API_KEY) {
  throw new Error("Riot API Key not provided.");
}
if (!CHANNEL_ID) {
  throw new Error("Channel ID not specified.");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  MONGO_URI,
  RIOT_API_KEY,
  CHANNEL_ID,
};
