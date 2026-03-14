import { ComponentType } from "react";

type IFloorCeilingGrid = {
  size: number;
  tileSize: number;
  Model: ComponentType<{
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
  type: "floor" | "ceiling";
  height: number;
}

export default function FloorCeilingGrid({
  size,
  tileSize,
  Model,
  type = "floor",
  height = 0.1,
}: IFloorCeilingGrid) {
  const offset = (size * tileSize) / 2;

  return (
    <>
      {Array.from({ length: size }, (_, x) =>
        Array.from({ length: size }, (_, z) => (
          <Model
            key={`${x}-${z}`}
            rotation={type === "ceiling" ? [0, Math.PI, 0] : [0, 0, 0]}
            position={[x * tileSize - offset, height, z * tileSize - offset]}
          />
        )),
      )}
    </>
  );
}
