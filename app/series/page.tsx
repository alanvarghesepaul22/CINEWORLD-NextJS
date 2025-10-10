import { Metadata } from "next";
import { Suspense } from "react";
import PageTitle from "@/components/title/PageTitle";
import SeriesPageClient from "@/components/series/SeriesPageClient";
import {PageLoading} from "@/components/loading/PageLoading";

export const metadata: Metadata = {
  title: "All TV Shows | Cineworld",
  description:
    "Browse all TV shows available on Cineworld. Find trending, top-rated, and new releases.",
};

export default function SeriesPage() {
  return (
    <div className="app-bg-enhanced mt-24">
      <PageTitle
        segments={[
          { text: "TV Shows &" },
          { text: " Series", isPrimary: true },
        ]}
      />

      <Suspense fallback={<PageLoading>Loading TV shows...</PageLoading>}>
        <SeriesPageClient />
      </Suspense>
    </div>
  );
}
