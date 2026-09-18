import { Kanji } from "@/components/print/Kanji";

/* A strip pinned to the middle of the viewport while Extras scrolls. Under CSS scroll-driven
   animations it drifts from the right edge to the left edge with the page scroll (the named
   view timeline lives on the section, see extras.css); everywhere else it sits still and centred.
   Decorative: the block headings below carry the same words for readers and screen readers. */
export function BilingualStrip() {
  return (
    <div className="bstrip" aria-hidden="true">
      <div className="bstrip-inner">
        <Kanji en="PAPERS" jp="論文" romaji="ronbun" />
        <span className="bstrip-dot">·</span>
        <Kanji en="POSTS" jp="記事" romaji="kiji" />
        <span className="bstrip-dot">·</span>
        <Kanji en="CERTIFICATIONS" jp="資格" romaji="shikaku" />
      </div>
    </div>
  );
}
