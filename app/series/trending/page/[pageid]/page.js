import TvDisplay from "@/components/display/TvDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import TvTitle from "@/components/title/TvTitle";

export async function getData(pageid) {
  const apiKey = process.env.API_KEY;
  if (pageid < 1) {
    pageid = 1;
  }
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&page=${pageid}`
  );
  let result = await res.json();
  let data = result.results;

  if (!res.ok) {
    throw new Error("Failed to Fetch data");
  }
  return { data, pageid };
}

const TrendingPage = async ({ params }) => {
  let { data, pageid } = await getData(params.pageid);
  return (
    <div className=" h-auto">
      <TvTitle />
      {/* <SearchBar />
      <HomeFilter /> */}
      <TvDisplay series={data} pageid={pageid} />
    </div>
  );
};
export default TrendingPage;
