import Link from "next/link";
import { BiSearch } from "react-icons/bi";
import Logo from "./Logo";
import AiSuggestionLink from "./AiSuggestionLink";
import MobileMenu from "./MobileMenu";

const Header = () => {
  return (
    <nav className="w-full fixed top-0 z-[100] bg-black/80 backdrop-blur-md border-b border-gray-800/50 shadow-2xl shadow-black/20">
      <div className="max-w-7xl flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 h-16">
        {/* logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <div className="hidden md:block">
          <ul className="list-none flex text-white space-x-8 text-sm font-medium">
            {[
              { href: "/", label: "Home" },
              { href: "/movie", label: "Movies" },
              { href: "/series", label: "Series" },
              { href: "/watchlist", label: "Watchlist" },
            ].map((item) => (
              <li
                key={item.href}
                className="hover:text-primary transition-colors duration-200 relative group"
              >
                <Link href={item.href} className="py-2 block">
                  {item.label}
                </Link>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Suggestion Button */}
          <AiSuggestionLink />

          {/* Search Icon */}
          <Link href="/search">
            <div className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-110">
              <BiSearch className="text-lg text-white hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* Mobile Hamburger Button */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Header;
