import React from "react";

async function getData(id) {
  const apiKey = process.env.TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`);

  // Try movie first, if not found, try TV
  if (res.ok) return { ...(await res.json()), type: "movie" };

  const tvRes = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`);
  if (tvRes.ok) return { ...(await tvRes.json()), type: "tv" };

  throw new Error("Failed to fetch media");
}

export default async function WatchPage({ params }) {
  const { id } = params;
  const media = await getData(id);

  const src = media.type === "movie"
    ? `https://vidsrc.to/embed/movie/${id}`
    : `https://vidsrc.to/embed/tv/${id}`;

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">{media.title || media.name}</h1>
      <div className="aspect-w-16 aspect-h-9 mb-6">
        <iframe
          src={src}
          allowFullScreen
          className="w-full h-full rounded-md"
        />
      </div>
      <p className="text-light-white">{media.overview}</p>
    </div>
  );
}
