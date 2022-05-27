import { Client, Message } from "discord.js";

export interface CommandHandler {
  process(message: Message): Promise<void>;
  new?: (bot: Client) => CommandHandler;

  shortDescription: () => string;
  longDescription: () => string;
  name: () => string;
  params: () => {
    name: string;
    description: string;
  }[];
  usage: () => string;
}

export interface ListResponse<T> {
  count: number;
  results: T[];
}
