import { ComponentType } from "react";

type IFloorCeilingGrid = {
  width: number;
  length: number;
  tileSize: number;
  Model: ComponentType<{
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
  type: "floor" | "ceiling";
  height: number;
}

export default function FloorCeilingGrid({
  width,
  length,
  tileSize,
  Model,
  type = "floor",
  height = 0.1,
}: IFloorCeilingGrid) {
  const xOffset = (width * tileSize) / 2;
  const zOffset = (length * tileSize) / 2;

  return (
    <>
      {Array.from({ length: width }, (_, x) =>
        Array.from({ length: length }, (_, z) => (
          <Model
            key={`${x}-${z}`}
            rotation={type === "ceiling" ? [0, Math.PI, 0] : [0, 0, 0]}
            position={[x * tileSize - xOffset, height, z * tileSize - zOffset]}
          />
        )),
      )}
    </>
  );
}