import React from "react";
import { BiSearch } from "react-icons/bi";

const SearchBar = () => {
  return (
    <>
      <div className="w-100 flex place-content-center mt-10">
        <input
          type="text"
          placeholder="Search...."
          className="text-light-white outline-none rounded-l-md bg-gray py-3 px-5 w-96"
        />
        <div className="py-3 px-5 bg-primary rounded-r-md border-none">
        <BiSearch className="text-2xl text-bg-black  cursor-pointer stroke-0" />
        </div>
      </div>
    </>
  );
};

export default SearchBar;
