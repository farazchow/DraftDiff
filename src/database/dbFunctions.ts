import transactionsModel from "./transactions";
import userModel from "./users";

export async function TransferPoints(
  sender: number | undefined,
  receiver: number | undefined,
  amount: number,
  note: string
) {
  if (sender) {
    const senderUser = await userModel.findById(sender);
    if (senderUser && senderUser.currentPoints >= amount) {
      senderUser.currentPoints = senderUser.currentPoints - amount;
    }
  }
  if (receiver) {
    const receiverUser = await userModel.findById(receiver);
    if (receiverUser) {
      receiverUser.currentPoints = receiverUser.currentPoints + amount;
    }
  }
  transactionsModel.create({
    sender: sender,
    receiver: receiver,
    amount: amount,
    note: note,
  });
}
