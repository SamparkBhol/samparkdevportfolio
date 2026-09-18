import { Cover } from "@/components/cover/Cover";
import { Select } from "@/components/chapters/Select";
import { Campaign } from "@/components/chapters/Campaign";
import { BossFights } from "@/components/chapters/BossFights";
import { Shop } from "@/components/chapters/Shop";
import { Arcade } from "@/components/chapters/Arcade";
import { SideQuests } from "@/components/chapters/SideQuests";
import { Archives } from "@/components/chapters/Archives";
import { Transmissions } from "@/components/chapters/Transmissions";
import { Inventory } from "@/components/chapters/Inventory";
import { TrophyRoom } from "@/components/chapters/TrophyRoom";
import { Continue } from "@/components/chapters/Continue";
import { Fox } from "@/components/companion/Fox";
import { Cursor } from "@/components/chrome/Cursor";
import { PageFx } from "@/components/motion/PageFx";

/* The issue, front to back: twelve chapters, every one read from src/content/resume.ts. */
export default function Home() {
  return (
    <main>
      <PageFx />
      <Cover />
      <Select />
      <Campaign />
      <BossFights />
      <Shop />
      <Arcade />
      <SideQuests />
      <Archives />
      <Transmissions />
      <Inventory />
      <TrophyRoom />
      <Continue />
      <Fox />
      <Cursor />
    </main>
  );
}
