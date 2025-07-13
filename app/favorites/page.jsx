// app/favorites/page.jsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const items = [];
    for (let key in localStorage) {
      if (key.startsWith("cine-fav-")) {
        const item = JSON.parse(localStorage.getItem(key));
        items.push(item);
      }
    }
    setFavorites(items);
  }, []);

  const removeFavorite = (id) => {
    localStorage.removeItem(`cine-fav-${id}`);
    setFavorites(favorites.filter((fav) => fav.id !== id));
  };

  if (favorites.length === 0) {
    return (
      <div className="p-6 text-white text-center">
        <h1 className="text-3xl font-bold mb-4">Your Favorites</h1>
        <p className="text-lg text-light-white">No movies or shows added yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Favorites ❤️</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {favorites.map((item) => (
          <div
            key={item.id}
            className="bg-grey rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w342${item.poster}`}
              alt={item.title}
              width={300}
              height={450}
              className="w-full h-[400px] object-cover"
              unoptimized
            />
            <div className="p-4 flex flex-col justify-between gap-3">
              <h2 className="text-lg font-semibold truncate">{item.title}</h2>
              <div className="flex gap-2">
                <Link
                  href={`/watch/${item.id}`}
                  className="flex-1 text-center bg-primary text-black font-semibold py-2 rounded hover:bg-yellow-400 transition"
                >
                  ▶ Watch
                </Link>
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="flex-1 text-center bg-white text-black font-semibold py-2 rounded hover:bg-red-500 hover:text-white transition"
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
