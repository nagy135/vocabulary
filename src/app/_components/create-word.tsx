"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";

import { api } from "~/trpc/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import useScreenWidth from "../hooks/use-screen-width";
import { AnimationPosition, useAnimation } from "~/animation";

const FormSchema = z.object({
  name: z
    .string({
      required_error: "Please write a name",
    })
    .min(1, { message: "You must enter a name" })
    .max(256, { message: "Name too long" })
    .describe("Name"),

  translation: z
    .string({
      required_error: "Please write a translation",
    })
    .min(1, { message: "You must enter translation" })
    .max(256, { message: "Translation too long" })
    .describe("Translation"),
});

export function CreateWord() {
  const { user } = useUser();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const screenWidth = useScreenWidth();
  const [inputFlyPos, setInputFlyPos] = useState<[number, number]>([0, 0]);
  const [inputFlyPos2, setInputFlyPos2] = useState<[number, number]>([0, 0]);
  const [createBlocked, setCreateBlocked] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      translation: "",
    },
  });

  const createWord = api.word.create.useMutation({
    onSuccess: () => {
      form.reset();
    },
    onError: () => {
      toast({
        title: "Create failed",
        description: "Could not create translation pair",
        variant: "destructive",
      });
    },
  });

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
    timeout: { init: 700, middle: 1200 },
  });

  const { setPosition: setFlyPosition2, style: flyStyle2 } = useAnimation({
    variety: "fly-into",
    offset: {
      init: { x: 0, y: 0 },
      middle: {
        x: inputFlyPos2[0],
        y: inputFlyPos2[1],
      },
    },
    timeout: { init: 700, middle: 1200 },
  });

  useLayoutEffect(() => {
    const inputPosition = (
      ref: RefObject<HTMLInputElement>,
    ): [number, number] => {
      if (!inputRef) return [0, 0];
      const rect = ref.current?.getBoundingClientRect();
      const target = document
        .getElementById("navigation-Practice")
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

    setInputFlyPos(inputPosition(inputRef));
    setInputFlyPos2(inputPosition(inputRef2));
  }, [screenWidth]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user?.id) {
      alert("Not logged in ...somehow");
      return;
    }
    if (!user.primaryEmailAddress) {
      alert("You need to have an email address set to create a word!");
      return;
    }
    const newValues = {
      name: data.name,
      translation: data.translation,
      userId: user.id,
    };
    setCreateBlocked(true);
    setFlyPosition(AnimationPosition.middle);
    setFlyPosition2(AnimationPosition.middle);
    setTimeout(() => {
      setFlyPosition(AnimationPosition.init);
      setFlyPosition2(AnimationPosition.init);
      setCreateBlocked(false);
    }, flyTimeout.middle);
    createWord.mutate(newValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6`}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  style={flyStyle}
                  placeholder="My word"
                  {...field}
                  ref={inputRef}
                />
              </FormControl>
              <FormDescription>Name of the word</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="translation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Translation</FormLabel>
              <FormControl>
                <Input
                  style={flyStyle2}
                  placeholder="My translation"
                  {...field}
                  ref={inputRef2}
                />
              </FormControl>
              <FormDescription>Name of the translation</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={createBlocked} type="submit">
          Create
        </Button>
      </form>
    </Form>
  );
}
