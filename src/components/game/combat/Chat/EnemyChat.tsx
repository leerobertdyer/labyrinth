import { useEffect, useState } from "react";
import { sendPrompt } from "@/lib/Anthropic/client";
import { Enemy } from "@/components/game/combat/types";
import { useGameMachine } from "@/contexts/GameMachineContext";
import {
  INITIATE_DIALOGE,
  willEnemyTalk,
} from "@/components/game/conversations/utils";

type EnemyChatProps = {
  selectedView: "PLAYER" | "ENEMY" | "CHAT";
  enemies: Enemy[];
  combatActor: NonNullable<
    ReturnType<typeof useGameMachine>[0]["children"]["combatActor"]
  >;
};

export default function EnemyChat({
  selectedView,
  enemies,
  combatActor,
}: EnemyChatProps) {
  const [activateChat, setActivateChat] = useState(false);
  const [enemyWords, setEnemyWords] = useState("...");
  const [enemyTalking, setEnemyTalking] = useState(enemies[0]);
  const [playerWords, setPlayerWords] = useState("");

  useEffect(() => {
    if (selectedView !== "CHAT") return;
    const initiateDialogue = async (prompt: string, system: string) => {
      return await sendPrompt(prompt, system);
    };
    const setupChat = () => {
      setActivateChat(true);
      const willTalk = willEnemyTalk(enemyTalking);
      if (willTalk) {
        initiateDialogue(INITIATE_DIALOGE, enemyTalking.systemPrompt).then(
          (data) => {
            setEnemyWords(data);
          },
        );
      }
    };
    setupChat();
  }, [selectedView, enemyTalking]);

  return (
    <div
      className={`
        col-span-4 row-span-2 
        bg-black/60 p-2 text-white 
        overflow-x-hidden max-h-50
        rounded-xs w-full border-2 
        flex flex-col items-center justify-center gap-2
        ${selectedView === "CHAT" ? "border-yellow-800" : "border-white"} 
        `}
    >
      <div className="flex flex-col items-center justify-center bg-white rounded-md p-4 text-black w-full">
        <p className="max-h-10 text-sm overflow-y-scroll">
          {enemyTalking.enemyType}: &quot;{enemyWords}&quot;
        </p>
      </div>
      <input
        type="text"
        className="bg-white rounded-md p-2 w-full text-black"
        placeholder="Enter your response..."
        autoFocus={activateChat}
        onChange={(e) => setPlayerWords(e.target.value)}
      />
      <button
        onClick={() =>
          sendPrompt(playerWords, enemies[0].systemPrompt).then((resp) =>
            setEnemyWords(resp),
          )
        }
        className="bg-yellow-800/30 text-white rounded-md p-2 w-full cursor-pointer hover:bg-yellow-800/90 transition-all duration-300"
      >
        Respond
      </button>
      <button
        className="bg-yellow-800/30 text-white rounded-md p-2 w-full cursor-pointer hover:bg-yellow-800/90 transition-all duration-300"
        onClick={() => {
          combatActor.send({ type: "SET_VIEW", view: "PLAYER" });
        }}
      >
        Exit Chat
      </button>
    </div>
  );
}
