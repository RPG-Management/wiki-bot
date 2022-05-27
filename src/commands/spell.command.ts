import { prefix } from "../commands";
import { Message } from "discord.js";
import { CommandHandler } from "../types/commandHandler";
import axios from "axios";

export default class ItemCommand implements CommandHandler {
  name = () => "spell";
  shortDescription = () => "Get information about a spell.";
  longDescription = () => `Allows you to get information about a D&D spell.`;
  params = () => [
    {
      name: "spell name",
      description: "The name of the spell you want to get information about.",
    },
  ];
  usage = () => `${prefix}spell <spell name>`;

  process = async (message: Message) => {
    const spellName = message.content.split(" ").slice(1).join(" ");
    // const spell = await axios.get()
  };
}
