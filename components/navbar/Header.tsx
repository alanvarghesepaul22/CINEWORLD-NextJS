"use client";
import Link from "next/link";
import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleNavbar = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="w-full fixed top-0 z-[100] bg-black/80 backdrop-blur-md border-b border-gray-800/50 shadow-2xl shadow-black/20">
      <div className="max-w-7xl flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 h-16">
        {/* logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <div className="hidden md:block">
          <ul className="list-none flex text-white space-x-8 text-sm font-medium">
            <li className="hover:text-primary transition-colors duration-200 relative group">
              <Link href="/" className="py-2 block">
                Home
              </Link>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </li>
            <li className="hover:text-primary transition-colors duration-200 relative group">
              <Link href="/movie" className="py-2 block">
                Movies
              </Link>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </li>
            <li className="hover:text-primary transition-colors duration-200 relative group">
              <Link href="/series" className="py-2 block">
                Series
              </Link>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </li>
            <li className="hover:text-primary transition-colors duration-200 relative group">
              <Link href="/watchlist" className="py-2 block">
                Watchlist
              </Link>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </li>
          </ul>
        </div>

        <div className="flex items-center">
          {/* Search Icon */}
          <div className="mr-4 md:mr-0">
            <Link href="/search">
              <div className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-110">
                <BiSearch className="text-lg text-white hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden ml-2">
            <button
              onClick={toggleNavbar}
              type="button"
              className="inline-flex items-center justify-center p-2 text-white hover:text-primary hover:bg-gray-800/50 rounded-lg transition-all duration-200 focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {!isOpen ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800/50">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              className="block py-3 px-4 text-sm font-medium text-white hover:text-primary hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/movie"
              className="block py-3 px-4 text-sm font-medium text-white hover:text-primary hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              Movies
            </Link>
            <Link
              href="/series"
              className="block py-3 px-4 text-sm font-medium text-white hover:text-primary hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              Series
            </Link>
            <Link
              href="/watchlist"
              className="block py-3 px-4 text-sm font-medium text-white hover:text-primary hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              Watchlist
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
