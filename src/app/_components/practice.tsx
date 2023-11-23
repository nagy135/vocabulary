"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type SelectKnown, type SelectWord } from "~/server/db/schema";
import { Badge } from "./ui/badge";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Progress } from "./ui/progress";
import { usePathname, useRouter } from "next/navigation";
import { AnimationPosition, useAnimation } from "~/animation";
import { PageUrl } from "~/enums";
import useScreenWidth from "../hooks/use-screen-width";

function pickRandomElement<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

type Practice = {
  words: Pick<SelectWord, "id" | "name" | "translation">[];
  knowns: SelectKnown["id"][];
  allWords: boolean;
};

const REVEAL_TIMEOUT = 1200;

export function Practice({ words, knowns, allWords }: Practice) {
  const [currentTranslation, setCurrentTranslation] = useState<
    (typeof words)[0] | undefined
    // TODO: this can pick known word as well
  >(undefined);
  const [lastTranslation, setLastTranslation] = useState<
    (typeof words)[0] | undefined
  >(undefined);
  const [known, setKnown] = useState<number[]>([]);
  const [revertBlocked, setRevertBlocked] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [inputFlyPos, setInputFlyPos] = useState<[number, number]>([0, 0]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isKnownReveal, setIsKnownReveal] = useState(false);

  const screenWidth = useScreenWidth();

  const {
    setPosition: setRotationPosition,
    style: rotationStyle,
    timeout: rotationTimeout,
  } = useAnimation({
    variety: "rotate",
    offset: { init: 0, middle: 90 },
    timeout: { init: 230, middle: 230 },
  });
  const { setPosition: setRevealPosition, style: revealStyle } = useAnimation({
    variety: "reveal-y",
    offset: { init: 80, middle: -10 },
    timeout: { init: 250, middle: 250 },
  });

  const {
    setPosition: setKnownRevealPosition,
    style: knownRevealStyle,
    timeout: knownRevealTimeout,
  } = useAnimation({
    variety: "reveal-y",
    offset: { init: 80, middle: 80 },
    timeout: { init: 200, middle: 1000 },
  });

  useLayoutEffect(() => {
    const inputPosition = (): [number, number] => {
      if (!inputRef) return [0, 0];
      const rect = inputRef.current?.getBoundingClientRect();
      const target = document
        .getElementById("navigation-Learned")
        ?.getBoundingClientRect();
      if (rect && target) {
        return [
          -rect.left + target.left - rect.width / 2 + target.width / 2,
          -rect.top + target.top - rect.height / 2 + target.height / 2,
        ];
      } else {
        return [0, 0];
      }
    };

    setInputFlyPos(inputPosition());
  }, [screenWidth]);

  const {
    setPosition: setFlyPosition,
    style: flyStyle,
    timeout: flyTimeout,
  } = useAnimation({
    variety: "fly-into",
    offset: {
      init: { x: 0, y: 0 },
      middle: {
        x: inputFlyPos[0],
        y: inputFlyPos[1],
      },
    },
    timeout: { init: 200, middle: 1200 },
  });

  const {
    setPosition: setPulsePosition,
    style: pulseStyle,
    timeout: pulseTimeout,
  } = useAnimation({
    variety: "pulse",
    offset: {
      init: 1,
      middle: 1.1,
    },
    timeout: { init: 200, middle: 100 },
  });

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    setCurrentTranslation(pickRandomElement(words));
    setKnown(knowns);
  }, [knowns, words]);

  const updateKnown = api.known.create.useMutation({
    onMutate: () => setRevertBlocked(true),
    onSuccess: (_data, { wordId }) => {
      setKnown((e) => [...e, wordId]);
      setRevertBlocked(false);
    },
  });

  const deleteKnown = api.known.delete.useMutation({
    onMutate: () => setRevertBlocked(true),
    onSuccess: (_data, { wordId }) => {
      setKnown((e) => e.filter((item) => item !== wordId));
      setRevertBlocked(false);
    },
  });

  const revertLastChoice = useCallback(() => {
    setCurrentTranslation(lastTranslation);
    setLastTranslation(undefined);
    if (known.includes(lastTranslation!.id)) {
      deleteKnown.mutate({ wordId: lastTranslation!.id, userId: user!.id });
      router.prefetch(PageUrl.learned);
    }
    toast({
      title: "Back to last word",
      variant: "default",
    });
    setPulsePosition(AnimationPosition.middle);
    setTimeout(() => {
      setPulsePosition(AnimationPosition.init);
    }, pulseTimeout.middle);
  }, [
    lastTranslation,
    known,
    deleteKnown,
    toast,
    user,
    pulseTimeout,
    router,
    setPulsePosition,
    setCurrentTranslation,
  ]);

  const onSubmit = useCallback(
    (resolution: "easy" | "repeat") => {
      if (!currentTranslation) {
        alert("No translation to practice");
        return;
      }
      setLastTranslation(currentTranslation);
      if (resolution === "easy") {
        updateKnown.mutate({ wordId: currentTranslation.id, userId: user!.id });
        setPulsePosition(AnimationPosition.middle);
        router.prefetch(PageUrl.learned);
        setTimeout(() => {
          setPulsePosition(AnimationPosition.init);
        }, pulseTimeout.middle);
      }
      if (known.length === words.length) {
        toast({
          title: "YOU KNOW IT ALL!",
        });
        setCurrentTranslation(undefined);
        return;
      }

      let pair = pickRandomElement(words);
      if (!pair) {
        toast({
          title: "No more pairs to practice",
        });
        return;
      }
      while (
        known.includes(pair.id) ||
        (pair.id === currentTranslation.id && words.length - known.length > 1)
      ) {
        pair = pickRandomElement(words);
        if (!pair) {
          toast({
            title: "No more pairs to practice",
          });
          return;
        }
      }

      setAnimationInProgress(true);
      if (resolution === "easy") {
        setIsKnownReveal(true);
        setFlyPosition(AnimationPosition.middle);
        setKnownRevealPosition(AnimationPosition.middle);
        setTimeout(() => {
          setKnownRevealPosition(AnimationPosition.init);
        }, knownRevealTimeout.middle);
        setTimeout(() => {
          setCurrentTranslation(pair);
          setFlyPosition(AnimationPosition.init);
          setTimeout(() => {
            setAnimationInProgress(false);
          }, flyTimeout.init);
        }, flyTimeout.middle);
      } else {
        setIsKnownReveal(false);
        setRevealPosition(AnimationPosition.middle);
        setTimeout(() => {
          setRevealPosition(AnimationPosition.init);
          setTimeout(() => {
            setRotationPosition(AnimationPosition.middle);
            setTimeout(() => {
              setCurrentTranslation(pair);
              setRotationPosition(AnimationPosition.init);
              setAnimationInProgress(false);
            }, rotationTimeout.init);
          }, rotationTimeout.middle);
        }, REVEAL_TIMEOUT);
      }
    },
    [
      currentTranslation,
      words,
      user,
      toast,
      known,
      updateKnown,
      knownRevealTimeout,
      pulseTimeout,
      rotationTimeout,
      flyTimeout,
      router,
      setPulsePosition,
      setRevealPosition,
      setRotationPosition,
      setCurrentTranslation,
      setAnimationInProgress,
      setKnownRevealPosition,
      setIsKnownReveal,
      setFlyPosition,
    ],
  );

  return (
    <div className="flex flex-col items-stretch">
      <div className="my-5">
        <Input
          placeholder=""
          className="h-20 text-center text-xl"
          style={isKnownReveal ? knownRevealStyle : revealStyle}
          readOnly
          value={currentTranslation?.name ?? "-"}
          contentEditable={false}
        />
        <Input
          id="translation-input"
          placeholder="My translation"
          className="h-20 text-center text-xl"
          ref={inputRef}
          style={{ ...rotationStyle, ...flyStyle }}
          readOnly
          value={currentTranslation?.translation ?? "-"}
          contentEditable={false}
        />
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Button variant="secondary" onClick={() => onSubmit("repeat")}>
          Need more practice
        </Button>
        <div className="flex justify-between gap-2 md:flex-col">
          <Button
            disabled={revertBlocked || animationInProgress}
            onClick={() => onSubmit("easy")}
          >
            Easy, skip this
          </Button>
          <Button
            disabled={!lastTranslation || revertBlocked || animationInProgress}
            variant="destructive"
            onClick={() => revertLastChoice()}
          >
            Go back to last
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 flex w-full items-center gap-5 p-2">
        <Badge variant="default" className="text-md">
          {known.length}/{words.length}
        </Badge>
        <Progress
          style={pulseStyle}
          value={(known.length / words.length) * 100}
        />
        <Button
          onClick={() => {
            if (allWords) {
              router.replace(pathname);
            } else {
              router.replace(
                pathname +
                  "?" +
                  new URLSearchParams({ all: "true" }).toString(),
              );
            }
          }}
          variant="outline"
        >
          {allWords ? "My words" : "All words"}
        </Button>
      </div>
    </div>
  );
}
