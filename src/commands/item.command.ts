import { prefix } from "../commands";
import { Message } from "discord.js";
import { CommandHandler } from "types/commandHandler";

export default class SpellCommand implements CommandHandler {
  name = () => "item";
  shortDescription = () => "Get information about an item.";
  longDescription = () =>
    `Allows you to get information about a D&D item. Use \`${prefix}item <item name>\`.`;
  params = () => [
    {
      name: "item name",
      description: "The name of the item you want to get information about.",
    },
  ];
  usage = () => `${prefix}item <item name>`;

  process = async (message: Message) => {
    message.channel.send("Ayo nice (item)");
  };
}
