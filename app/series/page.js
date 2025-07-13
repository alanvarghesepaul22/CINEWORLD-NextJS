import TvDisplay from "@/components/display/TvDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import TvTitle from "@/components/title/TvTitle";
import React from "react";

async function getData() {
  const apiKey = process.env.API_KEY;
  const resp = await fetch(
    `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&page=1`
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await resp.json();
  let res = data.results;
  return res;
}

const Series = async () => {
  const data = await getData();
  return (
    <>
      <div className=" h-auto">
        <TvTitle />
        {/* <SearchBar />
        <HomeFilter /> */}
        <TvDisplay series={data} />
      </div>
    </>
  );
};

export default Series;
