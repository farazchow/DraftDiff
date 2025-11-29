import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { mainChannel } from "..";
export { mainChannel } from "../index";

const timeStamp = Math.floor(Date.now() / 1000) + 1 * 60;

export async function SendTestMessage() {
  if (mainChannel === undefined || !mainChannel.isSendable()) {
    console.error("Main Channel not defined");
    return;
  }
  const textMessage = `Testing message <t:${timeStamp}:R>`;
  const testButton = new ButtonBuilder()
    .setCustomId(timeStamp.toString())
    .setLabel("Test")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(testButton);

  mainChannel.send({
    content: textMessage,
    components: [row],
  });
}

export async function HandleTestButton(interaction: ButtonInteraction) {
  if (Number(interaction.customId) < Date.now() / 1000) {
    interaction.reply({
      content: "Betting Closed!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(interaction.customId)
    .setTitle("Test Modal");

  const amountInput = new TextInputBuilder()
    .setCustomId("betAmount")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("100")
    .setRequired(true)
    .setValue("0")
    .setMaxLength(10);

  const amountLabel = new LabelBuilder()
    .setLabel("How much do you want to bet?")
    .setTextInputComponent(amountInput);

  const betTypeSelector = new StringSelectMenuBuilder()
    .setCustomId("betType")
    .setPlaceholder("Bet Win")
    .setRequired(true)
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("Bet Win").setValue("win"),
      new StringSelectMenuOptionBuilder().setLabel("Bet Loss").setValue("loss")
    );
  const betTypeLabel = new LabelBuilder()
    .setLabel("Bet Win or Bet Loss")
    .setStringSelectMenuComponent(betTypeSelector);
  modal.addLabelComponents(betTypeLabel, amountLabel);

  // await interaction.reply({
  //   content: `${interaction.customId} Button was pressed`,
  //   flags: MessageFlags.Ephemeral,
  // });
  await interaction.showModal(modal);
}

export async function HandleTestModalSubmit(
  interaction: ModalSubmitInteraction
) {
  const text = `${
    interaction.user.displayName
  } chose ${interaction.fields.getStringSelectValues(
    "betType"
  )} and wagered ${interaction.fields.getTextInputValue("betAmount")}`;
  console.log(text);
  await interaction.reply({
    content: text,
    flags: MessageFlags.Ephemeral,
  });
}
