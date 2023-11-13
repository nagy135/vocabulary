import { Page } from "~/enums";
import Navigation from "../_components/navigation";
import { Practice } from "../_components/practice";
import { api } from "~/trpc/server";

export default async function PracticePage() {
  // const practicePairs = (await api.word.getAllByUserId.query()).map((e) => {
  //   return {
  //     name: e.name ?? "",
  //     translation: e.translation ?? "",
  //   };
  // });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      <Navigation currentPage={Page.practice} />
      <Practice practicePairs={[]} />
    </main>
  );
}
