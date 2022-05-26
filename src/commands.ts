import { Message } from "discord.js";

const handle = (message: Message, args: string[]) => {
  message.channel.send("pong");
};
