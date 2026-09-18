export interface Chapter { id: string; n: string; en: string; jp?: string; romaji?: string; plain: string; short: string }

/** Reading order. `plain` is the résumé word shown beside the fiction everywhere; `short` fits a phone tick. */
export const CHAPTERS: Chapter[] = [
  { id: "cover", n: "00", en: "COVER", plain: "Start", short: "Start" },
  { id: "select", n: "01", en: "CHARACTER SELECT", jp: "選択", romaji: "sentaku", plain: "About & education", short: "About" },
  { id: "campaign", n: "02", en: "CAMPAIGN", jp: "仕事", romaji: "shigoto", plain: "Experience", short: "Work" },
  { id: "boss", n: "03", en: "BOSS FIGHTS", jp: "対戦", romaji: "taisen", plain: "Projects", short: "Projects" },
  { id: "shop", n: "04", en: "POWER-UP SHOP", jp: "商店", romaji: "shōten", plain: "npm packages", short: "npm" },
  { id: "arcade", n: "05", en: "ARCADE", jp: "遊技場", romaji: "yūgijō", plain: "Games", short: "Games" },
  { id: "quests", n: "06", en: "SIDE QUESTS", jp: "依頼", romaji: "irai", plain: "Clubs & chapters", short: "Clubs" },
  { id: "archives", n: "07", en: "ARCHIVES", jp: "書庫", romaji: "shoko", plain: "Research", short: "Papers" },
  { id: "transmissions", n: "08", en: "TRANSMISSIONS", jp: "放送", romaji: "hōsō", plain: "Articles", short: "Posts" },
  { id: "inventory", n: "09", en: "INVENTORY", jp: "装備", romaji: "sōbi", plain: "Skills", short: "Skills" },
  { id: "trophies", n: "10", en: "TROPHY ROOM", jp: "実績", romaji: "jisseki", plain: "Certifications", short: "Certs" },
  { id: "continue", n: "11", en: "CONTINUE?", jp: "つづく", romaji: "tsuzuku", plain: "Contact", short: "Contact" },
];
