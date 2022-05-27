import { prefix, sendError } from "../commands";
import { Message } from "discord.js";
import { CommandHandler } from "../types/commandHandler";
import axios from "axios";
import { Damage, Dc, Spell } from "../types/spell.type";
import { createEmbed } from "../utils/embed";

const formatSpellName = (name: string) =>
  name.toLocaleLowerCase().replaceAll(" ", "-");

const formatSpell = (spell: Spell): string => {
  const description = spell.desc
    .join("\n\n")
    .replace(/([0-9]+[d][0-9]+)|([0-9]+\ feet)|([0-9]+\-foot)/g, (a) => {
      return `**${a}**`;
    });
  const rangeInMeters = /[0-9]+/g.exec(spell.range)?.[0];
  console.log(rangeInMeters);
  return `**Level:** ${spell.level}
**Casting time:** ${spell.casting_time}
**Range:** ${spell.range} ${
    rangeInMeters
      ? "(" + Math.round((parseFloat(rangeInMeters) / 3.3) * 10) / 10 + "m)"
      : ""
  }
**Components:** ${spell.components.join(", ")}
**Duration:** ${spell.concentration ? "Concentration, " : ""}${spell.duration}${
    spell.attack_type ? `\n**Attack type:** ${spell.attack_type}` : ""
  }${spell.school ? `\n**School:** ${spell.school.name}` : ""}${
    spell.ritual ? "\n**Ritual:** Yes" : ""
  }${spell.material ? `\n**Material:** ${spell.material}` : ""}

${description}`;
};

const formatDamage = (damage: Damage) => {
  const damageChar = damage.damage_at_character_level
    ? Object.keys(damage.damage_at_character_level).map(
        (key) => `${key}: ${damage.damage_at_character_level![key]}`
      )
    : null;

  const damageSlot = damage.damage_at_slot_level
    ? Object.keys(damage.damage_at_slot_level).map(
        (key) => `${key}: ${damage.damage_at_slot_level![key]}`
      )
    : null;

  return `**Damage type:** ${damage.damage_type.name}
${
  damageChar
    ? `**Damage at character level:** \`\`\`${damageChar.join("\n")}\`\`\``
    : ""
}   ${
    damageSlot
      ? `**Damage at slot level:** \`\`\`${damageSlot.join("\n")}\`\`\``
      : ""
  }`;
};

const formatDC = (dc: Dc) => {
  return `DC Type: ${dc.dc_type.name}\nDC Success: ${dc.dc_success}`;
};

export default class ItemCommand implements CommandHandler {
  name = () => "spell";
  shortDescription = () => "Get information about a spell.";
  longDescription = () => `Allows you to get information about a D&D spell.`;
  params = () => [
    {
      name: "spell name",
      description: "The name of the spell you want to get information about.",
    },
  ];
  usage = () => `${prefix}spell <spell name>`;

  process = async (message: Message) => {
    const spellName = message.content.split(" ").slice(1).join(" ");
    try {
      const spell = await axios.get<Spell>(
        "https://www.dnd5eapi.co/api/spells/" + formatSpellName(spellName)
      );

      const embed = createEmbed(
        `D&D Wiki: ${spell.data.name}`,
        formatSpell(spell.data)
      );

      if (spell.data.higher_level.length)
        embed.addField("At higher level", spell.data.higher_level.join("\n"));
      if (spell.data.damage)
        embed.addField("Damage", formatDamage(spell.data.damage));
      if (spell.data.dc) embed.addField("DC", formatDC(spell.data.dc));

      if (spell.data.classes)
        embed.addField(
          "Classes",
          spell.data.classes.map((c) => c.name).join(", ")
        );

      if (spell.data.subclasses?.length)
        embed.addField(
          "Subclasses",
          spell.data.subclasses.map((c) => c.name).join(", ")
        );

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;

      sendError(
        message,
        "Spell not found",
        `Spell \`${spellName}\` not found.`
      );
    }
  };
}
