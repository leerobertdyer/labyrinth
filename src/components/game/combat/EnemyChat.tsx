interface EnemyChatProps {
  selectedView: "PLAYER" | "ENEMY" | "CHAT";
}

export default function EnemyChat({ selectedView }: EnemyChatProps) {
  return (
    <div
      className={`
        col-span-4 row-span-2 bg-black/60 rounded-xs w-full border-2 ${selectedView === "CHAT" ? "border-yellow-800" : "border-white"} p-2 text-white flex flex-col items-center justify-center gap-2`}
    >
      {/* @TODO: LLM Dialogue Box for the enemy! */}
      <div className="flex flex-col items-center justify-center bg-white rounded-md p-4 text-black w-full">
        <p>Skeleton: "You seem to be lost! I will not let you pass!"</p>
      </div>
      <input
        type="text"
        className="bg-white rounded-md p-2 w-full text-black"
        placeholder="Enter your response..."
      />
      <button className="bg-yellow-800/30 text-white rounded-md p-2 w-full cursor-pointer hover:bg-yellow-800/90 transition-all duration-300">
        Respond
      </button>
    </div>
  );
}
