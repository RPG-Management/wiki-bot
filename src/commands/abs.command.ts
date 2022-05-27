import axios from "axios";
import {
  Client,
  Message,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
} from "discord.js";
import { prefix } from "../commands";
import { AbilityScore, AbilityScoreList } from "../types/abs.type";
import { CommandHandler, ListResponse } from "../types/commandHandler";
import { createEmbed } from "../utils/embed";

export default class AbilityScoreCommand implements CommandHandler {
  name = () => "abs";
  shortDescription = () => "See details of ability scores";
  longDescription = () =>
    `This command allows you to see details of ability scores.`;
  params = () => [
    {
      name: "ability score",
      description: "The name of the ability score you want to see details of.",
    },
  ];
  usage = () => `${prefix}abs [ability score]`;

  processAbilityScore = async (score: string): Promise<MessageEmbed> => {
    try {
      const abs = await axios.get<AbilityScore>(
        `https://www.dnd5eapi.co/api/ability-scores/${score}`
      );
      const embed = createEmbed(
        `Ability score: ${abs.data.full_name}`,
        `${abs.data.desc.join("\n\n")}`
      );

      if (abs.data.skills.length)
        embed.addField("Skills", abs.data.skills.map((s) => s.name).join(", "));

      return embed;
    } catch (error) {
      console.log(error);
      return createEmbed(
        "Ability score not found",
        `The ability score \`${score}\` was not found.`
      );
    }
  };

  constructor(bot: Client) {
    bot.on("interactionCreate", async (i) => {
      if (!i.isSelectMenu()) return;
      if (i.customId !== "ability_score") return;
      i.update({ embeds: [await this.processAbilityScore(i.values[0])] });
    });
  }

  process = async (message: Message) => {
    const abilityScoreName = message.content.split(" ").slice(1).join(" ");
    const abilityScores = await axios.get<ListResponse<AbilityScoreList>>(
      "https://www.dnd5eapi.co/api/ability-scores"
    );
    if (!abilityScoreName) {
      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("ability_score")
          .setPlaceholder("Click to select")
          .addOptions(
            abilityScores.data.results.map((score) => ({
              label: score.name,
              value: score.index,
            }))
          )
      );

      const embed = createEmbed("Select an ability score", "");

      await message.channel.send({ embeds: [embed], components: [row] });
      return;
    }

    await message.channel.send({
      embeds: [await this.processAbilityScore(abilityScoreName)],
    });
  };
}
