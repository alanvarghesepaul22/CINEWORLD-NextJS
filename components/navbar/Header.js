import Link from "next/link";
import React from "react";
import { BiSearch } from "react-icons/bi";

const Header = () => {
  return (
    <nav className="flex items-center justify-between px-16">
      <Link href="/">
        <div className="">
          <p className="bg-primary w-32 py-2 my-5 text-bg-black font-extrabold text-center rounded-sm">
            CINEWORLD
          </p>
        </div>
      </Link>

      <div>
        <ul className="list-none flex text-white space-x-10 text-lg ">
          <li className="hover:text-primary">
            <Link href="/">Home</Link>
          </li>
          <li className="hover:text-primary">
            <Link href="/movie">Movies</Link>
          </li>
          <li className="hover:text-primary">
            <Link href="/series">Series</Link>
          </li>
        </ul>
      </div>
      <div>
        <Link href="/search">
          <BiSearch className="text-xl text-white cursor-pointer hover:text-primary" />
        </Link>
      </div>
    </nav>
  );
};

export default Header;
