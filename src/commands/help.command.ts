import { commands, prefix, sendError } from "../commands";
import { Message } from "discord.js";
import { CommandHandler } from "../types/commandHandler";
import { createEmbed } from "../utils/embed";

export default class HelpCommand implements CommandHandler {
  name = () => "help";
  shortDescription = () => "Get information about a command.";
  longDescription = () =>
    "Allows you to see detailed description of command and what paramteres it uses.";
  params = () => [
    {
      name: "command name",
      description: "The name of the command you want to get information about.",
    },
  ];

  usage = () => `${prefix}help [command name]`;
  process = async (message: Message) => {
    if (message.content.split(" ").length === 1) {
      const embed = createEmbed(
        "D&D Wiki help",
        "List of all commands available.\n" +
          "`<>` indicates required parameter.\n" +
          "`[]` indicates optional parameter.\n" +
          `Bot prefix: \`${prefix}\``
      ).addFields(
        [...commands.values()].map((c) => ({
          name: `${prefix}${c.name()}`,
          value: c.shortDescription() + `\n\`${c.usage()}\``,
        }))
      );
      message.channel.send({ embeds: [embed] });
    } else {
      const command = message.content.split(" ")[1];
      const commandObject = commands.get(command);
      if (!commandObject)
        return sendError(
          message,
          " Command not found",
          `Command \`${command}\` not found.`
        );

      const embed = createEmbed(
        `D&D Wiki help: ${commandObject.name()}`,
        commandObject.longDescription() +
          "\n **Usage:** `" +
          commandObject.usage() +
          "`"
      ).addFields(
        [...commandObject.params()].map((p) => ({
          name: p.name,
          value: p.description,
        }))
      );

      message.channel.send({ embeds: [embed] });
    }
  };
}
