"use client";
import Link from "next/link";
import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import Logo from "./Logo";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className=" w-full fixed top-0 z-[100] bg-navbg shadow-sm shadow-slate-50/5 md:shadow-none">
        <div className="max-w-7xl flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
          {/* logo */}
          <Logo />

          {/* links */}

          <div className="hidden md:block">
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

          <div className="flex items-center">
            {/* searchbar */}
            <div className="mr-5 md:mr-0 sm:mr-10 ">
              <Link href="/search">
                <BiSearch className="text-xl text-white cursor-pointer hover:text-primary" />
              </Link>
            </div>

            {/* hamburger button */}

            <div className="-mr-2 flex md:hidden">
              <button
                onClick={toggleNavbar}
                type="button"
                className="inline-flex items-center justify-center p-2 text-white hover:text-light-white focus:outline-none"
              >
                <span className="sr-only">Menu</span>
                {!isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden ">
            <div>
              <ul className="list-none text-white space-y-4 mx-5 mb-3 text-base">
                <li className="py-2 px-5 rounded hover:text-primary hover:bg-grey transition-all border-b border-grey">
                  <Link href="/">Home</Link>
                </li>
                <li className="py-2 px-5 rounded hover:text-primary hover:bg-grey transition-all border-b border-grey">
                  <Link href="/movie">Movies</Link>
                </li>
                <li className="py-2 px-5 rounded hover:text-primary hover:bg-grey transition-all">
                  <Link href="/series">Series</Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
