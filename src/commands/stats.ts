import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Replies with your stats!');

export async function execute(interaction: CommandInteraction) {
        const text = `${interaction.user.displayName} has ${100} coins.`;
        await interaction.reply(text);
    }