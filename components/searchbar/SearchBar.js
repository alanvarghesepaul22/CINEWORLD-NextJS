"use client";
import React, { useEffect, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";

const SearchBar = ({ onSearch, onTyping }) => {
  const searchBarRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    onSearch(searchValue);
  };

  const handleTyping = (e) => {
    e.preventDefault();
    setSearchValue(e.target.value);
    onTyping(e.target.value); // use actual input here
  };

  useEffect(() => {
    searchBarRef?.current?.focus?.();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center mt-6 px-4 gap-2 w-full">
      <input
        value={searchValue}
        type="text"
        name="search"
        id="search"
        placeholder="Search for movies or series..."
        className="w-full sm:w-[400px] rounded-md px-4 py-3 bg-grey text-white outline-none placeholder:text-light-white"
        onChange={handleTyping}
        autoComplete="off"
        ref={searchBarRef}
      />
      <button
        aria-label="Search"
        onClick={handleSearch}
        className="w-full sm:w-auto px-6 py-3 bg-primary text-black font-bold rounded-md hover:bg-yellow-300 transition"
      >
        <BiSearch className="inline text-2xl" />
      </button>
    </div>
  );
};

export default SearchBar;
