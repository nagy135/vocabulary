"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { type PracticePair } from "~/types";
import { useCallback, useRef, useState } from "react";

function pickRandomElement<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

export function Practice({ practicePairs }: { practicePairs: PracticePair[] }) {
  const [currentTranslation, setCurrentTranslation] = useState<
    string | undefined
  >(practicePairs[0]?.translation);
  const known = useRef<string[]>([]);
  const { toast } = useToast();

  const onSubmit = useCallback(
    (resolution: "easy" | "repeat" | "hard") => {
      if (resolution === "easy") {
        known.current.push(currentTranslation!);
      }
      let pair = pickRandomElement(practicePairs);
      if (!pair) {
        toast({
          title: "No more pairs to practice",
        });
        return;
      }
      while (
        known.current.includes(pair.translation) ||
        pair.translation === currentTranslation
      ) {
        pair = pickRandomElement(practicePairs);
        if (!pair) {
          toast({
            title: "No more pairs to practice",
          });
          return;
        }
      }
      setCurrentTranslation(pair.translation);
    },
    [currentTranslation, practicePairs, toast],
  );

  return (
    <>
      <div className="w-full p-3 md:w-1/3">
        <Input
          placeholder="My translation"
          className="text-center"
          readOnly
          value={currentTranslation ?? ""}
          contentEditable={false}
        />
      </div>
      <div className="flex flex-col gap-2 md:flex-row">
        <Button onClick={() => onSubmit("easy")}>Easy, skip this</Button>
        <Button variant="secondary" onClick={() => onSubmit("repeat")}>
          Need more practice
        </Button>
        <Button variant="destructive" onClick={() => onSubmit("hard")}>
          {"I don't know"}
        </Button>
      </div>
    </>
  );
}
