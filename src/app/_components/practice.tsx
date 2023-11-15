"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useCallback, useRef, useState } from "react";
import { SelectKnown, SelectWord } from "~/server/db/schema";
import { Badge } from "./ui/badge";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";

function pickRandomElement<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

type Practice = {
  words: Pick<SelectWord, "id" | "name" | "translation">[];
  knowns: SelectKnown["id"][];
};

export function Practice({ words, knowns }: Practice) {
  const [currentTranslation, setCurrentTranslation] = useState<
    (typeof words)[0] | undefined
  >(words[0]);
  const [lastTranslation, setLastTranslation] = useState<
    (typeof words)[0] | undefined
  >(undefined);
  const known = useRef<Set<number>>(new Set(knowns));
  const { toast } = useToast();
  const { user } = useUser();

  const updateKnown = api.known.create.useMutation({
    onSuccess: (_data, { wordId }) => {
      known.current.add(wordId);
    },
  });

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
        updateKnown.mutate({ wordId: currentTranslation.id, userId: user!.id });
      } else {
        toast({
          title: "Keep on practicing!",
          description: `${currentTranslation.name} :: ${currentTranslation.translation}`,
          variant: "destructive",
        });
      }

      if (known.current.size === words.length) {
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
        known.current.has(pair.id) ||
        (pair.id === currentTranslation.id &&
          words.length - known.current.size > 1)
      ) {
        pair = pickRandomElement(words);
        if (!pair) {
          toast({
            title: "No more pairs to practice",
          });
          return;
        }
      }
      setCurrentTranslation(pair);
    },
    [currentTranslation, words, toast, user],
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
      <div className="absolute bottom-0 left-0 m-2">
        <Badge variant="default" className="text-md">
          {known.current.size}/{words.length}
        </Badge>
      </div>
    </div>
  );
}
