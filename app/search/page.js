"use client";
import SearchDisplay from "@/components/display/SearchDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import SearchTitle from "@/components/title/SearchTitle";
import React, { useEffect, useState } from "react";
const apiKey = process.env.API_KEY;
import { useDebounce } from "use-debounce";

const Search = () => {
  const [data, setData] = useState([]);
  const [typedValue, setTypedValue] = useState("");

  // This is triggered when search button is clicked
  const handleSearch = (searchValue) => {
    const getData = async () => {
      if (searchValue !== "") {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${searchValue}`
        );
        const result = await res.json();
        let data = result.results;
        setData(data);
      }
    };
    getData();
  };

  // This is triggered when user starts typing in search bar
  const handleTyping = (typedValue) => {
    setTypedValue(typedValue);
  };

  const [value] = useDebounce(typedValue, 1000);

  useEffect(() => {
    const getData = async () => {
      if (typedValue !== "") {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${value}`
        );
        const result = await res.json();
        let data = result.results;
        setData(data);
      }
    };
    getData();
  }, [value]);

  return (
    <div className=" h-full">
      <SearchTitle />
      <SearchBar onSearch={handleSearch} onTyping={handleTyping} />
      {/* <HomeFilter /> */}
      <SearchDisplay movies={data} />
    </div>
  );
};

export default Search;
