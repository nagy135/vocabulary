import { currentUser } from "@clerk/nextjs";
import { Page } from "~/enums";
import { api } from "~/trpc/server";
import Title from "../_components/title";

export default async function LeaderboardPage() {
  const user = await currentUser();
  if (!user) return <div>Not logged in</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Title title={"Leaderboard"} page={Page.leaderboard} />
    </main>
  );
}
