import { ColorResolvable, MessageEmbed, MessageEmbedOptions } from "discord.js";

const getEmbedColor = (type?: string): ColorResolvable => {
  switch (type) {
    case undefined:
    case "default":
      return "#d35400";
    case "success":
      return "#27ae60";
    case "info":
      return "#2980b9";
    case "warning":
      return "#d35400";
    case "danger":
    case "error":
      return "#c0392b";
    default:
      return type as ColorResolvable;
  }
};

export const createEmbed = (
  title: string,
  description?: string,
  type?: "default" | "error" | string,
  options?: MessageEmbedOptions
) => {
  return new MessageEmbed(options)
    .setTitle(title)
    .setDescription(description || "")
    .setColor(getEmbedColor(type))
    .setTimestamp();
};
