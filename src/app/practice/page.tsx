import { Page } from "~/enums";
import Navigation from "../_components/navigation";
import { Practice } from "../_components/practice";
import { currentUser } from "@clerk/nextjs";
import { api } from "~/trpc/server";

export default async function PracticePage() {
  const user = await currentUser();
  if (!user) return <div>Not logged in</div>;

  const words = await api.word.hello.query(user.id);
  console.log("================\n", "hello: ", words, "\n================");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      <Navigation currentPage={Page.practice} />
      <Practice practicePairs={[]} />
    </main>
  );
}
