import { Page } from "~/enums";
import Navigation from "../_components/navigation";
import { Practice } from "../_components/practice";
import { api } from "~/trpc/server";

export default async function PracticePage() {
  const words = await api.word.getAllByUserId.query();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      <Navigation currentPage={Page.practice} />
      <Practice
        practicePairs={words.map((e) => ({
          name: e.name ?? "",
          translation: e.translation ?? "",
        }))}
      />
    </main>
  );
}
