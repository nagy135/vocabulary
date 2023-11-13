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
    PracticePair | undefined
  >(practicePairs[0]);
  const known = useRef<number[]>([]);
  const { toast } = useToast();

  const onSubmit = useCallback(
    (resolution: "easy" | "repeat" | "hard") => {
      if (!currentTranslation) {
        alert("No translation to practice");
        return;
      }
      if (resolution === "easy") {
        toast({
          title: "Too easy, understood",
          description: `it was: ${currentTranslation.name}`,
        });
        known.current.push(currentTranslation.id);
      } else {
        toast({
          title: "Keep on practicing!",
          description: `${currentTranslation.name}`,
          variant: resolution === "hard" ? "destructive" : "default",
        });
      }

      if (known.current.length === practicePairs.length) {
        toast({
          title: "YOU KNOW IT ALL!",
        });
        setCurrentTranslation(undefined);
        return;
      }

      let pair = pickRandomElement(practicePairs);
      if (!pair) {
        toast({
          title: "No more pairs to practice",
        });
        return;
      }
      while (
        known.current.includes(pair.id) ||
        (pair.id === currentTranslation.id &&
          practicePairs.length - known.current.length > 1)
      ) {
        pair = pickRandomElement(practicePairs);
        if (!pair) {
          toast({
            title: "No more pairs to practice",
          });
          return;
        }
      }
      setCurrentTranslation(pair);
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
          value={currentTranslation?.translation ?? "YOU KNOW THEM ALL"}
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
