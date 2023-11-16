"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { type SelectKnown, type SelectWord } from "~/server/db/schema";
import { Badge } from "./ui/badge";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Progress } from "./ui/progress";
import { usePathname, useRouter } from "next/navigation";

function pickRandomElement<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

type Practice = {
  words: Pick<SelectWord, "id" | "name" | "translation">[];
  knowns: SelectKnown["id"][];
  allWords: boolean;
};

enum RotationPosition {
  init = 1,
  middle,
}

const rotationInitStyle: CSSProperties = {
  transform: "rotate3d(0,1,0, 0deg)",
  transition: "transform 0.5s ease-in-out",
};

const rotationMiddleStyle: CSSProperties = {
  transform: "rotate3d(0,1,0, 90deg)",
  transition: "transform 0.5s ease-in-out",
};

enum RevealPosition {
  init = 1,
  middle,
}

const revealInitStyle: CSSProperties = {
  opacity: 0,
  transform: "translateY(80px)",
  transition: "opacity 0.5s, transform 0.5s ease-in-out",
};

const revealMiddleStyle: CSSProperties = {
  opacity: 1,
  transform: "translateY(-10px)",
  transition: "opacity 0.5s, transform 0.5s ease-in-out",
};

const ROTATE_TIMEOUT = 500;
const REVEAL_TIMEOUT = 1500;

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

  const [rotationPosition, setRotationPosition] = useState(
    RotationPosition.init,
  );
  const [revealPosition, setRevealPosition] = useState(RevealPosition.init);

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
    if (known.includes(lastTranslation!.id)) {
      deleteKnown.mutate({ wordId: lastTranslation!.id, userId: user!.id });
    }
    setLastTranslation(undefined);
    toast({
      title: "Back to last word",
      description: `${lastTranslation?.name} :: ${lastTranslation?.translation}`,
      variant: "default",
    });
  }, [lastTranslation, known, deleteKnown, toast, user]);

  const onSubmit = useCallback(
    (resolution: "easy" | "repeat") => {
      if (!currentTranslation) {
        alert("No translation to practice");
        return;
      }
      setLastTranslation(currentTranslation);
      if (resolution === "easy") {
        toast({
          title: "Too easy, understood",
          description: `${currentTranslation.name} :: ${currentTranslation.translation}`,
        });
        updateKnown.mutate({ wordId: currentTranslation.id, userId: user!.id });
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
      setRevealPosition(RevealPosition.middle);
      setTimeout(() => {
        setRevealPosition(RevealPosition.init);
        setTimeout(() => {
          setRotationPosition(RotationPosition.middle);
          setTimeout(() => {
            setCurrentTranslation(pair);
            setRotationPosition(RotationPosition.init);
          }, ROTATE_TIMEOUT);
        }, ROTATE_TIMEOUT);
      }, REVEAL_TIMEOUT);
    },
    [currentTranslation, words, toast, user, known, updateKnown],
  );

  return (
    <div className="flex flex-col items-stretch">
      <div className="my-5">
        <Input
          placeholder=""
          className="h-20 text-center text-xl"
          style={
            revealPosition === RevealPosition.init
              ? revealInitStyle
              : revealMiddleStyle
          }
          readOnly
          value={currentTranslation?.name ?? "-"}
          contentEditable={false}
        />
        <Input
          placeholder="My translation"
          className="h-20 text-center text-xl"
          style={
            rotationPosition === RotationPosition.middle
              ? rotationMiddleStyle
              : rotationInitStyle
          }
          readOnly
          value={currentTranslation?.translation ?? "-"}
          contentEditable={false}
        />
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Button variant="secondary" onClick={() => onSubmit("repeat")}>
          Need more practice
        </Button>
        <div className="flex gap-2 md:flex-col">
          <Button onClick={() => onSubmit("easy")}>Easy, skip this</Button>
          <Button
            disabled={!lastTranslation || revertBlocked}
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
        <Progress value={(known.length / words.length) * 100} />
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
