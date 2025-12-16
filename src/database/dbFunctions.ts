import gameMatchModel from "./game_matches";
import predictionsModel from "./predictions";
import transactionsModel from "./transactions";
import userModel from "./users";

export async function TransferPoints(
  sender: number | undefined,
  receiver: number | undefined,
  amount: number,
  note: string
) {
  if (amount !== 0 && sender) {
    const senderUser = await userModel.findById(sender);
    if (senderUser && senderUser.currentPoints >= amount) {
      senderUser.currentPoints = senderUser.currentPoints - amount;
      senderUser.save();
    }
  }
  if (amount !== 0 && receiver) {
    const receiverUser = await userModel.findById(receiver);
    if (receiverUser) {
      receiverUser.currentPoints = receiverUser.currentPoints + amount;
      receiverUser.save();
    }
  }
  transactionsModel.create({
    sender: sender,
    receiver: receiver,
    amount: amount,
    note: note,
    time: new Date(),
  });
}

export async function ResetDB() {
  try {
    await userModel.updateMany(
      {},
      { $set: {currentPoints: 100}}
    );
    await transactionsModel.deleteMany({});
    await gameMatchModel.deleteMany({});
    await predictionsModel.deleteMany({});
  } catch (error) {
    console.error(error);
  }
}