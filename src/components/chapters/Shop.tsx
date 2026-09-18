import { resume } from "@/content/resume";
import { CHAPTERS } from "@/content/chapters";
import { Eyebrow, Kanji, VideoPanel } from "@/components/print";
import { ShopMenu, ShopSign, Shopkeeper } from "./ShopItem";
import "@/styles/shop.css";

const ch = CHAPTERS.find((c) => c.id === "shop") ?? { id: "shop", n: "04", en: "POWER-UP SHOP", jp: "商店", romaji: "shōten", plain: "npm packages" };

/* 04 / POWER-UP SHOP · npm packages. A shop screen on the neon street: the pixel sign, the cat at the counter,
   and two menu windows (the item list, the pointed-at item's sheet). The packages are the three on npm,
   read from resume.packages; the projects and the games live in their own chapters. */
export function Shop() {
  const { packages } = resume;
  return (
    <VideoPanel video="city" dim={0.8} id={ch.id} data-chapter={ch.id} className="chapter shop" ariaLabel={`${ch.n} ${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <div className="chapter-head shop-head">
          <h2 className="chapter-title">{ch.en}</h2>
          <div className="shop-head-meta">
            <Eyebrow n={ch.n}>{ch.en} <span className="shop-plain">· {ch.plain}</span></Eyebrow>
            <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
          </div>
        </div>

        <div className="shop-front ink-in">
          <ShopSign />
          <div className="shop-counter">
            <Shopkeeper />
            <p className="shop-greet paper ink-border">
              <span className="shop-greet-tail" aria-hidden="true" />
              Take what you need. Everything on this shelf is free; you pay with an install.
            </p>
          </div>
        </div>

        <ShopMenu packages={packages} />
      </div>
    </VideoPanel>
  );
}

export default Shop;
