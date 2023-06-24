import MovieDisplay from "@/components/display/MovieDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import SearchTitle from "@/components/title/SearchTitle";
import React from 'react'

const Search = () => {
  return (
    <div className="w-100 h-auto">
      <SearchTitle />
      <SearchBar />
      <HomeFilter />
    </div>
  )
}

export default Search