import TvInfo from "@/components/info/TvInfo";

export async function getData(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch TV data");
  }

  const data = await res.json();
  const genreArr = data.genres?.map((genre) => genre.name) || [];

  return { data, genreArr, id };
}

export default async function TvDetail({ params }) {
  const { data, genreArr, id } = await getData(params.id);

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <TvInfo TvDetail={data} genreArr={genreArr} id={id} />
    </div>
  );
}
