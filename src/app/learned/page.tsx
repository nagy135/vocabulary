import { currentUser } from "@clerk/nextjs";
import { Page } from "~/enums";
import { api } from "~/trpc/server";
import KnownList from "../_components/known-list/known-list";
import Title from "../_components/title";

export default async function LearnedPage() {
  const user = await currentUser();
  if (!user) return <div>Not logged in</div>;

  const knowns = await api.known.getAllWithWord.query(user.id);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Title title={"Learned"} page={Page.learned} />
      <KnownList
        knowns={knowns.map((e) => ({
          knownId: e.id,
          wordName: e.word?.name ?? "",
          wordTranslation: e.word?.translation ?? "",
        }))}
      />
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dynamic = "force-dynamic";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const revalidate = 0;
