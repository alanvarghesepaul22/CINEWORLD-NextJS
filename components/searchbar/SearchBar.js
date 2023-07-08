"use client";
import React, { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";

const SearchBar = ({ onSearch, onTyping }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    onSearch(searchValue);
  };

  const handleTyping = (e) => {
    e.preventDefault();
    setSearchValue(e.target.value);
    onTyping(searchValue);
  };


  return (
    <>
      <div className=" flex place-content-center mt-10 mx-10">
        <input
          value={searchValue}
          type="text"
          name="search"
          id="search"
          placeholder="Search...."
          className="text-light-white outline-none rounded-l-md bg-grey py-3 px-5 w-96"
          onChange={handleTyping}
        />
        <div
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
