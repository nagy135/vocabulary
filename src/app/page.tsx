import { CreateWord } from "~/app/_components/create-word";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      <CreateWord />
    </main>
  );
}
