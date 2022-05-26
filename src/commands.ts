import { Message } from "discord.js";
import { CommandHandler } from "types/commandHandler";
import * as fs from "fs/promises";
import { createEmbed } from "./utils/embed";

const commands = new Map<string, CommandHandler>();

export const loadCommands = async () => {
  const files = await fs.readdir("./dist/commands");
  for (const file of files) {
    const command = await import(`./commands/${file}`);
    const commandObject = new command.default() as CommandHandler;
    commands.set(commandObject.name(), commandObject);
  }

  console.log(
    `Loaded ${commands.size} commands. (${files
      .map((f) => f.replace(".command.js", ""))
      .join(", ")})`
  );
};

export const prefix = process.env.DISCORD_BOT_PREFIX || "!";

export const handleMessage = async (message: Message) => {
  if (message.author.bot) return;

  const content = message.content;
  if (!content.startsWith(prefix)) return;
  const command = content.split(" ")[0].substring(prefix.length);

  if (command === "help") return sendHelp(message);
};

export const sendError = (
  message: Message,
  title: string,
  description: string
) => {
  const embed = createEmbed(title, description, "error");
  message.channel.send({ embeds: [embed] });
};

const sendHelp = (message: Message) => {
  if (message.content.split(" ").length === 1) {
    const embed = createEmbed(
      "D&D Wiki help",
      "List of all commands available."
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
        "Error: Command not found",
        `Command \`${command}\` not found.`
      );

    const embed = createEmbed(
      `D&D Wiki help: ${commandObject.name()}`,
      commandObject.longDescription() + "\n" + commandObject.usage()
    ).addFields(
      [...commandObject.params()].map((p) => ({
        name: p.name,
        value: p.description,
      }))
    );

    message.channel.send({ embeds: [embed] });
  }
};
