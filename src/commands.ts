import { Message } from "discord.js";
import { CommandHandler } from "./types/commandHandler";
import * as fs from "fs/promises";
import { createEmbed } from "./utils/embed";
import { bot } from "./main";

export const commands = new Map<string, CommandHandler>();

export const loadCommands = async () => {
  const files = await fs.readdir("./dist/commands");
  for (const file of files) {
    const command = await import(`./commands/${file}`);
    const commandObject = new command.default(bot) as CommandHandler;
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

  if (message.mentions.has(bot.user!)) {
    const helpCommand = commands.get("help");
    helpCommand?.process(message);
  }

  const content = message.content;
  if (!content.startsWith(prefix)) return;
  const command = content.split(" ")[0].substring(prefix.length);
  const commandList = [...commands.keys()];

  if (commandList.includes(command)) {
    const commandObject = commands.get(command);
    if (!commandObject)
      return sendError(
        message,
        "Command not found",
        `Command \`${command}\` not found.`
      );
    try {
      await commandObject.process(message);
    } catch (e) {
      console.error(e);
      sendError(
        message,
        "¯\\_(ツ)_/¯",
        "An unknown error occured. \nDetails: `" + e + "`"
      );
    }

    return;
  }
};

export const sendError = (
  message: Message,
  title: string,
  description: string
) => {
  console.log("Sending error");
  const embed = createEmbed(title, description, "error");
  message.channel.send({ embeds: [embed] });
};
