import { useEffect, useState } from "react";
import { sendPrompt } from "@/lib/Anthropic/client";
import { Enemy } from "@/components/game/combat/types";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { willEnemyTalk } from "@/components/game/conversations/utils";
import { INITIATE_DIALOGE } from "@/components/game/conversations/prompts";

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
  const [history, setHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  useEffect(() => {
    if (selectedView !== "CHAT") return;
    const initiateDialogue = async (prompt: string, system: string) => {
      const nextHistory = [
        { role: "user" as const, content: INITIATE_DIALOGE },
      ];
      setHistory(nextHistory);
      return await sendPrompt(nextHistory, system);
    };
    const setupChat = () => {
      setActivateChat(true);
      const willTalk = willEnemyTalk(enemyTalking);
      if (willTalk) {
        initiateDialogue(INITIATE_DIALOGE, enemyTalking.systemPrompt).then(
          (data) => {
            const dialogue = data.reply.text;
            // const toolsCalled = data.reply.toosCalled;
            setEnemyWords(dialogue);
          },
        );
      }
    };
    setupChat();
  }, [selectedView, enemyTalking]);

  function handlePlayerResponse() {
    const nextHistory = [
      ...history,
      { role: "user" as const, content: playerWords },
    ];
    setHistory(nextHistory);
    sendPrompt(nextHistory, enemies[0].systemPrompt)
      .then((data) => {
        const dialogue = data.reply.text;
        // const toolsCalled = data.reply.toosCalled;
        setEnemyWords(dialogue);
      })
      .finally(() => setPlayerWords(""));
  }

  return (
    <div
      className={`
        col-span-4 row-span-2 
        bg-black/60 p-10 text-white 
        overflow-x-hidden max-h-50
        rounded-xs w-full border-2 
        flex flex-col items-center justify-center gap-2
        ${selectedView === "CHAT" ? "border-yellow-800" : "border-white"} 
        `}
    >
      <div className="flex flex-col items-center justify-center bg-white rounded-md p-4 mt-8 text-black w-full">
        <p className="max-h-10 text-sm overflow-y-scroll">
          {enemyTalking.enemyType}: &quot;{enemyWords}&quot;
        </p>
      </div>
      <input
        value={playerWords}
        className="bg-white rounded-md p-2 w-full text-black"
        placeholder="Enter your response..."
        autoFocus={activateChat}
        onChange={(e) => setPlayerWords(e.target.value)}
      />
      <div id="btns" className="w-full flex justify-around items-center gap-2">
        <button
          className="bg-yellow-800/30 text-white rounded-md p-2 w-full cursor-pointer hover:bg-yellow-800/90 transition-all duration-300"
          onClick={() => {
            combatActor.send({ type: "SET_VIEW", view: "PLAYER" });
          }}
        >
          Exit Chat
        </button>
        <button
          onClick={() => handlePlayerResponse()}
          className="bg-yellow-800/30 text-white rounded-md p-2 w-full cursor-pointer hover:bg-yellow-800/90 transition-all duration-300"
        >
          Respond
        </button>
      </div>
    </div>
  );
}
