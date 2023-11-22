import { clerkClient, currentUser } from "@clerk/nextjs";
import { Page } from "~/enums";
import { api } from "~/trpc/server";
import Title from "../_components/title";
import LeaderboardList from "../_components/leaderboard-list/leaderboard-list";

export default async function LeaderboardPage() {
  const user = await currentUser();
  if (!user) return <div>Not logged in</div>;

  const users = await clerkClient.users.getUserList();
  const counters = await api.known.getUsersWithKnownCount.query();
  const leaderBoardData = counters.map((e) => {
    const user = users.find((u) => u.id === e.userId);
    return {
      name: user ? user.username ?? user.firstName ?? user.id : "",
      ...e,
    };
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Title title={"Leaderboard"} page={Page.leaderboard} />
      <LeaderboardList leaderboards={leaderBoardData} />
    </main>
  );
}
