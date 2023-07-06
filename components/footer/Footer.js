import React from "react";
import Link from "next/link";
import { AiFillGithub } from "react-icons/Ai";

const Footer = () => {
  return (
    <div className="w-100 bg-gray px-5 py-0 flex items-center justify-between mt-10">
      <Link href="/">
        <div className="">
          <p className="border-light-primary border-2 w-32 py-1 my-5 text-light-primary font-semibold text-center rounded-md">
            CINEWORLD
          </p>
        </div>
      </Link>
      <p className="text-center text-light-white">Copyright © 2023 </p>

      <Link href="https://github.com/alanvarghesepaul22/CINEWORLD-NextJS" target="_blank">
        <AiFillGithub className="text-3xl text-light-primary  mr-4" />
      </Link>
    </div>
  );
};

export default Footer;
