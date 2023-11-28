"use client";

import { useTheme } from "next-themes";
import { type CSSProperties, useRef, useState } from "react";
import { useAnimationFrame } from "../hooks/use-animation";

type Piece = {
  path: string;
  center: {
    x: number;
    y: number;
  };
};

const pieces: Piece[] = [
  {
    center: {
      x: 113,
      y: 43,
    },
    path: `M 6.408 5 L 19.473 5 C 19.543 4.998 19.612 5.015 19.673 5.048
C 19.732 5.081 19.782 5.127 19.817 5.184 L 35.724 30.576 C 35.811 30.707
35.811 30.876 35.724 31.007 L 29.216 41.374 C 29.18 41.43 29.13 41.477 29.072
41.51 C 28.95 41.577 28.802 41.577 28.679 41.51 C 28.621 41.477 28.571 41.43
28.535 41.374 L 6.064 5.615 C 6.025 5.555 6.003 5.487 6 5.416 C 5.997 5.343
6.013 5.272 6.048 5.208 C 6.084 5.145 6.136 5.092 6.2 5.056 C 6.263 5.018 6.335 4.999 6.408 5 Z`,
  },
  {
    center: {
      x: 60,
      y: 67,
    },
    path: `M 33.795 5 L 51.295 5 C 51.368 4.999 51.44 5.018 51.503 5.056
C 51.558 5.095 51.602 5.147 51.631 5.208 C 51.665 5.272 51.682 5.344 51.679
5.416 C 51.681 5.485 51.664 5.554 51.631 5.615 L 42.889 19.554 C 42.853
19.611 42.804 19.657 42.745 19.69 C 42.623 19.757 42.475 19.757 42.353
19.69 C 42.294 19.657 42.245 19.611 42.209 19.554 L 33.459 5.615 C 33.42
5.555 33.398 5.487 33.395 5.416 C 33.392 5.343 33.408 5.272 33.443 5.208
C 33.479 5.145 33.531 5.092 33.595 5.056 C 33.655 5.02 33.724 5.001 33.795 5 Z`,
  },
];

const FORCE_MULTIPLIER = 0.3;
const CURSOR_FORCE_MULTIPLIER = 5;
const FORCE_DAMPENING = 0.1;

const WIDTH = 150;
const HEIGHT = 150;

const euclideanDistance = (
  x: number,
  y: number,
  x2: number,
  y2: number,
): number => {
  return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
};

const movementToCss = (force: [number, number]): CSSProperties => {
  const newX = mapRange(force[0] * FORCE_MULTIPLIER, -200, 200, -50, 50);
  const newY = mapRange(force[1] * FORCE_MULTIPLIER, -200, 200, -50, 50);
  return {
    transform: `translate(${newX}px, ${newY}px)`,
  };
};

const applyForces = (
  force: number,
  movement: number,
  distance: number,
): number => {
  return (
    (force + movement * CURSOR_FORCE_MULTIPLIER) *
    mapRange(distance, 0, WIDTH, 0, 1)
  );
};

function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export default function Logo() {
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [pieceForces, setPieceForces] = useState<[number, number][]>(
    pieces.map(() => [0, 0]),
  );

  useAnimationFrame((deltaTime) => {
    setPieceForces((prevForces) => {
      return prevForces.map((pieceForce) => {
        return [
          pieceForce[0] * (FORCE_DAMPENING * deltaTime),
          pieceForce[1] * (FORCE_DAMPENING * deltaTime),
        ];
      });
    });
  });

  return (
    <svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 57.09 45.74"
      ref={svgRef}
      style={{
        marginTop: 50,
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        fill: theme === "dark" ? "#fff" : "#0b0b0b",
        fillRule: "evenodd",
      }}
      onMouseMove={(e) => {
        setPieceForces((prev) =>
          prev.map((pieceForce, i) => {
            const piece = pieces[i]!;

            const movementX =
              e.clientX - (svgRef.current?.getBoundingClientRect()?.x ?? 0);
            const movementY =
              e.clientY - (svgRef.current?.getBoundingClientRect()?.y ?? 0);

            const distance = euclideanDistance(
              movementX,
              movementY,
              piece.center.x,
              piece.center.y,
            );

            return [
              applyForces(pieceForce[0], e.movementX, distance),
              applyForces(pieceForce[1], e.movementY, distance),
            ];
          }),
        );
      }}
    >
      <title>v</title>
      {pieces.map((piece, i) => {
        return (
          <path
            style={movementToCss(pieceForces[i]!)}
            key={`path-${i}`}
            d={piece.path}
          />
        );
      })}
    </svg>
  );
}
