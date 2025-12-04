import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import userModel from "../database/users";

const LEADERBOARD_LIMIT = 5;

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription(`Shows the ${LEADERBOARD_LIMIT} richest users`);

export async function execute(interaction: CommandInteraction) {
    const users = await userModel.find({})
        .sort({currentPoints: "descending"})
        .limit(LEADERBOARD_LIMIT);
    if (!users) {
        interaction.reply({
            content: "Something went wrong. Try again later."
        });
        return;
    }
    const text = `**__The top ${LEADERBOARD_LIMIT} richest users are:__**
    ${users.map((user, i) => (`**${i+1}. ${user.discordName}** *(${user.currentPoints} points)*`)).join(`\n`)}`;
    interaction.reply({
        content: text
    });
}