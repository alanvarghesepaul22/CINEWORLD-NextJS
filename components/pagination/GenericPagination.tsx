import Link from "next/link";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface GenericPaginationProps {
  currentPage: number | string;
  baseUrl: string; // e.g., "/movie/popular", "/series/trending", "/all/trending"
  maxPage?: number;
  visiblePages?: number;
}

const GenericPagination: React.FC<GenericPaginationProps> = ({
  currentPage,
  baseUrl,
  maxPage = 500,
  visiblePages = 5, // Reduced for cleaner mobile experience
}) => {
  // Normalize current page to number
  const normalizedCurrentPage = isNaN(Number(currentPage)) ? 1 : Number(currentPage);
  
  // Ensure current page is within bounds
  const safePage = Math.max(1, Math.min(normalizedCurrentPage, maxPage));
  
  // Helper function to generate pagination URL
  const getPaginationUrl = (pageNum: number): string => {
    return `${baseUrl}/page/${pageNum}`;
  };
  
  // Calculate previous and next page numbers
  const prevPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(maxPage, safePage + 1);
  
  // Smart pagination logic for better UX
  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    const startPage = Math.max(2, safePage - Math.floor(visiblePages / 2));
    const endPage = Math.min(maxPage - 1, safePage + Math.floor(visiblePages / 2));
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('ellipsis');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== maxPage) {
        pages.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (endPage < maxPage - 1) {
      pages.push('ellipsis');
    }
    
    // Always show last page (if different from first)
    if (maxPage > 1) {
      pages.push(maxPage);
    }
    
    return pages;
  };
  
  const pageNumbers = generatePageNumbers();
  
  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            {safePage <= 1 ? (
              <PaginationPrevious 
                className="pointer-events-none opacity-50" 
                aria-disabled="true"
              />
            ) : (
              <Link href={getPaginationUrl(prevPage)} passHref legacyBehavior>
                <PaginationPrevious />
              </Link>
            )}
          </PaginationItem>
          
          {/* Page Numbers */}
          {pageNumbers.map((pageNum, index) => (
            <PaginationItem key={index}>
              {pageNum === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <Link href={getPaginationUrl(pageNum)} passHref legacyBehavior>
                  <PaginationLink isActive={pageNum === safePage}>
                    {pageNum}
                  </PaginationLink>
                </Link>
              )}
            </PaginationItem>
          ))}
          
          {/* Next Button */}
          <PaginationItem>
            {safePage >= maxPage ? (
              <PaginationNext 
                className="pointer-events-none opacity-50" 
                aria-disabled="true"
              />
            ) : (
              <Link href={getPaginationUrl(nextPage)} passHref legacyBehavior>
                <PaginationNext />
              </Link>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      {/* Page Info - More prominent and informative */}
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <span>
          Page <span className="font-medium text-foreground">{safePage}</span> of{" "}
          <span className="font-medium text-foreground">{maxPage}</span>
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">
          Showing page {safePage} of {maxPage.toLocaleString()} total pages
        </span>
      </div>
    </div>
  );
};

export default GenericPagination;