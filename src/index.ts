import { Activity, Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { deployCommands } from './deploy-commands';
import { commands } from './commands/commands';
import { config } from './config';
// import express from 'express';
import mongoose from "mongoose";
// import bodyParser from "body-parser";
import { CreateBet } from './createBet';
import test from 'node:test';

// MongoDB setup
const MONGO_URI = config.MONGO_URI;

// MongoDB connection
mongoose.connect(MONGO_URI, {
    dbName: "Main"
})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Create Discord Client
const client = new Client({intents: 
    [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
    ]
});

// Log in to Discord with client token
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Client is Ready! Logged is as ${readyClient.user.tag}.`);
    await deployCommands({guildId: config.DISCORD_GUILD_ID});
})


client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;
    if (commands.get(commandName)) {
        try {
            await commands.get(commandName)?.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "Error while executing command",
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
    if (!newPresence) {
        throw new Error("New Presence not given?");
    }
    console.log(newPresence.activities.map(act => act.details));
    const newActivities: Activity[] = newPresence.activities.filter(act => act.details === "Summoner's Rift (Ranked)");
    if (newActivities.length !== 0 && newActivities[0].state === "In Game") {
        //League Ranked game found and started
        const rankedActivity: Activity = newActivities[0];
        console.log(`${newPresence.user?.displayName} is now in a ranked game.`);
        console.log(rankedActivity);
        await CreateBet(Number(newPresence.user?.id));
    }
    
})

client.login(process.env.DISCORD_TOKEN);