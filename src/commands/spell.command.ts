import { prefix } from "../commands";
import { Message } from "discord.js";
import { CommandHandler } from "types/commandHandler";

export default class SpellCommand implements CommandHandler {
  name = () => "spell";
  shortDescription = () => "Get information about a spell.";
  longDescription = () =>
    `Allows you to get information about a D&D spell. Use \`${prefix}spell <spell name>\`.`;
  params = () => [
    {
      name: "spell name",
      description: "The name of the spell you want to get information about.",
    },
  ];
  usage = () => `${prefix}spell <spell name>`;

  process = async (message: Message) => {
    message.channel.send("Ayo nice");
  };
}
