"use client";
import React, { useEffect, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";
import Link from "next/link";

const SearchBar = () => {
  const searchBarRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm) return setResults([]);
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${searchTerm}`
    );
    const data = await res.json();
    setResults(data.results || []);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceTimeout);
    const newTimeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
    setDebounceTimeout(newTimeout);
  };

  useEffect(() => {
    searchBarRef?.current?.focus?.();
  }, []);

  return (
    <div className="relative flex flex-col items-center mt-6 px-4 w-full">
      <div className="flex w-full sm:w-[400px] items-center">
        <input
          ref={searchBarRef}
          type="text"
          placeholder="Search for movies or series..."
          value={query}
          onChange={handleChange}
          className="w-full rounded-l-md px-4 py-3 bg-grey text-white outline-none placeholder:text-light-white"
        />
        <button
          aria-label="Search"
          className="px-6 py-3 bg-primary text-black font-bold rounded-r-md hover:bg-yellow-300 transition"
        >
          <BiSearch className="text-2xl" />
        </button>
      </div>

      {/* 🔍 Suggestion dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full sm:w-[400px] max-h-60 overflow-y-auto bg-navbg border border-grey rounded-md shadow-lg z-50">
          {results.slice(0, 8).map((item) => (
            <Link
              key={item.id}
              href={`/${item.media_type}/${item.id}`}
              className="block px-4 py-2 text-white hover:bg-grey transition"
              onClick={() => setQuery("")}
            >
              {item.title || item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
