"use client";
import React, { useEffect, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";

interface SearchBarProps {
  onTyping: (value: string) => void;
  onSearch?: (value: string) => void;
  initialValue?: string;
}

const SearchBar = ({
  onTyping,
  onSearch,
  initialValue = "",
}: SearchBarProps) => {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState<string>(initialValue);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Update search value when initialValue changes
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onTyping(e.target.value);
  };

  const handleClear = () => {
    setSearchValue("");
    onTyping("");
    searchBarRef.current?.focus();
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
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    searchBarRef?.current?.focus?.();
  }, []);

  return (
    <div className="flex justify-center mt-10 mx-4">
      <div className="relative max-w-xl w-full">
        {/* Search Container */}
        <div
          className={`relative flex items-center bg-gradient-to-r from-black to-gray-900 rounded-xl border-2 transition-all duration-300 overflow-hidden backdrop-blur-lg ${
            isFocused
              ? "border-primary shadow-lg shadow-primary/20 scale-105"
              : "border-gray-700 hover:border-gray-600"
          }`}
        >
          {/* Search Icon */}
          <div className="pl-4 pr-3">
            <BiSearch
              className={`text-xl transition-colors duration-300 ${
                isFocused ? "text-primary" : "text-gray-400"
              }`}
            />
          </div>

          {/* Input Field */}
          <input
            value={searchValue}
            type="text"
            name="search"
            id="search"
            placeholder="Search for movies, TV shows, actors.."
            className="flex-1 bg-transparent text-white placeholder-gray-400 py-3 placeholder:text-xs pr-3 text-base outline-none font-medium"
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
            ref={searchBarRef}
          />

          {/* Clear Button */}
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              onMouseDown={handleButtonMouseDown}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 mr-1"
              aria-label="Clear search"
            >
              <AiOutlineClose className="text-lg" />
            </button>
          )}

          {/* Search Button */}
          <button
            type="button"
            aria-label="Search"
            className="bg-theme-primary hover:bg-light-primary text-black font-bold px-5 py-5 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSearchClick}
            onMouseDown={handleButtonMouseDown}
            disabled={!searchValue.trim()}
          >
            <BiSearch className="text-lg" />
          </button>
        </div>

        {/* Search Suggestions Placeholder */}
        {isFocused && searchValue && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl z-50">
            <div className="p-3 text-gray-400 text-sm">
              {searchValue.length < 3
                ? `Type ${3 - searchValue.length} more character${
                    3 - searchValue.length !== 1 ? "s" : ""
                  } to search`
                : `Press Enter or click search to find "${searchValue}"`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
