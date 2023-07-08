import React from "react";
import Link from "next/link";
import { AiFillGithub } from "react-icons/ai";

const Footer = () => {
  return (
    <div className=" bg-grey px-5 py-0 flex items-center justify-between mt-10">
      <Link href="/">
        <div className="">
          <p
            className="border-light-white border text-xs sm:text-sm md:text-base 
          w-28 md:w-32 py-1 my-5 text-light-white font-semibold 
          text-center rounded-md"
          >
            CINEWORLD
          </p>
        </div>
      </Link>
      <p className="text-center text-light-white text-sm sm:text-base ">
        Cineworld &copy; {new Date().getFullYear()}{" "}
      </p>

      <Link
        href="https://github.com/alanvarghesepaul22/CINEWORLD-NextJS"
        target="_blank"
      >
        <AiFillGithub className="text-3xl text-light-white mr-4 hover:text-gray-500" />
      </Link>
    </div>
  );
};

export default Footer;
