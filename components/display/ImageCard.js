import Image from "next/image";
import React from "react";

const ImageCard = (props) => {
  let { MovieDetail } = props;
  let poster_path = `https://image.tmdb.org/t/p/w342/${MovieDetail.poster_path}`;
  if (MovieDetail.poster_path == null) {
    poster_path = "https://i.imgur.com/wjVuAGb.png";
  }
  return (
    <div className="w-52 h-72 bg-grey m-3">
      <Image
        src={poster_path}
        alt={MovieDetail.title || MovieDetail.name}
        className="rounded w-full h-full"
        width={208}
        height={288}
        unoptimized
      />
    </div>
  );
};

export default ImageCard;
