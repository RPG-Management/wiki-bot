import { Message } from "discord.js";

export interface CommandHandler {
  process(message: Message): Promise<void>;
  description: () => string;
  name: () => string;
}
