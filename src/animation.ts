import { type CSSProperties, useState } from "react";

export enum AnimationPosition {
  init = 1,
  middle,
}

type AnimationProps = {
  timeout: { init: number; middle: number };
  orientation?: "horizontal" | "vertical";
} & (
  | {
      variety: "rotate" | "reveal-y" | "reveal-vh" | "reveal-hv" | "pulse";
      offset: { init: number; middle: number };
    }
  | {
      variety: "fly-into";
      offset: {
        init: { x: number; y: number };
        middle: { x: number; y: number };
      };
    }
);
export const useAnimation = ({
  variety,
  offset: { init, middle },
  timeout,
  orientation = "horizontal",
}: AnimationProps) => {
  const [position, setPosition] = useState<AnimationPosition>(
    AnimationPosition.init,
  );

  let style: Record<AnimationPosition, CSSProperties>;
  if (variety === "rotate") {
    style = {
      [AnimationPosition.init]: {
        transform: `rotate3d(0,1,0, ${init}deg)`,
        transition: `opacity ${timeout.init / 1000}s, transform ${
          timeout.init / 1000
        }s ease-in-out`,
      },

      [AnimationPosition.middle]: {
        transform: `rotate3d(0,1,0, ${middle}deg)`,
        transition: `opacity ${timeout.middle / 1000}s, transform ${
          timeout.middle / 1000
        }s ease-in-out`,
      },
    };
  } else if (variety === "reveal-y") {
    style = {
      [AnimationPosition.init]: {
        opacity: 0,
        transform: `translateY(${init}px)`,
        transition: `opacity ${timeout.init / 1000}s, transform ${
          timeout.init / 1000
        }s ease-in-out`,
      },

      [AnimationPosition.middle]: {
        opacity: 1,
        transform: `translateY(${middle}px)`,
        transition: `opacity ${timeout.middle / 1000}s, transform ${
          timeout.middle / 1000
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
        transition: `opacity ${timeout.init / 1000}s, transform ${
          timeout.init / 1000
        }s ease-in-out`,
      },

      [AnimationPosition.middle]: {
        opacity: 1,
        transform:
          orientation === "horizontal"
            ? `translateX(${middle}px)`
            : `translateY(${middle}px)`,
        transition: `opacity ${timeout.middle / 1000}s, transform ${
          timeout.middle / 1000
        }s ease-in-out`,
      },
    };
  } else if (variety === "pulse") {
    style = {
      [AnimationPosition.init]: {
        transform: `scale(${init})`,
        transition: `transform ${timeout.init / 1000}s ease-in-out`,
      },
      [AnimationPosition.middle]: {
        transform: `scale(${middle})`,
        transition: `transform ${timeout.init / 1000}s ease-in-out`,
      },
    };
  } else if (variety === "fly-into") {
    const { x, y } = init as { x: number; y: number };
    const { x: x2, y: y2 } = middle as { x: number; y: number };
    style = {
      [AnimationPosition.init]: {
        transform: `translate(${x}px, ${y}px) scale(1)`,
        opacity: 1,
        transition: `${timeout.init / 1000}s ease-in-out`,
      },
      [AnimationPosition.middle]: {
        opacity: 0.01,
        borderColor: "green",
        transform: `translate(${x2}px, ${y2}px) scale(0.5)`,
        transition: `${timeout.middle / 1000}s ease-in-out`,
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
        transition: `opacity ${timeout.init / 1000}s, transform ${
          timeout.init / 1000
        }s ease-in-out`,
      },

      [AnimationPosition.middle]: {
        opacity: 1,
        transform:
          orientation === "vertical"
            ? `translateX(${middle}px)`
            : `translateY(${middle}px)`,
        transition: `opacity ${timeout.middle / 1000}s, transform ${
          timeout.middle / 1000
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
