import dotenv from "dotenv";
dotenv.config();
import Discord from "discord.js";
import { handleMessage, loadCommands } from "./commands";
import nodeHtmlToImage from "node-html-to-image";

export const bot = new Discord.Client({
  intents: ["GUILD_MESSAGES", "GUILDS"],
  partials: ["CHANNEL", "MESSAGE", "USER"],
});
bot.login(process.env.DISCORD_TOKEN);

loadCommands();

bot.on("ready", (bot) => {
  bot.user.setActivity({
    type: "WATCHING",
    name: "D&D Wiki",
  });

  bot.on("messageCreate", handleMessage);

  console.log(`Logged in as ${bot.user.tag}!`);
});
