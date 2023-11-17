import Link from "next/link";
import { Button } from "./ui/button";
import { Page } from "~/enums";
import { type ComponentProps } from "react";

const linksToShow: Record<
  Page,
  { pages: Page[]; variant?: ComponentProps<typeof Button>["variant"] }
> = {
  [Page.home]: {
    pages: [Page.practice, Page.learned],
  },
  [Page.practice]: {
    pages: [Page.home, Page.learned],
    variant: "secondary",
  },
  [Page.learned]: {
    pages: [Page.home, Page.practice],
    variant: "outline",
  },
};

const pageData: Record<Page, { url: string; label: string }> = {
  [Page.home]: {
    url: "/",
    label: "Add",
  },
  [Page.practice]: {
    url: "/practice",
    label: "Practice",
  },
  [Page.learned]: {
    url: "/learned",
    label: "Learned",
  },
};

export default function Navigation({ currentPage }: { currentPage: Page }) {
  return (
    <div className="absolute left-0 top-0 m-3 flex gap-2">
      {linksToShow[currentPage].pages.map((e, i) => (
        <Button
          key={`navigation-${i}`}
          variant={linksToShow[e].variant ?? "default"}
        >
          <Link prefetch={false} href={pageData[e].url}>
            {pageData[e].label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
