import { useTypewriter } from "@/components/game/conversations/useTypewriter";
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
  const narrationText = useTypewriter(conversation.narration ?? "")

  const [npcDialogue, setNpcDialogue] = useState(narrationText ?? conversation.greeting);
  const [playerDialogue, setPlayerDialogue] = useState("");

  const inFlight = useRef(false);

  useEffect(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    sendPrompt(conversation.prompt, conversation.systemPrompt)
      .then((resp) => setNpcDialogue(resp))
      .finally(() => {
        inFlight.current = false;
      });

    return () => {
      inFlight.current = false; // reset if component unmounts mid-flight
    };
  }, [conversation]);

  function handleLeaveConversation() {
    send({ type: "FINISH_TALKING"})
  }

  function handleResponse() {
    sendPrompt(playerDialogue, conversation.systemPrompt)
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
        {npcDialogue}...
        <div id="controls">
          <input
            id="playerConversationInput"
            type="text"
            onChange={(e) => setPlayerDialogue(e.target.value)}
          />
          <button >Respond</button>
          <button onClick={handleLeaveConversation}>Leave</button>
        </div>
      </div>
    </div>
  );
}
