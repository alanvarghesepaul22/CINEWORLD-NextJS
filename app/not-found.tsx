import React from "react";
import Link from "next/link";
import MediaDetailLayout from "@/components/layout/MediaDetailLayout";

const PageNotFound = () => {
  return (
    <MediaDetailLayout className="pt-16">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-400">404</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist. Try searching
            again or check the URL for any typos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/movie"
            className="px-6 py-1 border border-gray-600 text-white font-medium rounded-lg bg-gray-400/20 hover:bg-gray-600/20 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </MediaDetailLayout>
  );
};

export default PageNotFound;
