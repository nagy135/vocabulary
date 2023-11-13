import { CreateWord } from "~/app/_components/create-word";
import Navigation from "./_components/navigation";
import { Page } from "~/enums";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      <Navigation currentPage={Page.home} />
      <CreateWord />
    </main>
  );
}
