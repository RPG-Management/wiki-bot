import { Message } from "discord.js";

export interface CommandHandler {
  process(message: Message): Promise<void>;
  shortDescription: () => string;
  longDescription: () => string;
  name: () => string;
  params: () => {
    name: string;
    description: string;
  }[];
}
