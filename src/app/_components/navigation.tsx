import Link from "next/link";
import { Button } from "./ui/button";
import { Page, PageUrl } from "~/enums";
import { type ComponentProps } from "react";

const linksToShow: Record<
  Page,
  { pages: Page[]; variant?: ComponentProps<typeof Button>["variant"] }
> = {
  [Page.home]: {
    pages: [Page.practice, Page.learned, Page.leaderboard],
  },
  [Page.practice]: {
    pages: [Page.home, Page.learned, Page.leaderboard],
    variant: "secondary",
  },
  [Page.learned]: {
    pages: [Page.home, Page.practice, Page.leaderboard],
    variant: "outline",
  },
  [Page.leaderboard]: {
    pages: [Page.home, Page.practice, Page.learned],
    variant: "outline",
  },
};

export const pageData: Record<Page, { url: string; label: string }> = {
  [Page.home]: {
    url: PageUrl.home,
    label: "Add",
  },
  [Page.practice]: {
    url: PageUrl.practice,
    label: "Practice",
  },
  [Page.learned]: {
    url: PageUrl.learned,
    label: "Learned",
  },
  [Page.leaderboard]: {
    url: PageUrl.leaderboard,
    label: "Leaderboard",
  },
};

export default function Navigation({ currentPage }: { currentPage: Page }) {
  return (
    <div className="absolute left-0 top-0 m-3 flex gap-2">
      {linksToShow[currentPage].pages.map((e, i) => (
        <Link prefetch={false} key={`navigation-${i}`} href={pageData[e].url}>
          <Button
            id={`navigation-${pageData[e].label}`}
            variant={linksToShow[e].variant ?? "default"}
          >
            {pageData[e].label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
