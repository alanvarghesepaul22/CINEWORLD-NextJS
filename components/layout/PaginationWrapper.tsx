"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GenericPagination from "../pagination/GenericPagination";

interface PaginationWrapperProps {
  pageid?: string | number;
  baseUrl: string;
  maxPage?: number;
  className?: string;
}

/**
 * Internal component that uses useSearchParams
 */
const PaginationContent = ({
  pageid,
  baseUrl,
  maxPage = 500,
}: PaginationWrapperProps) => {
  const searchParams = useSearchParams();

  return (
    <GenericPagination
      currentPage={pageid}
      baseUrl={baseUrl}
      maxPage={maxPage}
      queryParams={searchParams}
    />
  );
};

/**
 * Wrapper component for consistent pagination implementation
 * Handles null/undefined pageid gracefully and provides consistent styling
 */
const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
  pageid,
  baseUrl,
  maxPage = 500,
  className = "",
}) => {
  // Only render pagination if pageid is provided and valid
  if (pageid == null) {
    return null;
  }

  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className="py-8 text-center text-gray-400">
            Loading pagination...
          </div>
        }
      >
        <PaginationContent
          pageid={pageid}
          baseUrl={baseUrl}
          maxPage={maxPage}
        />
      </Suspense>
    </div>
  );
};

export default PaginationWrapper;
