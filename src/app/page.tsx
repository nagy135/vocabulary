import { CreateWord } from "~/app/_components/create-word";
import { Page } from "~/enums";
import Title from "./_components/title";
import Logo from "./_components/logo";

export default function Home() {
  return (
    <main className="mb-8 flex min-h-screen flex-col items-center justify-center ">
      <Logo />
      <Title title={"Vocabulary"} page={Page.home} />
      <CreateWord />
    </main>
  );
}
