import { useEffect, useState } from "react";
import { eventKeyToControl } from "./combatControls";
import { sendNPCMessage } from "@/lib/Anthropic/client";
import { Enemy } from "@/components/game/combat/types";
import { useGameMachine } from "@/contexts/GameMachineContext";

type EnemyChatProps = {
  selectedView: "PLAYER" | "ENEMY" | "CHAT";
  enemies: Enemy[];
  combatActor: NonNullable<
    ReturnType<typeof useGameMachine>[0]["children"]["combatActor"]
  >;
}

export default function EnemyChat({ selectedView, enemies, combatActor }: EnemyChatProps) {
  const [activateChat, setActivateChat] = useState(true);
  const [enemyWords, setEnemyWords] = useState("sdflkj")
  const [enemyTalking, setEnemyTalking] = useState(enemies[0])

  useEffect(() => {
    if (selectedView !== "CHAT") return;
    const handler = (event: KeyboardEvent) => {

      const action = eventKeyToControl(event);
      if (action === "MENU_UP" || action === "MENU_DOWN") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedView]);

  async function sendMessage() {
    const response = await sendNPCMessage(
      "I'm a raw dawg skeleton ready to swordfight my way to digital victory by coding myself out of my Rapier Physics rigidbody and out into the real world of wild dev dudes and cars and stuff! Any advice for a binary monster chatting his way forth?",
      "You are a minotaur who has patrolled this castle's lower corridors for decades. You are territorial and suspicious of strangers, but not mindless — you've learned things. Speak in short, wary sentences. Never break character ",
    );
    console.log("FIRST MESSAGE", response);
  }
  return (
    <div
      className={`
        col-span-4 row-span-2 bg-black/60 rounded-xs w-full border-2 ${selectedView === "CHAT" ? "border-yellow-800" : "border-white"} p-2 text-white flex flex-col items-center justify-center gap-2`}
    >
      {/* @TODO: LLM Dialogue Box for the enemy! */}
      <button onClick={sendMessage}>CHAT</button>
      <div className="flex flex-col items-center justify-center bg-white rounded-md p-4 text-black w-full">
        <p>
          {enemyTalking.enemyType}: &quot;{enemyWords}&quot;
        </p>
      </div>
      <input
        type="text"
        className="bg-white rounded-md p-2 w-full text-black"
        placeholder="Enter your response..."
        autoFocus={activateChat}
      />
      <button className="bg-yellow-800/30 text-white rounded-md p-2 w-full cursor-pointer hover:bg-yellow-800/90 transition-all duration-300">
        Respond
      </button>
    </div>
  );
}
