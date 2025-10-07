import Image from "next/image";
import React from "react";

interface ImageCardProps {
  mediaDetail: {
    poster_path: string | null;
    title?: string;
    name?: string;
  };
}

const ImageCard: React.FC<ImageCardProps> = ({ mediaDetail }) => {
  let poster_path = `https://image.tmdb.org/t/p/w342/${mediaDetail.poster_path}`;
  if (mediaDetail.poster_path === null) {
    poster_path = "https://i.imgur.com/wjVuAGb.png";
  }
  return (
    <div className="w-52 h-72 bg-grey m-3">
      <Image
        src={poster_path}
        alt={`${mediaDetail.title || mediaDetail.name || 'Untitled'} poster image`}
        className="rounded w-full h-full"
        width={208}
        height={288}
        unoptimized
      />
    </div>
  );
};

export default ImageCard;
