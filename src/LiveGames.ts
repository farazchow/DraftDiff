import { getLiveGame, getFinishedGame } from "./RiotFunctions";
import predictionsModel from "./database/predictions";
import gameMatchModel from "./database/game_matches";
import { TransferPoints } from "./database/dbFunctions";
import {
  ActionRowBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  LabelBuilder,
  Message,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { EditMessage, ReplyTo, SendMessage } from "./discord-functions/SendMessage";
import userModel from "./database/users";

const POLLING_RATE = 15 * 1000;

export let LiveGames: LiveGame[] = [];

export class LiveGame {
  gameId: number;
  riotIds: string[] = [];
  discordUsers: number[] = [];

  betting: boolean;
  unixTimeStamp: string;
  bets: Bets[] = [];
  timeOutID: NodeJS.Timeout;

  intervalID: NodeJS.Timeout | undefined;
  message: Message | undefined;

  constructor(gameId: number, bettingTimeInMinutes: number = 5) {
    this.gameId = gameId;
    this.betting = true;
    this.unixTimeStamp = (
      Math.floor(Date.now() / 1000) +
      bettingTimeInMinutes * 60
    ).toString();

    this.timeOutID = setTimeout(async () => {
      this.betting = false;
      this.intervalID = setInterval(() => {
        this.ResolveGame();
      }, POLLING_RATE);
    }, bettingTimeInMinutes * 60 * 1000);
  }

  async AddBet(userID: number, predicted_win: boolean, pointsBet: number) {
    if (this.betting) {
      this.bets.push(new Bets(userID, predicted_win, pointsBet));
      TransferPoints(userID, undefined, pointsBet, `Bet on NA1_${this.gameId}`);
      await this.SendBetMessage();
    } else {
      console.error(`Betting window for game ${this.gameId} is closed.`);
    }
  }

  // Returns False if game is ongoing, True if resolved appropriately
  async ResolveGame(): Promise<boolean> {
    if (this.intervalID && this.riotIds.length !== 0) {
      // If game is ongoing
      const liveData = await getLiveGame(this.riotIds[0].toString());
      if (liveData) {
        return false;
      }

      // Game has finished
      const finishedGame = await getFinishedGame(this.gameId.toString());
      if (finishedGame) {
        // Find result
        let result = "Loss";
        result = finishedGame.info.gameDuration < 5 * 60 ? "Remake" : result;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const participantDTOs = (finishedGame.info.participants as Array<any>).filter((p: any) => this.riotIds.includes(p.puuid));
        if (!participantDTOs || participantDTOs.length !== this.riotIds.length) {
          console.error(finishedGame.info.participants);
          console.error(participantDTOs);
          console.error(participantDTOs.length, this.riotIds.length);
          console.error(`No eligible participants found: NA1_${this.gameId}`);
          return false;
        }
        result = participantDTOs[0].win ? "Win" : result;
        // Resolve Bets
        const [winAmount, lossAmount] = this.GetBetTotals();

        for (const bet of this.bets) {
          const predicted = bet.predictedWin ? "Win" : "Loss";
          let amountEarned = 0;
          const correctSideTotal = result === "Win" ? winAmount : lossAmount;
          const wrongSideTotal = result === "Win" ? lossAmount : winAmount;
          if (result == "Remake") {
            amountEarned = bet.pointsBet;
          } else if (result === predicted) {
            amountEarned =
              bet.pointsBet +
              Math.ceil((bet.pointsBet / correctSideTotal) * wrongSideTotal);
          }

          // Create Prediction
          predictionsModel.create({
            userId: bet.userID,
            matchId: "NA1_" + this.gameId.toString(),
            amountBet: bet.pointsBet,
            prediction: predicted,
            outcome: result,
            amountEarned: amountEarned,
          });

          // Create Transactions and Update User's Current Points
          if (amountEarned !== 0) {
            TransferPoints(
              undefined,
              bet.userID,
              amountEarned,
              `Bet ${bet.pointsBet} and won ${amountEarned}`
            );
          }
        }
        
        if (result === "Win") {
          for (const id of this.discordUsers) {
            TransferPoints(undefined, id, 25, "Nice Win!");
          }
        }

        // Update GameModel
        const thisGame = await gameMatchModel.findById(this.gameId);
        if (thisGame) {
          thisGame.outcome = result as "Win" | "Loss" | "Remake";
          thisGame.save();
        }
        // Remove the Game from the Lives Game List
        LiveGames = LiveGames.filter((game) => game.gameId !== this.gameId);
        // Stop the check for this game
        clearInterval(this.intervalID);
        ReplyTo(this.message!, {
          content: `NA1_${this.gameId} is over! The result was a ${result}.`
        });
      } else {
        console.error("Game was both not live, nor finished: NA1_", this.gameId);
        return false;
      }
    }
    return true;
  }

  // Returns amount of points bet for [WIN, LOSS]
  GetBetTotals(): [number, number] {
    let lossAmount = 0;
    let winAmount = 0;
    for (const bet of this.bets) {
      if (bet.predictedWin) {
        winAmount += bet.pointsBet;
      } else {
        lossAmount += bet.pointsBet;
      }
    }
    return [winAmount, lossAmount];
  }

  // Construct Discord Message for this game
  async SendBetMessage() {
    const [winAmount, lossAmount] = this.GetBetTotals();
    const button = new ButtonBuilder()
      .setCustomId(this.gameId.toString())
      .setLabel("Bet on this game!")
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    // Get name of user
    const competitors = [];
    for (const id of this.discordUsers) {
      const user = await userModel.findById(id)
      competitors.push(user?.discordName);
    }
    const text = `${competitors.toString()} begun a ranked game and betting is now open! There are ${winAmount + lossAmount} points currently riding on this game. \n
    There is 🟦 ${winAmount} 🟦 betting on a win, and 🟥 ${lossAmount} 🟥 betting on a loss! \n
    Betting closes in <t:${this.unixTimeStamp}:R>. 
    `;

    const messageContent: BaseMessageOptions = {
      content: text,
      components: [row],
    };

    if (this.message === undefined) {
      this.message = await SendMessage(messageContent);
    } else {
      await EditMessage(this.message, messageContent);
    }
  }

  // Handles user pressing the bet option
  async HandleBetButton(interaction: ButtonInteraction) {
    // Betting is closed
    if (!this.betting) {
      interaction.reply({
        content: "Betting Closed!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const userID = Number(interaction.user.id);
    if (this.discordUsers.includes(userID)) {
      interaction.reply({
        content: "Woah, you aren't allowed to bet on your own games!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if user is registered
    const user = await userModel.findById(userID);
    if (user === null) {
      interaction.reply({
        content: `Woah, you aren't registered with DraftDiff yet. 
          Do /register to get started, then try again.
          `,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(this.gameId.toString())
      .setTitle("DraftDiff Bookie");

    const amountInput = new TextInputBuilder()
      .setCustomId("betAmount")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue("0")
      .setMaxLength(10);

    const text = new TextDisplayBuilder().setContent(
      `You currently have ${user.currentPoints} points. How much do you want to wager?`
    );
    const amountLabel = new LabelBuilder()
      .setLabel(`How many points do you want to bet?`)
      .setTextInputComponent(amountInput);

    const betTypeSelector = new StringSelectMenuBuilder()
      .setCustomId("betType")
      .setRequired(true)
      .setMaxValues(1)
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel("Bet Win").setValue("win"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Bet Loss")
          .setValue("loss")
      );
    const betTypeLabel = new LabelBuilder()
      .setLabel("Bet Win or Bet Loss")
      .setStringSelectMenuComponent(betTypeSelector);
    modal
      .addLabelComponents(betTypeLabel, amountLabel)
      .addTextDisplayComponents(text);

    await interaction.showModal(modal);
  }

  // Handles user submitting a bet
  async HandleBetModalSubmit(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    if (!this.betting) {
      interaction.followUp({
        content: "Took too long and betting has closed!",
      });
      return;
    }
    const userID = Number(interaction.user.id);
    const user = await userModel.findById(userID);

    const amountBet = Math.floor(Number(interaction.fields.getTextInputValue("betAmount")));
    const betType =
      interaction.fields.getStringSelectValues("betType")[0] == "win";

    // Input a non number amount
    if (isNaN(amountBet)) {
      interaction.followUp({
        content: "Invalid Bet Placed. Try again later.",
      });
      return;
    }

    // Tried to bet more points than they currently have
    if (amountBet > (user?.currentPoints ?? 0) || amountBet <= 0) {
      interaction.followUp({
        content:
          "You tried to bet more than you currently have. Try again later.",
      });
      return;
    }

    // Good to add the bet!
    this.AddBet(userID, betType, amountBet);
    interaction.followUp({
      content: "Thank you for betting!"
    });
  }
}

export class Bets {
  userID: number;
  predictedWin: boolean;
  pointsBet: number;

  constructor(userID: number, predicted_win: boolean, points_bet: number) {
    this.userID = userID;
    this.predictedWin = predicted_win;
    this.pointsBet = points_bet;
  }
}

export function FindLiveGame(gameId: string | number): LiveGame | null {
  let id = 0;
  if (typeof gameId === "string") {
    id = Number(gameId);
  } else {
    id = gameId;
  }

  for (const game of LiveGames) {
    if (game.gameId === id) {
      return game;
    }
  }
  return null;
}
