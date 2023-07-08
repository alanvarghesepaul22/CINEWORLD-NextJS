import HomeDisplay from "@/components/display/HomeDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import Title from "@/components/title/Title";

export async function getData(pageid) {
  const apiKey = process.env.API_KEY;
  if (pageid < 1) {
    pageid = 1;
  }
  const res = await fetch(
    // `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${pageid}`
    `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=${pageid}`
  );
  let result = await res.json();
  let data = result.results;

  if (!res.ok) {
    throw new Error("Failed to Fetch data");
  }
  return { data, pageid };
}

const AllTrending = async ({ params }) => {
  let { data, pageid } = await getData(params.pageid);
  return (
    <div className=" h-auto">
      <Title />
      {/* <SearchBar />
      <HomeFilter /> */}
      <HomeDisplay movies={data} pageid={pageid} />
    </div>
  );
};
export default AllTrending;
