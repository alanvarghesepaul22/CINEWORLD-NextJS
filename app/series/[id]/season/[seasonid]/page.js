import SeasonInfo from "@/components/info/SeasonInfo";
import React from "react";

async function getData(id, seasonid) {
  const apiKey = process.env.API_KEY;

  const resp = await fetch(
    `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}?api_key=${apiKey}`
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await resp.json();

  return { data, id };
}

const SeasonsDetailsPage = async ({ params }) => {
  let { data, id } = await getData(params.id, params.seasonid);
  return <SeasonInfo SeasonInfos={data} id={id} />;
};

export default SeasonsDetailsPage;
