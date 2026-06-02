"use client";
import { useState } from "react";
import { useKonami } from "@/hooks/useKonami";
import { PowBurst } from "@/components/effects/PowBurst";
import { TitleScreen } from "@/components/sections/TitleScreen";
import { CharacterSelect } from "@/components/sections/CharacterSelect";
import { CampaignLog } from "@/components/sections/CampaignLog";
import { BossFights } from "@/components/sections/BossFights";
import { PowerUpShop } from "@/components/sections/PowerUpShop";
import { Archives } from "@/components/sections/Archives";
import { Transmissions } from "@/components/sections/Transmissions";
import { SideQuests } from "@/components/sections/SideQuests";
import { Inventory } from "@/components/sections/Inventory";
import { TrophyRoom } from "@/components/sections/TrophyRoom";
import { ContinueScreen } from "@/components/sections/ContinueScreen";

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  useKonami(() => setUnlocked(true));
  return (
    <main>
      <TitleScreen />
      <CharacterSelect />
      <CampaignLog />
      <BossFights />
      <PowerUpShop />
      <Archives />
      <Transmissions />
      <SideQuests />
      <Inventory />
      <TrophyRoom />
      <ContinueScreen />
      {unlocked && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90]">
          <PowBurst word="1UP! KONAMI UNLOCKED" />
        </div>
      )}
    </main>
  );
}
