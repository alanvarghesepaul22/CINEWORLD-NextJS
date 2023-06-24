import Image from "next/image";
import Link from "next/link";
import React from "react";

const SeasonCard = () => {
  return (
    <div className="flex flex-col items-center ">
      <div className="w-52 h-72 bg-gray m-3 hover:opacity-75">
        <Link href="/movies" title="title">
          <Image
            src="/movieCard.jpg"
            alt="Picture"
            className="rounded w-full h-full"
            width={208}
            height={288}
          />
        </Link>
      </div>
      <p className="text-center text-white text-lg font-semibold mb-5">Season 1</p>
    </div>
  );
};

export default SeasonCard;
