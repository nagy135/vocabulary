import { type CSSProperties, useState } from "react";

export enum AnimationPosition {
  init = 1,
  middle,
}
export const useAnimation = ({
  variety,
  offset: { init, middle },
  timeout,
  orientation = "horizontal",
}: {
  variety: "rotate" | "reveal-y" | "reveal-vh" | "reveal-hv" | "pulse";
  offset: { init: number; middle: number };
  timeout: number;
  orientation?: "horizontal" | "vertical";
}) => {
  const [position, setPosition] = useState<AnimationPosition>(
    AnimationPosition.init,
  );

  let style: Record<AnimationPosition, CSSProperties>;
  if (variety === "rotate") {
    style = {
      [AnimationPosition.init]: {
        transform: `rotate3d(0,1,0, ${init}deg)`,
        transition: `opacity ${timeout / 1000}s, transform ${
          timeout / 1000
        }s ease-in-out`,
      },

      [AnimationPosition.middle]: {
        transform: `rotate3d(0,1,0, ${middle}deg)`,
        transition: `opacity ${timeout / 1000}s, transform ${
          timeout / 1000
        }s ease-in-out`,
      },
    };
  } else if (variety === "reveal-y") {
    style = {
      [AnimationPosition.init]: {
        opacity: 0,
        transform: `translateY(${init}px)`,
        transition: `opacity ${timeout / 1000}s, transform ${
          timeout / 1000
        }s ease-in-out`,
      },

      [AnimationPosition.middle]: {
        opacity: 1,
        transform: `translateY(${middle}px)`,
        transition: `opacity ${timeout / 1000}s, transform ${
          timeout / 1000
        }s ease-in-out`,
      },
    };
  } else if (variety === "reveal-hv") {
    style = {
      [AnimationPosition.init]: {
        opacity: 0,
        transform:
          orientation === "horizontal"
            ? `translateX(${init}px)`
            : `translateY(${init}px)`,
        transition: `opacity ${timeout / 1000}s, transform ${
          timeout / 1000
        }s ease-in-out`,
      },

      [AnimationPosition.middle]: {
        opacity: 1,
        transform:
          orientation === "horizontal"
            ? `translateX(${middle}px)`
            : `translateY(${middle}px)`,
        transition: `opacity ${timeout / 1000}s, transform ${
          timeout / 1000
        }s ease-in-out`,
      },
    };
  } else if (variety === "pulse") {
    style = {
      [AnimationPosition.init]: {
        transform: `scale(${init})`,
        transition: `transform ${timeout / 1000}s ease-in-out`,
      },
      [AnimationPosition.middle]: {
        transform: `scale(${middle})`,
        transition: `transform ${timeout / 1000}s ease-in-out`,
      },
    };
  } else {
    style = {
      [AnimationPosition.init]: {
        opacity: 0,
        transform:
          orientation === "vertical"
            ? `translateX(${init}px)`
            : `translateY(${init}px)`,
        transition: `opacity ${timeout / 1000}s, transform ${
          timeout / 1000
        }s ease-in-out`,
      },

      [AnimationPosition.middle]: {
        opacity: 1,
        transform:
          orientation === "vertical"
            ? `translateX(${middle}px)`
            : `translateY(${middle}px)`,
        transition: `opacity ${timeout / 1000}s, transform ${
          timeout / 1000
        }s ease-in-out`,
      },
    };
  }

  return {
    setPosition,
    timeout,
    style: style[position],
  };
};
