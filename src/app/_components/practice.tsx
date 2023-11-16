"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useCallback, useEffect, useState } from "react";
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

export function Practice({ words, knowns, allWords }: Practice) {
  const [currentTranslation, setCurrentTranslation] = useState<
    (typeof words)[0] | undefined
    // TODO: this can pick known word as well
  >(undefined);
  const [lastTranslation, setLastTranslation] = useState<
    (typeof words)[0] | undefined
  >(undefined);
  const [known, setKnown] = useState<number[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    setCurrentTranslation(pickRandomElement(words));
    setKnown(knowns);
  }, [knowns, words]);

  const updateKnown = api.known.create.useMutation({
    onSuccess: (_data, { wordId }) => {
      setKnown((e) => [...e, wordId]);
    },
  });

  const deleteKnown = api.known.delete.useMutation({
    onSuccess: (_data, { wordId }) => {
      setKnown((e) => e.filter((item) => item !== wordId));
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
      } else {
        toast({
          title: "Keep on practicing!",
          description: `${currentTranslation.name} :: ${currentTranslation.translation}`,
          variant: "destructive",
        });
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
      setCurrentTranslation(pair);
    },
    [currentTranslation, words, toast, user, known, updateKnown],
  );

  return (
    <div className="flex flex-col items-stretch">
      <div className="my-2">
        <Input
          placeholder="My translation"
          className="text-center"
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
            disabled={!lastTranslation}
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
