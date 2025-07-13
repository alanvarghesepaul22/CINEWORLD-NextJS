// app/watch/[id]/page.jsx

import React from "react";

// Force SSR on dynamic routes (Next.js App Router)
export const dynamic = "force-dynamic";

async function getData(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`);
    if (res.ok) {
      const data = await res.json();
      return { ...data, type: "movie" };
    }

    const tvRes = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`);
    if (tvRes.ok) {
      const data = await tvRes.json();
      return { ...data, type: "tv" };
    }

    throw new Error("Media not found");
  } catch (error) {
    console.error("Error fetching media:", error.message);
    throw error;
  }
}

export default async function WatchPage({ params }) {
  const { id } = params;

  let media;
  try {
    media = await getData(id);
  } catch (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
        <p className="text-lg">Error: {error.message}</p>
      </div>
    );
  }

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
