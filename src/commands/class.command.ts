import axios from "axios";
import {
  Client,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
} from "discord.js";
import { prefix } from "../commands";
import { AbilityScoreList } from "../types/abs.type";
import { ClassLevel, Clazz } from "../types/class.type";
import { CommandHandler, ListResponse } from "../types/commandHandler";
import { createEmbed } from "../utils/embed";
import { createTable } from "../utils/table";

const formatKey = (s: string) =>
  s.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());

const formatSpecifics = (specific: any): string | number => {
  switch (typeof specific) {
    case "string":
    case "number":
      return specific;

    case "boolean":
      return specific ? "Yes" : "No";

    case "object":
      if (Array.isArray(specific)) {
        return specific.map((s) => formatSpecifics(s)).join(", ");
      } else {
        if ("dice_count" in specific && "dice_value" in specific)
          return `${specific.dice_count}d${specific.dice_value}`;
        return Object.keys(specific)
          .map((k) => `${formatKey(k)}: ${formatSpecifics(specific[k])}`)
          .join(", ");
      }
    default:
      return specific;
  }
};

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

        if (i.customId.includes("levels")) {
          this.processLevels(message, i.customId.split("-")[2]);
        }
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
    const msg = await message.channel.send("Generating table...");
    const levels = await axios.get<ClassLevel[]>(
      `https://www.dnd5eapi.co/api/classes/${clazz}/levels`
    );

    const specificsHeaders = Object.keys(levels.data[0].class_specific).map(
      (s) => ({
        key: s,
        label: formatKey(s),
      })
    );

    const specificsValues = levels.data.map((level) => {
      const specifics = level.class_specific;
      return Object.keys(specifics).map((s) => formatSpecifics(specifics[s]));
    });

    const output = await createTable(
      [
        { label: "Level", centered: true },
        { label: "Features" },
        { label: "ABS Bonus", centered: true },
        { label: "Prof bonus", centered: true },
        ...(levels.data[0].spellcasting?.cantrips_known !== undefined
          ? [{ label: "Cantrips", centered: true }]
          : []),
        ...(levels.data[0].spellcasting?.spells_known !== undefined
          ? [{ label: "Spells", centered: true }]
          : []),
        ...(levels.data[0].spellcasting
          ? [
              ...(levels.data[0].spellcasting.spell_slots_level_1 !== undefined
                ? [{ label: "SSL 1", centered: true }]
                : []),
              ...(levels.data[0].spellcasting.spell_slots_level_2 !== undefined
                ? [{ label: "SSL 2", centered: true }]
                : []),
              ...(levels.data[0].spellcasting.spell_slots_level_3 !== undefined
                ? [{ label: "SSL 3", centered: true }]
                : []),
              ...(levels.data[0].spellcasting.spell_slots_level_4 !== undefined
                ? [{ label: "SSL 4", centered: true }]
                : []),
              ...(levels.data[0].spellcasting.spell_slots_level_5 !== undefined
                ? [{ label: "SSL 5", centered: true }]
                : []),
              ...(levels.data[0].spellcasting.spell_slots_level_6 !== undefined
                ? [{ label: "SSL 6", centered: true }]
                : []),
              ...(levels.data[0].spellcasting.spell_slots_level_7 !== undefined
                ? [{ label: "SSL 7", centered: true }]
                : []),
              ...(levels.data[0].spellcasting.spell_slots_level_8 !== undefined
                ? [{ label: "SSL 8", centered: true }]
                : []),
              ...(levels.data[0].spellcasting.spell_slots_level_9 !== undefined
                ? [{ label: "SSL 9", centered: true }]
                : []),
            ]
          : []),
        ...specificsHeaders.map((s) => ({ label: s.label, centered: true })),
      ],
      levels.data.map((l, i) => [
        l.level,
        l.features.map((f) => f.name).join(", "),
        l.ability_score_bonuses,
        l.prof_bonus,
        ...(l.spellcasting?.cantrips_known !== undefined
          ? [l.spellcasting.cantrips_known]
          : []),
        ...(l.spellcasting?.spells_known !== undefined
          ? [l.spellcasting.spells_known]
          : []),
        ...(l.spellcasting
          ? [
              ...(l.spellcasting.spell_slots_level_1 !== undefined
                ? [l.spellcasting.spell_slots_level_1]
                : []),
              ...(l.spellcasting.spell_slots_level_2 !== undefined
                ? [l.spellcasting.spell_slots_level_2]
                : []),
              ...(l.spellcasting.spell_slots_level_3 !== undefined
                ? [l.spellcasting.spell_slots_level_3]
                : []),
              ...(l.spellcasting.spell_slots_level_4 !== undefined
                ? [l.spellcasting.spell_slots_level_4]
                : []),
              ...(l.spellcasting.spell_slots_level_5 !== undefined
                ? [l.spellcasting.spell_slots_level_5]
                : []),
              ...(l.spellcasting.spell_slots_level_6 !== undefined
                ? [l.spellcasting.spell_slots_level_6]
                : []),
              ...(l.spellcasting.spell_slots_level_7 !== undefined
                ? [l.spellcasting.spell_slots_level_7]
                : []),
              ...(l.spellcasting.spell_slots_level_8 !== undefined
                ? [l.spellcasting.spell_slots_level_8]
                : []),
              ...(l.spellcasting.spell_slots_level_9 !== undefined
                ? [l.spellcasting.spell_slots_level_9]
                : []),
            ]
          : []),
        ...specificsValues[i],
      ])
    );

    const attachment = new MessageAttachment(output as Buffer, "table.png");
    await msg.delete();
    await message.channel.send({
      files: [attachment],
      content: `Class level table: **${clazz.replace(/^\w/, (c) =>
        c.toUpperCase()
      )}** *(Click to expand)*`,
    });
  };
}
