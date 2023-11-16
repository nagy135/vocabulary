import { type CSSProperties } from "react";

export const ROTATE_TIMEOUT = 500;
export const REVEAL_TIMEOUT = 1500;

export enum RotationPosition {
  init = 1,
  middle,
}

export const rotationInitStyle: CSSProperties = {
  transform: "rotate3d(0,1,0, 0deg)",
  transition: "transform 0.5s ease-in-out",
};

export const rotationMiddleStyle: CSSProperties = {
  transform: "rotate3d(0,1,0, 90deg)",
  transition: "transform 0.5s ease-in-out",
};

export enum RevealPosition {
  init = 1,
  middle,
}

export const revealInitStyle: CSSProperties = {
  opacity: 0,
  transform: "translateY(80px)",
  transition: "opacity 0.5s, transform 0.5s ease-in-out",
};

export const revealMiddleStyle: CSSProperties = {
  opacity: 1,
  transform: "translateY(-10px)",
  transition: "opacity 0.5s, transform 0.5s ease-in-out",
};
