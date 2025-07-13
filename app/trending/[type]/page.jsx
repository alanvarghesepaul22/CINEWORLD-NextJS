// app/trending/[type]/page.jsx
import SectionRow from "@/components/display/SectionRow";

async function getData(type) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const url = type === "tv" ? "/trending/tv/week" : "/trending/movie/week";
  const res = await fetch(`https://api.themoviedb.org/3${url}?api_key=${apiKey}&language=en-US`);
  const data = await res.json();
  return data.results;
}

export default async function TrendingPage({ params }) {
  const type = params.type;
  const data = await getData(type);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white capitalize">
        Trending {type === "tv" ? "Series" : "Movies"}
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((item) => (
          <SectionRow key={item.id} title="" movies={[item]} />
        ))}
      </div>
    </div>
  );
}
