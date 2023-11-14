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
  const [lastTranslation, setLastTranslation] = useState<
    PracticePair | undefined
  >(undefined);
  const known = useRef<Set<number>>(new Set());
  const { toast } = useToast();

  const revertLastChoice = useCallback(() => {
    setCurrentTranslation(lastTranslation);
    if (known.current.has(lastTranslation!.id)) {
      known.current.delete(lastTranslation!.id);
    }
    setLastTranslation(undefined);
    toast({
      title: "Back to last word",
      description: `${lastTranslation?.name} :: ${lastTranslation?.translation}`,
      variant: "default",
    });
  }, [lastTranslation, currentTranslation]);

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
        known.current.add(currentTranslation.id);
      } else {
        toast({
          title: "Keep on practicing!",
          description: `${currentTranslation.name} :: ${currentTranslation.translation}`,
          variant: "destructive",
        });
      }

      if (known.current.size === practicePairs.length) {
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
        known.current.has(pair.id) ||
        (pair.id === currentTranslation.id &&
          practicePairs.length - known.current.size > 1)
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
    <div className="flex flex-col items-stretch">
      <div className="my-2">
        <Input
          placeholder="My translation"
          className="text-center"
          readOnly
          value={currentTranslation?.translation ?? "YOU KNOW THEM ALL"}
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
            disabled={!lastTranslation}
            variant="destructive"
            onClick={() => revertLastChoice()}
          >
            Go back to last
          </Button>
        </div>
      </div>
    </div>
  );
}
