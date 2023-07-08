import HomeDisplay from "@/components/display/HomeDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import Title from "@/components/title/Title";

async function getData() {
  const apiKey = process.env.API_KEY;
  const resp = await fetch(
    // `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
    `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=1`
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await resp.json();
  let res = data.results;
  return res;
}

export default async function Home() {
  const data = await getData();
  return (
    <div className=" h-auto">
      <Title />
      {/* <SearchBar />
      <HomeFilter /> */}
      <HomeDisplay movies={data} />
    </div>
  );
}
