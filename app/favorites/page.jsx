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
        <h1 className="text-2xl font-bold mb-2">Your Favorites</h1>
        <p>You haven’t added any favorites yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Favorites ❤️</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {favorites.map((item) => (
          <div key={item.id} className="bg-grey rounded shadow-md">
            <Image
              src={`https://image.tmdb.org/t/p/w342${item.poster}`}
              alt={item.title}
              width={300}
              height={450}
              className="rounded-t w-full object-cover"
              unoptimized
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
              <div className="flex gap-2">
                <Link
                  href={`/watch/${item.id}`}
                  className="bg-primary text-black px-4 py-1 rounded hover:bg-yellow-400 transition"
                >
                  ▶ Watch
                </Link>
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="bg-white text-black px-4 py-1 rounded hover:bg-gray-300 transition"
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
