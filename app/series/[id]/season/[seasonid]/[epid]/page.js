import EpisodeInfo from "@/components/info/EpisodeInfo";
import React from "react";

async function getData(id, seasonid, epid) {
  const apiKey = process.env.API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}/episode/${epid}?api_key=${apiKey}`
  );

  const SeasonResp = await fetch(
    `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}?api_key=${apiKey}`
  );
 
  const SeriesResp = await fetch(
    `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`
  );

  if (!SeriesResp.ok ||!res.ok ||!SeasonResp.ok) {
    throw new Error("Failed to fetch data");
  }
  const SeriesData = await SeriesResp.json();
  const SeasonData = await SeasonResp.json();
  const data = await res.json();

  return { data, id, SeasonData, SeriesData };
}

const EpisodeDetailsPage = async ({ params }) => {
  let { data, id, SeasonData,SeriesData } = await getData(
    params.id,
    params.seasonid,
    params.epid
  );
  return (
    <EpisodeInfo episodeDetails={data} seriesId={id} seasonData={SeasonData} seriesData={SeriesData} />
  );
};

export default EpisodeDetailsPage;
