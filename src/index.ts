import {
  Activity,
  Channel,
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands/commands";
import { config } from "./config";
import mongoose from "mongoose";
import { CreateGame } from "./createGame";
import { FindLiveGame, LiveGames } from "./LiveGames";
import { CheckVoice } from "./discord-functions/VoiceWatcher";

const WAITBEFOREPOLL = 10 * 1000;

// MongoDB setup
const MONGO_URI = config.MONGO_URI;

// MongoDB connection
mongoose
  .connect(MONGO_URI, {
    dbName: "Main",
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Create Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

export let mainChannel: Channel | undefined = undefined;

// Deploy commands when client is ready
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Client is Ready! Logged is as ${readyClient.user.tag}.`);
  await deployCommands({ guildId: config.DISCORD_GUILD_ID });

  let channel: Channel | undefined | null = client.channels.cache.get(
    config.CHANNEL_ID
  );
  if (channel === undefined) {
    channel = await client.channels.fetch(config.CHANNEL_ID);
  }
  if (channel?.isSendable()) {
    mainChannel = channel;
  }
});

// User interaction
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
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
  } else if (interaction.isButton()) {
    const game = FindLiveGame(interaction.customId);
    if (game === null) {
      interaction.reply({
        content: "Sorry, couldn't find this game.",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      game.HandleBetButton(interaction);
    }
  } else if (interaction.isModalSubmit()) {
    const game = FindLiveGame(interaction.customId);
    if (game === null) {
      interaction.reply({
        content: "Sorry, couldn't find this game.",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      game.HandleBetModalSubmit(interaction);
    }
  }
});

// Discord User has started a ranked Game
client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
  if (!newPresence) {
    throw new Error("New Presence not given?");
  }
  const newActivities: Activity[] = newPresence.activities.filter(
    (act) => act.details === "Summoner's Rift (Ranked)"
  );

  if (newActivities.length !== 0 && newActivities[0].state === "In Game") {
    //League Ranked game found and started
    console.log(`${newPresence.user?.displayName} is now in a ranked game.`);

    // Make sure we have space to track a game
    if (LiveGames.length >= 10) {
      console.log(
        "Sorry too many games being tracked right now. Try again later."
      );
      return;
    }

    // Check to see if we are already tracking the game
    if (
      LiveGames.filter((game) =>
        game.discordUsers.includes(Number(newPresence.userId))
      ).length !== 0
    ) {
      return;
    }

    // Create the Game
    await setTimeout(
      () => CreateGame(Number(newPresence.user?.id)),
      WAITBEFOREPOLL
    );
  }
});

// Discord User has entered/left voice chats
client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  CheckVoice(oldState, newState);
});

client.login(process.env.DISCORD_TOKEN);
