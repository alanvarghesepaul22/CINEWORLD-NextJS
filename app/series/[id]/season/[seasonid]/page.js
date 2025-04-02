import SeasonInfo from "@/components/info/SeasonInfo";
import React from "react";

async function getData(id, seasonid) {
  const apiKey = process.env.API_KEY;

  // Fetch season details
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

  return (
    <div className="container mx-auto p-4">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
        <SeasonInfo SeasonInfos={data} id={id} />

        {/* Watch Trailer Button (if available) */}
        {data.videos?.results?.length > 0 && (
          <div className="mt-6 flex justify-center">
            <a
              href={`https://www.youtube.com/watch?v=${data.videos.results[0].key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Watch Trailer
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonsDetailsPage;
