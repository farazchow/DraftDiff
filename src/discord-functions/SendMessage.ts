import { Message, MessageCreateOptions, MessageEditOptions } from "discord.js";
import { mainChannel } from "../index";

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
