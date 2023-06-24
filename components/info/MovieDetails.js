import React from "react";
import { AiTwotoneStar } from "react-icons/Ai";

const MovieDetails = (props) => {
  let { MovieDetail, genreArr } = props;
  return (
    <div className="text-white text-left w-3/5 ml-8">
      <p className="bg-light-primary w-fit text-black px-2 font-bold text-sm rounded-sm mb-2">MOVIE</p>
      <h1 className="text-3xl">{MovieDetail.title}</h1>
      <div className="flex justify-between mt-4 w-1/4">
        <span>{MovieDetail.release_date.substr(0,4)}</span>
        <span>{MovieDetail.runtime} mins.</span>
        <div className="flex items-center">
          <AiTwotoneStar className="text-primary mr-1" />
          <span>{MovieDetail.vote_average.toFixed(1)}</span>
        </div>
      </div>
      <div className="flex justify-start w-auto my-3">
        {
          genreArr.map((item,index)=>{
            return  <p key={index} className="text-light-primary border px-3 rounded-full w-fit mx-2">{item}</p>
          })
        }
       
      </div>
      <p className="text-light-white mt-5">{MovieDetail.overview}</p>
    </div>
  );
};

export default MovieDetails;