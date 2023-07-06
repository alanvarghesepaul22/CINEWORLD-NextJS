import EpisodeInfo from "@/components/info/EpisodeInfo";
import React from "react";

async function getData(id, seasonid, epid) {
  const apiKey = process.env.API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}/episode/${epid}?api_key=${apiKey}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await res.json();

  return { data, id };
}

const EpisodeDetailsPage = async ({ params }) => {
  let { data, id } = await getData(params.id, params.seasonid, params.epid);
  return <EpisodeInfo episodeDetails={data} seriesId={id} />;
};

export default EpisodeDetailsPage;
