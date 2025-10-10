import { Metadata } from "next";
import PageTitle from "@/components/title/PageTitle";
import WatchListClient from "@/components/watchlist/WatchListClient";

export const metadata: Metadata = {
  title: "Watchlist | Cineworld",
  description:
    "Browse and manage your personal watchlist of movies and TV shows on Cineworld.",
};

export default function WatchlistPage() {
  return (
    <div className="app-bg-enhanced mt-24">
      <PageTitle
        segments={[
          { text: "My " },
          { text: "Watch", isPrimary: true },
          { text: "list" },
        ]}
      />
      <WatchListClient />
    </div>
  );
}
