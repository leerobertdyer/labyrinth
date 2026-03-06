import { ComponentType } from "react";

interface IFloorGrid {
    size: number;
    tileSize: number;
    Model: ComponentType<{ position: [number, number, number] }>
  }
  
  export default function FloorGrid({ size, tileSize, Model }: IFloorGrid) {
    const offset = (size * tileSize) / 2
  
    return (
      <>
        {Array.from({ length: size }, (_, x) =>
          Array.from({ length: size }, (_, z) => (
            <Model
              key={`${x}-${z}`}
              position={[
                x * tileSize - offset,
                -0.1,
                z * tileSize - offset
              ]}
            />
          ))
        )}
      </>
    )
  }