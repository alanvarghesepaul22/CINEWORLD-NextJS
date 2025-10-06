"use client";
import React, { useEffect, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";

interface SearchBarProps {
  onTyping: (value: string) => void;
  /** 
   * Optional explicit search callback. If provided, search button and Enter key
   * will trigger immediate search. If not provided, falls back to calling onTyping
   * with current value to ensure search happens regardless of debouncing strategy.
   */
  onSearch?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onTyping, onSearch }) => {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onTyping(e.target.value);
  };

  const handleSearchClick = () => {
    // Guard against empty or whitespace-only searches
    if (!searchValue.trim()) {
      searchBarRef.current?.focus();
      return;
    }

    // Explicitly trigger search with current value if callback provided
    if (onSearch) {
      onSearch(searchValue);
    } else {
      // Fallback: trigger search by calling onTyping with current value
      // Note: This invokes onTyping but does not bypass any debouncing implemented by the parent
      // Behavior depends on the parent's implementation of the onTyping callback
      onTyping(searchValue);
    }
    
    // Keep input focused for better UX - user can continue typing
    searchBarRef.current?.focus();
  };

  const handleButtonMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent button click from stealing focus from input
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchClick();
    }
  };


  useEffect(() => {
    searchBarRef?.current?.focus?.();
  }, [])

  return (
    <>
      <div className="flex place-content-center mt-10 mx-10">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          value={searchValue}
          type="text"
          name="search"
          id="search"
          placeholder="Search...."
          className="text-light-white outline-none rounded-l-md bg-grey py-3 px-5 w-96"
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          ref={searchBarRef}
        />
        <button
          type="button"
          aria-label="Search"
          className="py-3 px-5 bg-primary rounded-r-md border-none appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          onClick={handleSearchClick}
          onMouseDown={handleButtonMouseDown}
        >
          <BiSearch className="text-2xl text-bg-black  cursor-pointer stroke-0" />
        </button>
      </div>
    </>
  );
};

export default SearchBar;
