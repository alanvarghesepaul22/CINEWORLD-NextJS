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
    onTyping(searchValue);
  };


  useEffect(() => {
    searchBarRef?.current?.focus?.();
  }, [])

  return (
    <>
      <div className="flex justify-center flex-wrap gap-2 mt-10 mx-4">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          value={searchValue}
          type="text"
          name="search"
          id="search"
          placeholder="Search...."
          className="text-light-white outline-none rounded-l-md bg-grey py-3 px-5 w-full max-w-md"
          onChange={handleTyping}
          autoComplete="off"
          ref={searchBarRef}
        />
        <div
          aria-label="Search"
          className="py-3 px-5 bg-primary rounded-r-md border-none"
          onClick={handleSearch}
        >
          <BiSearch className="text-2xl text-bg-black  cursor-pointer stroke-0" />
        </div>
      </div>
    </>
  );
};

export default SearchBar;
