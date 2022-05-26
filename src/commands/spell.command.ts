import { Message } from "discord.js";
import { CommandHandler } from "types/commandHandler";

export default class SpellCommand implements CommandHandler {
  name = () => "Spell";
  description = () => "Get information about a spell.";

  process = async (message: Message) => {
    message.channel.send("Ayo nice");
  };
}
