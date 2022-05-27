import axios from "axios";
import {
  Client,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { prefix } from "../commands";
import { CommandHandler } from "../types/commandHandler";
import { SpellListing, Spells } from "../types/spell.type";
import { createEmbed } from "../utils/embed";

const perPage = 20;
let spells: Spells;

const renderSpells = (spells: SpellListing[]) =>
  spells.map((spell) => spell.name).join("\n");

export default class SpellsCommand implements CommandHandler {
  name = () => "spells";
  shortDescription = () => "List spells";
  longDescription = () => "List all spells from D&D";
  params = () => [
    {
      name: "[search | page number]",
      description: "Search keyword or page number",
    },
  ];
  usage = () => `${prefix}spells [search | page number]`;

  constructor(bot: Client) {
    bot.on("interactionCreate", async (i) => {
      if (!i.isButton()) return;
      if (i.customId.includes("spells_page")) {
        const page = parseInt(i.customId.split("-")[1]);
        const [embed, row] = await this.processPage(page);
        i.update({ embeds: [embed], components: [row] });
      }
    });
  }

  async processPage(page: number): Promise<[MessageEmbed, MessageActionRow]> {
    const list =
      spells ||
      (await (
        await axios.get<Spells>("https://www.dnd5eapi.co/api/spells")
      ).data);
    if (!spells) spells = list;
    const maxPage = Math.ceil(list.count / perPage);
    if (page <= 0) page = 1;
    if (page > maxPage) page = maxPage;
    const spellsOnPage = list.results.slice(
      (page - 1) * perPage,
      page * perPage
    );

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("spells_page-" + (page - 1))
        .setDisabled(page <= 1)
        .setLabel("Back")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("text")
        .setDisabled(true)
        .setLabel(`Page ${page}/${maxPage}`)
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("spells_page-" + (page + 1))
        .setDisabled(page >= maxPage)
        .setLabel("Next")
        .setStyle("PRIMARY")
    );

    const embed = createEmbed(
      `Spells`,
      "**All spells**\n\n" + renderSpells(spellsOnPage),
      "default",
      {
        footer: {
          text: `Page ${page}/${maxPage} - ${list.count} spells`,
        },
      }
    );

    return [embed, row];
  }

  async processSearch(message: Message, search: string) {
    const list =
      spells ||
      (await (
        await axios.get<Spells>("https://www.dnd5eapi.co/api/spells")
      ).data);
    if (!spells) spells = list;

    const results = list.results.filter((spell) =>
      spell.name.toLowerCase().includes(search.toLowerCase())
    );

    const embed = createEmbed(
      `Spells (search ${search})`,
      "**Search results**\n\n" + renderSpells(results),
      "default",
      {
        footer: {
          text: `${results.length} results`,
        },
      }
    );

    await message.channel.send({ embeds: [embed] });
  }

  async process(message: Message) {
    const arg = message.content.split(" ")[1];

    if (!isNaN(parseInt(arg)) || arg === undefined) {
      const [embed, row] = await this.processPage(parseInt(arg) || 1);
      await message.channel.send({ embeds: [embed], components: [row] });
      return;
    }

    if (arg !== undefined) {
      const string = message.content.split(" ").slice(1).join(" ");
      await this.processSearch(message, string);
      return;
    }
  }
}
