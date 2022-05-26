import { prefix } from "../commands";
import { Client, Message } from "discord.js";
import { CommandHandler } from "../types/commandHandler";
import { createEmbed } from "../utils/embed";
import axios from "axios";

export default class PingCommand implements CommandHandler {
  constructor(private bot: Client) {}

  name = () => "ping";
  shortDescription = () => "Get the bot's ping.";
  longDescription = () => `Returns the bot's ping.`;
  params = () => [];
  usage = () => `${prefix}ping`;

  process = async (message: Message) => {
    const m = await message.channel.send({
      embeds: [createEmbed("Loading ping...", "")],
    });

    const date = Date.now();
    await axios.get("https://www.dnd5eapi.co/api");
    const dndApiPing = Date.now() - date;

    const embed = createEmbed(
      "Pong!",
      `:ping_pong: **Bot ping:** ${
        m.createdTimestamp - message.createdTimestamp
      }ms\n` +
        `**API ping:** ${Math.round(this.bot.ws.ping)}ms\n` +
        `**D&D API ping:** ${dndApiPing}ms`
    );

    m.edit({ embeds: [embed] });
  };
}
