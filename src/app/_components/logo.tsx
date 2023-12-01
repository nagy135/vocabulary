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
      x: 163,
      y: 101,
    },
    path: `M 15.674 13.58 L 22.809 13.58 C 22.845 13.579 22.884 13.587
22.918 13.606 C 22.951 13.627 22.977 13.652 22.995 13.681 L 31.684 27.569
C 31.727 27.643 31.727 27.736 31.684 27.806 L 28.127 33.475 C 28.109 33.508
28.079 33.533 28.051 33.55 C 27.982 33.59 27.902 33.59 27.834 33.55 C 27.803
33.533 27.777 33.508 27.757 33.475 L 15.484 13.918 C 15.465 13.883 15.451
13.849 15.45 13.806 C 15.448 13.77 15.457 13.729 15.476 13.695 C 15.495 13.658
15.524 13.63 15.559 13.608 C 15.595 13.589 15.633 13.579 15.674 13.58 Z`,
  },
  {
    center: {
      x: 110,
      y: 120,
    },
    path: `M 30.626 13.58 L 40.185 13.58 C 40.227 13.579 40.263 13.589 40.302
13.608 C 40.328 13.631 40.353 13.661 40.371 13.695 C 40.386 13.729 40.4 13.77
40.4 13.806 C 40.4 13.846 40.386 13.883 40.371 13.918 L 35.595 21.541 C 35.577
21.571 35.546 21.598 35.515 21.616 C 35.447 21.649 35.367 21.649 35.303 21.616
C 35.27 21.598 35.24 21.571 35.221 21.541 L 30.447 13.918 C 30.422 13.883 30.412
13.849 30.406 13.806 C 30.406 13.77 30.42 13.729 30.437 13.695 C 30.455 13.658
30.481 13.63 30.521 13.608 C 30.551 13.59 30.592 13.58 30.626 13.58 Z`,
  },
];

const FORCE_MULTIPLIER = 0.3;
const CURSOR_FORCE_MULTIPLIER = 4;
const FORCE_DAMPENING = 0.99;

const WIDTH = 250;
const HEIGHT = 250;

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
const k = 100; // NOTE: avoid rounding, 100 => [-3000,3000]
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z / k));
}

const applyForces = (
  force: number,
  movement: number,
  distance: number,
): number => {
  const distanceDebuff = mapRange(distance, 0, 100, 0, 1) * 0.3;
  return force + movement * distanceDebuff * CURSOR_FORCE_MULTIPLIER;
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
          pieceForce[0] * FORCE_DAMPENING,
          pieceForce[1] * FORCE_DAMPENING,
        ];
      });
    });
  }, 1000 / 140);

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
              applyForces(pieceForce[0], Math.min(e.movementX, 20), distance),
              applyForces(pieceForce[1], Math.min(e.movementY, 20), distance),
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
