import { useGameMachine } from "@/contexts/GameMachineContext";
import { sendPrompt } from "@/lib/Anthropic/client";
import { ConversationTrigger } from "@/machines/gameMachine/types";
import { useEffect, useRef, useState } from "react";

export default function DialogueView({
  conversation,
}: {
  conversation: ConversationTrigger;
}) {
  const [, send] = useGameMachine();

  const [npcDialogue, setNpcDialogue] = useState<string | null>(null);
  const [playerDialogue, setPlayerDialogue] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([{ role: "user", content: conversation.prompt }]);

  useEffect(() => {
    const initialMessage = {
      role: "user" as const,
      content: conversation.prompt,
    };

    async function initiateDialogue() {
      try {
        const resp = await sendPrompt(
          [initialMessage],
          conversation.systemPrompt,
        );
        const dialogue = resp.reply.text;

        setNpcDialogue(dialogue);
        setHistory([
          initialMessage,
          { role: "assistant" as const, content: dialogue },
        ]);
      } catch (error) {
        console.error("Failed to fetch initial dialogue:", error);
      } finally {
        setLoading(false);
      }
    }

    initiateDialogue();
  }, [conversation.prompt, conversation.systemPrompt]);

  function handleLeaveConversation() {
    setHistory([]);
    send({ type: "FINISH_TALKING" });
  }

  async function handleResponse() {
    if (loading) return;
    setLoading(true);
    const nextHistory = [
      ...history,
      { role: "user" as const, content: playerDialogue },
    ];
    setHistory(nextHistory);
    setPlayerDialogue("");
    const resp = await sendPrompt(nextHistory, conversation.systemPrompt);
    const dialogue = resp.reply.text;
    // const calledTools = resp.reply.calledTools; // TODO: open shop with STATE MACHINE CALL
    setNpcDialogue(dialogue);
    if (dialogue) {
      setHistory([
        ...history,
        { role: "assistant" as const, content: npcDialogue! },
      ]);
    }
    const calledTools = resp.reply.calledTools;
    if (calledTools.length > 0 && calledTools.includes("vanish")) {
      // send({ type: "VANISH_NPC", npcId: conversation.npcId })  //TODO: make npc disappear:
      handleLeaveConversation();
    }
    setLoading(false);
  }

  return (
    <div
      id="mainWindow"
      className="absolute inset-0 z-1000 bg-black/05 flex flex-col items-center justify-end "
    >
      <div
        id="chatbox"
        className="bg-black/70 text-amber-200 w-180 aspect-ratio-2/1 flex flex-col items-center justify-center p-8 mb-20 rounded-sm"
      >
        {!showNext && (
          <p className="text-gray-400 italic max-w-120 whitespace-prewrap">
            {conversation.narration}
          </p>
        )}
        {showNext ? (
          <>
            {npcDialogue && <p className="text-amber-200">{npcDialogue}</p>}

            <div
              id="controls"
              className="w-full flex flex-col justify-center items-center  text-black"
            >
              <input
                id="playerConversationInput"
                type="text"
                placeholder="your response..."
                className="w-full bg-white rounded-xs mt-2 px-2"
                value={playerDialogue}
                onChange={(e) => setPlayerDialogue(e.target.value)}
              />
              <div
                id="convoBtns"
                className="w-full flex justify-around items-center mt-2"
              >
                <button
                  id="playerRespondBtn"
                  disabled={loading}
                  className="w-25 rounded-sm border-2 border-white p-3 cursor-pointer hover:bg-white hover:text-black text-amber-400"
                  onClick={handleResponse}
                >
                  Respond
                </button>
                <button
                  id="leaveConvoBtn"
                  className="w-25 rounded-sm border-2 border-white p-3 cursor-pointer hover:bg-white hover:text-black text-amber-400"
                  onClick={handleLeaveConversation}
                >
                  Leave
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => setShowNext(true)}
            className="w-25 rounded-sm border-2 border-white p-3 cursor-pointer hover:bg-white hover:text-black text-amber-400"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
