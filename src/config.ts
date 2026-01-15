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
  FINNHUB_KEY,
  CHANNEL_ID,
  ADMIN_ID
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing Discord ENV Variables"); 
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
if (!ADMIN_ID) {
  throw new Error("Admin ID not set.");
}
if (!FINNHUB_KEY) {
  throw new Error("Alpha Vantage Key not set");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  MONGO_URI,
  RIOT_API_KEY,
  CHANNEL_ID,
  ADMIN_ID,
  FINNHUB_KEY
};
