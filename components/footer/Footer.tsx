import React from "react";
import Link from "next/link";
import { AiFillGithub } from "react-icons/ai";
import { Heart } from "lucide-react";
import Logo from "../navbar/Logo";

const Footer = () => {
  return (
    <footer className="w-full bg-black/80 backdrop-blur-md border-t border-gray-800/50 shadow-2xl shadow-black/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="transform scale-75">
              <Logo />
            </div>
            <p className="text-gray-400 text-xs mt-2 text-center md:text-left">
              Your ultimate movie & series destination
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-6 mb-4">
              {[
                { href: "/", label: "Home" },
                { href: "/movie", label: "Movies" },
                { href: "/series", label: "Series" },
                { href: "/watchlist", label: "Watchlist" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative footer-link group"
                >
                  {item.label}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-2 text-center text-gray-400 text-sm">
              <span>Made with</span>
              <Heart
                className="h-4 w-4 text-red-500 fill-current animate-pulse"
                aria-hidden="true"
              />
              <span>© {new Date().getFullYear()} Cineworld</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-end">
            <Link
              href="https://github.com/alanvarghesepaul22/CINEWORLD-NextJS"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:scale-110">
                <AiFillGithub className="text-2xl text-gray-300 group-hover:text-white transition-colors duration-200" />
              </div>
            </Link>
            <p className="text-gray-500 text-xs mt-2 text-center md:text-right">
              Open Source Project
            </p>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-8 pt-6 border-t border-gray-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <p className="text-gray-500 text-xs">
              Powered by TMDB API • Next.js 15 • Tailwind CSS
            </p>
            <p className="text-gray-500 text-xs">
              All movie data provided by The Movie Database
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
