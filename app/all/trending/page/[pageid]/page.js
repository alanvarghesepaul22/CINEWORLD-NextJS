import HomeDisplay from "@/components/display/HomeDisplay";
import Title from "@/components/title/Title";

export async function getData(pageid) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const validPage = pageid && parseInt(pageid) > 0 ? pageid : 1;

  const res = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=${validPage}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const result = await res.json();
  const data = result.results;

  return { data, pageid: validPage };
}

export default async function AllTrending({ params }) {
  const { data, pageid } = await getData(params.pageid);

  return (
    <div className="h-auto">
      <Title />
      <HomeDisplay movies={data} pageid={pageid} />
    </div>
  );
}
