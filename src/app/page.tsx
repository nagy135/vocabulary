import { CreateWord } from "~/app/_components/create-word";
import { Page } from "~/enums";
import Title from "./_components/title";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      <Title title={"Vocabulary"} page={Page.home} />
      <CreateWord />
    </main>
  );
}
