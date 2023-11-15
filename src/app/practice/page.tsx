import { Page } from "~/enums";
import Navigation from "../_components/navigation";
import { Practice } from "../_components/practice";
import { currentUser } from "@clerk/nextjs";
import { api } from "~/trpc/server";

export default async function PracticePage() {
  const user = await currentUser();
  if (!user) return <div>Not logged in</div>;

  const words = await api.word.getAllByUserId.query(user.id);
  const knowns = await api.known.getAllByUserId.query(user.id);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      <Navigation currentPage={Page.practice} />
      <Practice
        words={words.map((e) => ({
          name: e.name ?? "",
          translation: e.translation ?? "",
          id: e.id,
        }))}
        knowns={knowns.map((e) => e.wordId)}
      />
    </main>
  );
}
