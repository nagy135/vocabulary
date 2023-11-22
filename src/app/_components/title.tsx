import { Page } from "~/enums";
import Navigation from "./navigation";

type Title = {
  page: Page;
  title: string;
};

export default function Title({ page, title }: Title) {
  return (
    <>
      <Navigation currentPage={page} />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 pt-24 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {title}
        </h1>
      </div>
    </>
  );
}
