export type VideoKey = "city" | "rain" | "bedroom" | "road" | "arena" | "gold" | "planet" | "hell";
export interface VideoAsset { key: VideoKey; base: string; label: string }

/** Every loop ships as <base>-1080.mp4, <base>-720.mp4 and <base>-poster.webp (see scripts/encode-videos.sh). */
export const VIDEOS: Record<VideoKey, VideoAsset> = {
  city: { key: "city", base: "/video/pixel-cyberpunk-city", label: "A pixel-art neon street at night" },
  rain: { key: "rain", base: "/video/anime-town-rainfall", label: "Rain on a lantern-lit Japanese street" },
  bedroom: { key: "bedroom", base: "/video/cyberpunk-bedroom", label: "A dim bedroom with a window onto a neon city" },
  road: { key: "road", base: "/video/the-drive-on-the-road-at-sunset", label: "A car on a highway toward a sunset" },
  arena: { key: "arena", base: "/video/hornet-and-the-knight", label: "Two small figures resting in a dark cavern" },
  gold: { key: "gold", base: "/video/elden-ring-pixel", label: "A golden pixel ring over a cave" },
  planet: { key: "planet", base: "/video/planet-and-moon", label: "A tiny pixel planet and its moon" },
  hell: { key: "hell", base: "/video/ultrakill-heaven-sent", label: "Red hands reaching up under the words mankind is dead" },
};

export const videoSrc = (v: VideoAsset, tier: "1080" | "720") => `${v.base}-${tier}.mp4`;
export const videoPoster = (v: VideoAsset) => `${v.base}-poster.webp`;
export const videoPosterSmall = (v: VideoAsset) => `${v.base}-poster-720.webp`;
/** The loop printed on the book's front cover (960 px, 8 s). */
export const COVER_ART_SRC = "/video/anime-town-rainfall-cover.mp4";
export const COVER_ART_POSTER = "/video/anime-town-rainfall-poster.webp";
