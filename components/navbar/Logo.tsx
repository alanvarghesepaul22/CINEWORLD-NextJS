import Link from "next/link";
import React from "react";

const Logo: React.FC = () => {
  return (
    <Link
      href="/"
      className="flex justify-center items-center w-28 md:w-32 text-sm md:text-base my-5 font-extrabold text-center"
    >
      <div className="bg-theme-primary py-1 px-2 border border-theme-primary text-black">
        <p>CINE</p>
      </div>
      <div className="bg-white py-1 px-2 border border-theme-primary text-black">
        <p>WORLD</p>
      </div>
    </Link>
  );
};

export default Logo;
