import { ChatInputCommandInteraction, CommandInteraction, ContainerBuilder, MessageFlags, SlashCommandBuilder, userMention } from "discord.js";
import userModel from "../database/users";
import { TransferPoints } from "../database/dbFunctions";

export const data = new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Send points to another user")
    .addUserOption((option) => 
        option
            .setName("receiver")
            .setDescription("The person who will receive points")
            .setRequired(true)
    )
    .addIntegerOption((option) => 
        option
            .setName("amount")
            .setDescription("How many points to send").
            setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    try {
        if (!(interaction instanceof ChatInputCommandInteraction)) {
            interaction.editReply(
              "Something went wrong while trying to send points. Sorry!"
            );
            return;
        }
        const userID = Number(interaction.user.id);
        const sender = await userModel.findById(userID);
        const receiverID = interaction.options.getUser("receiver")?.id;
        const receiver = await userModel.findById(Number(receiverID));
        const amount = Math.floor(Number(interaction.options.getInteger("amount")));
          
        if (!sender) {
            interaction.editReply({
                content: "You aren't registered with DraftDiff. Do /register to start!", 
            });
            return;
        }
        if (!receiver) {
            interaction.editReply({
                content: "The receiver isn't registered with DraftDiff. Try again later.", 
            });
            return;
        }
        if (isNaN(amount) || amount <= 0 || amount > sender.currentPoints) {
            interaction.editReply({
                content: "Invalid number of points. Try again later."
            });
            return;
        }

        const messageContainer = new ContainerBuilder()
            .setAccentColor(0x00ff00)
            .addTextDisplayComponents((textDisplay) => textDisplay.setContent(
                `💰 Succesfully transfered ${amount} points to ${userMention(receiverID!)} 💰`
            ));

        // Finished validating
        TransferPoints(sender._id, receiver._id, amount, "Payment");
        interaction.editReply({
            components: [messageContainer],
            flags: MessageFlags.IsComponentsV2
        })

    } catch (error) {
        interaction.editReply(`Sorry something went wrong. Try again later!`);
        console.error(error);
    }
}
    