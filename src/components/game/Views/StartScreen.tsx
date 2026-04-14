export default function StartScreen({
  handleStart,
}: {
  handleStart: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-1000"
      style={{
        backgroundImage: 'url("/images/backgrounds/startArt.png")',
        backgroundSize: "cover",
        backgroundPositionX: "-200px",
      }}
    >
      <div className="bg-black/40 text-red-400 w-full h-screen flex flex-col items-end justify-end p-8">
        <button
          onClick={handleStart}
          className="border-amber-200 border-2 rounded-md p-4 cursor-pointer bg-black hover:bg-red-700 hover:text-amber-300 w-40"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
