// app/trending/[pageid]/page.js
import TvDisplay from "@/components/display/TvDisplay";
import TvTitle from "@/components/title/TvTitle";

export async function getData(pageid) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!pageid || isNaN(pageid) || pageid < 1) {
    pageid = 1;
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&page=${pageid}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const result = await res.json();
  return { data: result.results, pageid };
}

export default async function TrendingPage({ params }) {
  const { pageid } = params;
  const { data, pageid: currentPage } = await getData(pageid);

  return (
    <div className="h-auto">
      <TvTitle />
      <TvDisplay series={data} pageid={currentPage} />
    </div>
  );
}
