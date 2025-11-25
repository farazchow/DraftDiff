import dotenv from "dotenv";

dotenv.config();

const { 
    DISCORD_TOKEN, 
    DISCORD_CLIENT_ID, 
    DISCORD_GUILD_ID,
    MONGO_URI,
    RIOT_API_KEY,
} = process.env;

if ( !DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    throw new Error("Missing Environment Variable");
}
if (!DISCORD_GUILD_ID) {
    throw new Error("Missing Dev Server ID");
}
if (!MONGO_URI) {
    throw new Error("Mongo URI not provided.");
}
if (!RIOT_API_KEY) {
    throw new Error("Riot API Key not provided.")
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID,
    MONGO_URI,
    RIOT_API_KEY
};