export default function PlayerMenu() {
  return (
    <div className="col-span-2 row-span-6 bg-white rounded-xs w-full flex flex-col items-center justify-start pt-4 gap-4">
      <div
        className="rounded-md border-2 border-black p-4 h-[240px] w-[150px]"
        style={{
          backgroundImage: `url(/sprites/Hero.png)`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="flex flex-col items-center justify-center bg-gray-200 rounded-md p-4">
        <h1 className="text-black text-lg font-bold border-b-2 border-black mb-2">XXX's Actions</h1>
        <button className="w-full bg-blue-500 text-white rounded-md p-2">Attack</button>
        <button className="w-full bg-blue-500 text-white rounded-md p-2">Defend</button>
        <button className="w-full bg-blue-500 text-white rounded-md p-2">Item</button>
        <button className="w-full bg-blue-500 text-white rounded-md p-2">Run</button>
      </div>
    </div>
  );
}
