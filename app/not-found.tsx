import Link from "next/link";
import React from "react";

const PageNotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen -mt-28">
      <div className="max-w-lg px-8 py-12">
        <h1 className="text-5xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-300 text-xl mb-6">
          Oops! The page you're looking for does not exist.
        </p>
        <Link
          href="/"
          className="bg-primary hover:bg-light-primary text-black font-bold py-1 px-2 rounded inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
