import { ButtonInteraction, LabelBuilder, MessageFlags, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import stockModel from "../database/stocks";
import userModel, { IUser } from "../database/users";
import { TransferPoints } from "../database/dbFunctions";

const UPDATE_INTERVAL = 120 * 60 * 1000;

class StockMarket {
    ESTC: Stock = {
        name: "East Shuriman Trading Company",
        ticker: "ESTC",
        description: "With your financial support, Shurima will once again stretch to the horizon.",
        value: 50,
    };
    TEN: Stock = {
        name: "Tencent Holdings",
        ticker: "TEN",
        description: 'Owns Riot Games. Sometimes they also make other games.',
        value: 80,
    };
    PHF: Stock = {
        name: "Prismatic Hedge Fund LLC",
        ticker: "PHF",
        description: "Rolling down right now, but will be back to max interest soon. Never punished.",
        value: 1000,
    };
    MIT: Stock = {
        name: "Stud TeaDo",
        ticker: "MIT",
        description: "Home to many despondent and hungry students.",
        value: 15,
    };
    intervalID: NodeJS.Timeout;

    constructor() {
        // Check last logged price
        this.reconstructMarket();

        this.intervalID = setInterval(() => {
            this.updateAndLogStocks();
        }, UPDATE_INTERVAL);
    }

    async updateESTC() {
        const newValue = this.ESTC.value + (Math.random() > .5 ? 5 : -5);
        this.ESTC.value = newValue;
    }
    async updateTEN() {
        const newValue = this.TEN.value + (Math.random() > .5 ? 5 : -5);
        this.TEN.value = newValue;
    }
    async updatePHF() {
        const newValue = this.PHF.value + (Math.random() > .5 ? 5 : -5);
        this.PHF.value = newValue;
    }
    async updateMIT() {
        const newValue = this.MIT.value + (Math.random() > .5 ? 5 : -5);
        this.MIT.value = newValue;
    }

    async reconstructMarket() {
        const lastLoggedValues = await stockModel.findOne();
        if (lastLoggedValues) {
            this.ESTC.value = lastLoggedValues.ESTC;
            this.MIT.value = lastLoggedValues.MIT;
            this.TEN.value = lastLoggedValues.TEN;
            this.PHF.value = lastLoggedValues.PHF;
        }
    }

    async updateAndLogStocks() {
        this.updateESTC();
        this.updateTEN();
        this.updatePHF();
        this.updateMIT();
        await stockModel.create({
            ESTC: this.ESTC.value,
            TEN: this.TEN.value,
            PHF: this.PHF.value,
            MIT: this.MIT.value,
        });
    }

    GenerateStockMessage(user: IUser) {
        const points = user.currentPoints;
        const ESTCowned =  user.stocks.get(this.ESTC.ticker) ?? 0;
        const TENowned =  user.stocks.get(this.TEN.ticker) ?? 0;
        const PHFowned =  user.stocks.get(this.PHF.ticker) ?? 0;
        const MITowned =  user.stocks.get(this.MIT.ticker) ?? 0;

        const stockEmbed = {
            color: 0x00abff,
            title: 'DraftDiff Stock Market',
            description: `You currently have **${points} points**.`,
            fields: [
                {
                    name: this.ESTC.name,
                    value: `
                        ${this.ESTC.description}
                        Value: ${this.ESTC.value}
                        Owned: ${ESTCowned}
                        Worth: ${ESTCowned * this.ESTC.value}
                    `,
                    inline: true
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true
                },
                {
                    name: this.TEN.name,
                    value: `
                        ${this.TEN.description}
                        Value: ${this.TEN.value}
                        Owned: ${TENowned}
                        Worth: ${TENowned * this.TEN.value}
                    `,
                    inline: true
                },
                {
                    name: this.PHF.name,
                    value: `
                        ${this.PHF.description}
                        Value: ${this.PHF.value}
                        Owned: ${PHFowned}
                        Worth: ${PHFowned * this.PHF.value}
                    `,
                    inline: true
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true
                },
                {
                    name: this.MIT.name,
                    value: `
                        ${this.MIT.description}
                        Value: ${this.MIT.value}
                        Owned: ${MITowned}
                        Worth: ${MITowned * this.MIT.value}
                    `,
                    inline: true
                }
            ]
        }

        return stockEmbed;
    }

    async HandleBuyButton(interaction: ButtonInteraction) {
        const modal = new ModalBuilder()
            .setCustomId("invest")
            .setTitle("DraftDiff Stock Broker");

        const chooseStockMenu = new StringSelectMenuBuilder()
            .setCustomId("stockSelect")
            .setRequired(true)
            .setMaxValues(1)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(this.ESTC.name)
                    .setDescription(`Currently at ${this.ESTC.value} points per share`)
                    .setValue(this.ESTC.ticker),
                new StringSelectMenuOptionBuilder()
                    .setLabel(this.TEN.name)
                    .setDescription(`Currently at ${this.TEN.value} points per share`)
                    .setValue(this.TEN.ticker),
                new StringSelectMenuOptionBuilder()
                    .setLabel(this.PHF.name)
                    .setDescription(`Currently at ${this.PHF.value} points per share`)
                    .setValue(this.PHF.ticker),
                new StringSelectMenuOptionBuilder()
                    .setLabel(this.MIT.name)
                    .setDescription(`Currently at ${this.MIT.value} points per share`)
                    .setValue(this.MIT.ticker),
            );
        const stockLabel = new LabelBuilder()
            .setLabel("What stock do you want to buy?")
            .setStringSelectMenuComponent(chooseStockMenu);

        const amountInput = new TextInputBuilder()
            .setCustomId("sharesAmount")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue("0")
            .setMaxLength(10)
            .setMinLength(1);
        const amountLabel = new LabelBuilder()
            .setLabel("How many shares do you want to buy?")
            .setTextInputComponent(amountInput);

        modal.addLabelComponents(stockLabel, amountLabel);

        await interaction.showModal(modal);
    }

    async HandleSellButton(interaction: ButtonInteraction) {
        const modal = new ModalBuilder()
            .setCustomId("divest")
            .setTitle("DraftDiff Stock Broker");

        const chooseStockMenu = new StringSelectMenuBuilder()
            .setCustomId("stockSelect")
            .setRequired(true)
            .setMaxValues(1)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(this.ESTC.name)
                    .setDescription(`Currently at ${this.ESTC.value} points per share`)
                    .setValue(this.ESTC.ticker),
                new StringSelectMenuOptionBuilder()
                    .setLabel(this.TEN.name)
                    .setDescription(`Currently at ${this.TEN.value} points per share`)
                    .setValue(this.TEN.ticker),
                new StringSelectMenuOptionBuilder()
                    .setLabel(this.PHF.name)
                    .setDescription(`Currently at ${this.PHF.value} points per share`)
                    .setValue(this.PHF.ticker),
                new StringSelectMenuOptionBuilder()
                    .setLabel(this.MIT.name)
                    .setDescription(`Currently at ${this.MIT.value} points per share`)
                    .setValue(this.MIT.ticker),
            );
        const stockLabel = new LabelBuilder()
            .setLabel("What stock do you want to sell?")
            .setStringSelectMenuComponent(chooseStockMenu);

        const amountInput = new TextInputBuilder()
            .setCustomId("sharesAmount")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue("0")
            .setMaxLength(10)
            .setMinLength(1);
        const amountLabel = new LabelBuilder()
            .setLabel("How many shares do you want to sell?")
            .setTextInputComponent(amountInput);

        modal.addLabelComponents(stockLabel, amountLabel);

        await interaction.showModal(modal);
    }

    async HandleInvestModal(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        const userID = Number(interaction.user.id);
        const user = await userModel.findById(userID);
        if (!user) {
            interaction.editReply("Something went wrong. Try again later");
            return;
        }
        const sharesAmount = Math.floor(Number(interaction.fields.getTextInputValue("sharesAmount")));
        if (isNaN(sharesAmount) || sharesAmount <= 0) {
            interaction.followUp("Invalid number of shares input.");
            return;
        }

        const selectedTicker = interaction.fields.getStringSelectValues("stockSelect")[0];
        const selectedStock = [this.ESTC, this.MIT, this.TEN, this.PHF].filter((s) => s.ticker === selectedTicker)[0];

        if (selectedStock.value === 0) {
            interaction.followUp("Buying stocks at 0 is not allowed!");
            return;
        }
        if (sharesAmount * selectedStock.value > user.currentPoints) {
            interaction.followUp("Not enough points for that");
            return;
        }

        const alreadyOwnedAmount = user.stocks.get(selectedStock.ticker) ?? 0;
        user.stocks.set(selectedStock.ticker, alreadyOwnedAmount + sharesAmount);
        await user.save();
        await TransferPoints(user._id, undefined, sharesAmount * selectedStock.value, `Buying ${sharesAmount} shares of ${selectedStock.ticker}`);
        await interaction.followUp("Succesfully invested!");
    }

    async HandleDivestModal(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        // Validate Inputs
        const userID = Number(interaction.user.id);
        const user = await userModel.findById(userID);
        if (!user) {
            interaction.editReply("Something went wrong. Try again later");
            return;
        }
        const sharesAmount = Math.floor(Number(interaction.fields.getTextInputValue("sharesAmount")));
        if (isNaN(sharesAmount) || sharesAmount <= 0) {
            interaction.followUp("Invalid number of shares input.");
            return;
        }
        const selectedTicker = interaction.fields.getStringSelectValues("stockSelect")[0];
        const selectedStock = [this.ESTC, this.MIT, this.TEN, this.PHF].filter((s) => s.ticker === selectedTicker)[0];
        const alreadyOwnedAmount = user.stocks.get(selectedStock.ticker) ?? 0;
        if (alreadyOwnedAmount < sharesAmount) {
            interaction.followUp("You don't have enough shares to sell!");
            return;
        }

        user.stocks.set(selectedStock.ticker, alreadyOwnedAmount - sharesAmount);
        await user.save();
        await TransferPoints(undefined, user._id, sharesAmount * selectedStock.value, `Selling ${sharesAmount} shares of ${selectedStock.ticker}`);
        await interaction.followUp("Succesfully divested!");
    }
}

export type Stock = {
    name: string;
    ticker: string;
    description: string;
    value: number;
}

export const stockMarket = new StockMarket();