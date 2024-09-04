import HomeDisplay from "@/components/display/HomeDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import Title from "@/components/title/Title";

async function getData() {
  const apiKey = process.env.API_KEY;
  const resp = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=1`
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await resp.json();
  const res = data.results;
  return res;
}

export default async function Home() {
  let data;
  try {
    data = await getData();
  } catch (error) {
    console.error("Error fetching data:", error);
    data = []; // Provide a fallback or handle the error in the UI
  }

  return (
    <div className="h-auto">
      <Title />
      {/* Uncomment when ready to use */}
      {/* <SearchBar />
      <HomeFilter /> */}
      <HomeDisplay movies={data} />
    </div>
  );
}
