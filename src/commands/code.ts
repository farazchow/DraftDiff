import { SlashCommandBuilder, CommandInteraction, hyperlink } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('code')
    .setDescription('Replies with the bot\'s github link!');

export async function execute(interaction: CommandInteraction) {
        await interaction.reply(hyperlink("CODE", 'https://github.com/farazchow/DraftDiff'));
    }