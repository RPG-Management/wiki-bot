import { Message } from "discord.js";
import { CommandHandler } from "types/commandHandler";

export default class SpellCommand implements CommandHandler {
  name = () => "Item";
  description = () => "Get information about an item.";

  process = async (message: Message) => {
    message.channel.send("Ayo nice (item)");
  };
}
