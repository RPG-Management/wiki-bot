import dotenv from "dotenv";
import Discord from "discord.js";
dotenv.config();

const bot = new Discord.Client({ intents: ["GUILD_MESSAGES"] });
bot.login(process.env.DISCORD_TOKEN);

bot.on("ready", (bot) => {
  console.log(`Logged in as ${bot.user.tag}!`);
});
