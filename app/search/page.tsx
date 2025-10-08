import React, { Suspense } from "react";
import SearchPageContent from "@/components/search/SearchPageContent";

const SearchPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="app-bg-enhanced mt-24">
        <div className="container mx-auto px-4 pb-12">
          <div className="flex justify-center items-center py-4">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Initializing search...</span>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
};

export default SearchPage;
