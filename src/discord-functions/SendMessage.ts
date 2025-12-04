import { Message, MessageCreateOptions, MessageEditOptions, MessageReplyOptions } from "discord.js";
import { client, mainChannel } from "../index";

export async function SendMessage(
  content: MessageCreateOptions
): Promise<Message> {
  if (mainChannel && mainChannel.isSendable()) {
    return await mainChannel.send(content);
  } else {
    throw new Error("Main Channel not set");
  }
}

export async function EditMessage(msg: Message, content: MessageEditOptions) {
  msg.edit(content);
}

export async function ReplyTo(msg: Message, content: MessageReplyOptions) {
  msg.reply(content);
}

export async function SendDM(userID: string, content: MessageCreateOptions) {
  client.users.fetch(userID).then((user) => {
    user.send(content);
  })
}