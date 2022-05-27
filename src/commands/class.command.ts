import axios from "axios";
import {
  Client,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
} from "discord.js";
import { prefix } from "../commands";
import { AbilityScoreList } from "../types/abs.type";
import { ClassLevel, Clazz } from "../types/class.type";
import { CommandHandler, ListResponse } from "../types/commandHandler";
import { createEmbed } from "../utils/embed";

export default class ClassCommand implements CommandHandler {
  private classes: AbilityScoreList[];

  constructor(bot: Client) {
    bot.on("interactionCreate", async (i) => {
      if (!i.isSelectMenu()) return;
      if (i.customId !== "class-select") return;
      const [embed, row] = await this.processClass(i.values[0]);
      i.update({ embeds: [embed], components: row ? [row] : undefined });
    });

    bot.on("interactionCreate", async (i) => {
      if (!i.isButton()) return;
      if (i.customId.includes("class_ability_row")) {
        i.deferUpdate();
        const message = i.message as Message;
        message.channel.send("Button was clicked with value: " + i.customId);
      }
    });

    this.classes = [];

    axios
      .get<ListResponse<AbilityScoreList>>(
        "https://www.dnd5eapi.co/api/classes"
      )
      .then((res) => {
        this.classes = res.data.results;
      });
  }
  name = () => "class";
  shortDescription = () => "See details of a class";
  longDescription = () => `This command allows you to see details of a class.`;
  params = () => [
    {
      name: "class name",
      description: "The name of the class you want to see details of.",
    },
  ];
  usage = () => `${prefix}abs [class name]`;

  private getSelectMenu() {
    return new MessageSelectMenu()
      .setCustomId("class-select")
      .setPlaceholder("Click to select")
      .addOptions(
        this.classes.map((clazz) => ({
          label: clazz.name,
          value: clazz.index,
        }))
      );
  }

  process = async (message: Message) => {
    const className = message.content.split(" ").slice(1).join(" ");

    if (!className) {
      const row = new MessageActionRow().addComponents(this.getSelectMenu());

      const embed = createEmbed("Select a class");

      await message.channel.send({ embeds: [embed], components: [row] });
      return;
    }

    const [embed, row] = await this.processClass(className);

    await message.channel.send({
      embeds: [embed],
      components: row ? [row] : undefined,
    });
  };

  processClass = async (
    classIndex: string
  ): Promise<[MessageEmbed, MessageActionRow?]> => {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("class_ability_row-levels-" + classIndex)
        .setLabel("Levels")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("class_ability_row-spellcasting-" + classIndex)
        .setLabel("Spellcasting")
        .setStyle("SECONDARY")
    );

    try {
      const clazz = await axios.get<Clazz>(
        "https://www.dnd5eapi.co/api/classes/" + classIndex
      );
      const embed = createEmbed(
        "Class: " + clazz.data.name,
        `**Hit Die:** 1d${clazz.data.hit_die}
**Saving throws:** ${clazz.data.saving_throws.map((s) => s.name).join(", ")}
**Subclasses:** ${clazz.data.subclasses.map((s) => s.name).join(", ")}
**Multi casting:** *prerequisites* ${clazz.data.multi_classing.prerequisites
          .map((s) => s.ability_score.name + " (" + s.minimum_score + ") ")
          .join(", ")}`
      );

      return [embed, row];
    } catch (error) {
      return [
        createEmbed(
          "Class not found",
          `The class \`${classIndex}\` was not found.`,
          "error"
        ),
        undefined,
      ];
    }
  };

  processLevels = async (message: Message, clazz: string) => {
    const levels = await axios.get<ClassLevel[]>(
      `https://www.dnd5eapi.co/api/classes/${clazz}/levels`
    );
  };
}
