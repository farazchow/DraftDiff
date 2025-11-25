import {REST, Routes } from "discord.js";
import { commands } from "./commands/commands";
import { config } from "./config";

// const commandsData = [...commands.values()].map(command => command.data);
const commandsDataJSON = [...commands.values()].map(command => command.data.toJSON())
const rest = new REST({version: "10"}).setToken(config.DISCORD_TOKEN);

type DeployCommandsProp = {
    guildId: string;
};

export async function deployCommands({guildId} : DeployCommandsProp) {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
            {
                body: commandsDataJSON,
            }
        );
        console.log("Successfully reloaded applications (/) commands.");
    } catch (error) {
        console.error(error);
    }
}

// Global Deployment

// (async () => {
//     try {
//         console.log("Attempting global command deployment");
//         await rest.put(
//             Routes.applicationCommands(config.DISCORD_CLIENT_ID), 
//             {body: commandsDataJSON});
//         console.log("Loaded global commands");
//     } catch (error) {
//         console.error(error);
//     }
// })();

// clear global commands
(async () => {
    await rest.put(
    Routes.applicationCommands(config.DISCORD_CLIENT_ID),
    { body: [] }
);
})();