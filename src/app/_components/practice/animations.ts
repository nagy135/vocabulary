import { type CSSProperties } from "react";

export const ROTATE_TIMEOUT = 500;
export const REVEAL_TIMEOUT = 1500;

export enum RotationPosition {
  init = 1,
  middle,
}

export const rotationStyle: Record<RotationPosition, CSSProperties> = {
  [RotationPosition.init]: {
    transform: "rotate3d(0,1,0, 0deg)",
    transition: "transform 0.5s ease-in-out",
  },

  [RotationPosition.middle]: {
    transform: "rotate3d(0,1,0, 90deg)",
    transition: "transform 0.5s ease-in-out",
  },
};

export enum RevealPosition {
  init = 1,
  middle,
}

export const revealStyle: Record<RevealPosition, CSSProperties> = {
  [RevealPosition.init]: {
    opacity: 0,
    transform: "translateY(80px)",
    transition: "opacity 0.5s, transform 0.5s ease-in-out",
  },

  [RevealPosition.middle]: {
    opacity: 1,
    transform: "translateY(-10px)",
    transition: "opacity 0.5s, transform 0.5s ease-in-out",
  },
};
