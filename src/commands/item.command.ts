import { prefix } from "commands";
import { Message } from "discord.js";
import { CommandHandler } from "types/commandHandler";

export default class SpellCommand implements CommandHandler {
  name = () => "Item";
  shortDescription = () => "Get information about an item.";
  longDescription = () =>
    `Allows you to get information about a D&D item. Use \`${prefix}item <item name>\`.`;

  process = async (message: Message) => {
    message.channel.send("Ayo nice (item)");
  };
}
