import { Message } from "discord.js";
import { prefix } from "../commands";
import { CommandHandler } from "../types/commandHandler";

export default class SpellsCommand implements CommandHandler {
  name = () => "spells";
  shortDescription = () => "List spells";
  longDescription = () => "List all spells from D&D";
  params = () => [
    {
      name: "[search | page number]",
      description: "Search keyword or page number",
    },
  ];
  usage = () => `${prefix}spells [search | page number]`;

  async process(message: Message) {}
}
