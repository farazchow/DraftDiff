import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageFlags,
  SendableChannels,
} from "discord.js";

export async function SendTestMessage(channel: SendableChannels) {
  const textMessage = "Testing message <t:1764270092:R>";
  const testButton = new ButtonBuilder()
    .setCustomId("test")
    .setLabel("Test")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(testButton);

  channel
    .send({
      content: textMessage,
      components: [row],
    })
    .then(console.log);
}

export async function HandleTestButton(interaction: ButtonInteraction) {
  await interaction.reply({
    content: `${interaction.customId} Button was pressed`,
    flags: MessageFlags.Ephemeral,
  });
}
