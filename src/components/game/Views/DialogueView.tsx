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
  const [showNext, setShowNext] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const [history, setHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([{ role: "user", content: conversation.prompt }]);
  
  const inFlight = useRef(false);

  useEffect(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    sendPrompt(history, conversation.systemPrompt)
      .then((resp) => {
        const dialogue = resp.reply.text;
        // const toolsCalled = resp.reply.calledTools;

        setNpcDialogue(dialogue);
        setHistory((prev) => [
          ...prev,
          { role: "assistant" as const, content: dialogue },
        ]);
      })
      .finally(() => {
        inFlight.current = false;
        setShowControls(true);
      });

    return () => {
      inFlight.current = false;
    };
  }, [conversation.prompt, conversation.systemPrompt]);

  function handleLeaveConversation() {
    send({ type: "FINISH_TALKING" });
  }

  function handleResponse() {
    setShowControls(false);
    const nextHistory = [
      ...history,
      { role: "user" as const, content: playerDialogue },
    ];
    setHistory(nextHistory);
    sendPrompt(nextHistory, conversation.systemPrompt)
      .then((resp) => {
        const dialogue = resp.reply.text;
        // const toolsCalled = resp.reply.calledTools;
        setNpcDialogue(dialogue)})
      .finally(() => {
        inFlight.current = false;
        setShowControls(true);
      });
    setShowNext(true);
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
        <p className="text-gray-400 italic">{conversation.narration}</p>
        {showNext &&
          (npcDialogue ? (
            <p className="text-amber-200">{npcDialogue}</p>
          ) : (
            <p className="animate-pulse text-xl">...</p>
          ))}
        {showControls && (
          <div
            id="controls"
            className="w-full flex flex-col justify-center items-center  text-black"
          >
            <input
              id="playerConversationInput"
              type="text"
              placeholder="your response..."
              className="w-full bg-white rounded-xs mt-2 px-2"
              onChange={(e) => setPlayerDialogue(e.target.value)}
            />
            <div
              id="convoBtns"
              className="w-full flex justify-around items-center mt-2"
            >
              <button
                id="playerRespondBtn"
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
        )}
      </div>
    </div>
  );
}
