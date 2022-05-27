import axios from "axios";
import { load } from "cheerio";

export const dndWikiFallback = async (type: string, name: string) => {
  const url = `http://dnd5e.wikidot.com/${type}:${name}`;
  const res = await axios.get(url, { responseType: "text" });
  const html = res.data;
  const $ = load(html);
  const content = $("#page-content").html() || "";

  const cleanContent = content
    .replaceAll(
      '<div class="content-separator" style="display: none:"></div>',
      ""
    )
    .replaceAll(/<a.*?>/g, "")
    .replaceAll("</a>", "")
    .replace("<p>Source: Player's Handbook</p>", "")
    .replaceAll(/(<em>)|(<\/em>)/g, "*")
    .replaceAll(/(<strong>)|(<\/strong>)/g, "**")
    .replaceAll(/(<\/?p\>)/g, "")
    .replaceAll("<br>", "")
    .trim();

  return cleanContent;
};
