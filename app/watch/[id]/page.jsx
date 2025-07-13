// app/watch/[id]/page.jsx
import React from "react";

async function getData(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`);

  if (res.ok) return { ...(await res.json()), type: "movie" };

  const tvRes = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`);
  if (tvRes.ok) return { ...(await tvRes.json()), type: "tv" };

  throw new Error("Failed to fetch media");
}

export default async function WatchPage({ params }) {
  const { id } = params;
  const media = await getData(id);

  const src =
    media.type === "movie"
      ? `https://vidsrc.to/embed/movie/${id}`
      : `https://vidsrc.to/embed/tv/${id}`;

  const downloadLink =
    media.type === "movie"
      ? `https://vidsrc.to/download/movie/${id}`
      : `https://vidsrc.to/download/tv/${id}`;

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

      <p className="text-light-white mb-6">{media.overview}</p>

      <div className="flex flex-wrap gap-4">
        {/* ✅ Download Button */}
        <a
          href={downloadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-black px-5 py-2 rounded font-semibold hover:bg-yellow-400 transition"
        >
          ⬇ Download
        </a>

        {/* ✅ Favorite Button */}
        <button
          onClick={() => {
            const key = `cine-fav-${media.id}`;
            const data = {
              id: media.id,
              title: media.title || media.name,
              poster: media.poster_path,
              type: media.type,
            };
            localStorage.setItem(key, JSON.stringify(data));
            alert("Added to favorites!");
          }}
          className="bg-white text-black px-5 py-2 rounded font-semibold hover:bg-gray-200 transition"
        >
          ❤️ Favorite
        </button>
      </div>
    </div>
  );
}
