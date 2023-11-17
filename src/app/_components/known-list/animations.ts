import { type CSSProperties } from "react";

export enum RevealPosition {
  init = 1,
  middle,
}

export const revealStyleVertical: Record<RevealPosition, CSSProperties> = {
  [RevealPosition.init]: {
    opacity: 0,
    transform: "translateY(49px)",
    transition: "opacity 0.5s, transform 0.5s ease-in-out",
  },

  [RevealPosition.middle]: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: "opacity 0.5s, transform 0.5s ease-in-out",
  },
};

export const revealStyleHorizontal: Record<RevealPosition, CSSProperties> = {
  [RevealPosition.init]: {
    opacity: 0,
    transform: "translateX(49px)",
    transition: "opacity 0.5s, transform 0.5s ease-in-out",
  },

  [RevealPosition.middle]: {
    opacity: 1,
    transform: "translateX(0px)",
    transition: "opacity 0.5s, transform 0.5s ease-in-out",
  },
};
