import { Message } from "discord.js";
import { CommandHandler } from "types/commandHandler";
import * as fs from "fs/promises";

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

const sendHelp = (message: Message) => {};
