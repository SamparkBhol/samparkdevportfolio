import { cn } from "@/lib/cn";
/** "THE JOB / 仕事 shigoto": the English word, the Japanese mark, and its reading. Never Japanese alone. */
export function Kanji({ en, jp, romaji, className }: { en: string; jp?: string; romaji?: string; className?: string }) {
  return (
    <span className={cn("kanji", className)}>
      <span>{en}</span>
      {jp ? <> <span aria-hidden="true">/</span> <span lang="ja">{jp}</span> <span style={{ opacity: 0.8 }}>{romaji}</span></> : null}
    </span>
  );
}
