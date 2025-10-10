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
  baseUrl: string; // e.g., "/movie", "/series"
  maxPage?: number;
  visiblePages?: number;
  queryParams?: URLSearchParams; // Additional query parameters to preserve
}

const GenericPagination = ({
  currentPage,
  baseUrl,
  maxPage = 500,
  visiblePages = 5, // Reduced for cleaner mobile experience
  queryParams,
}: GenericPaginationProps) => {
  // Normalize current page to number
  const normalizedCurrentPage = isNaN(Number(currentPage))
    ? 1
    : Number(currentPage);

  // Ensure current page is within bounds
  const safePage = Math.max(1, Math.min(normalizedCurrentPage, maxPage));

  // Helper function to generate pagination URL with query parameters
  const getPaginationUrl = (pageNum: number): string => {
    const params = new URLSearchParams(queryParams);
    if (pageNum > 1) {
      params.set("page", pageNum.toString());
    } else {
      params.delete("page"); // Remove page=1 from URL for cleaner URLs
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Calculate previous and next page numbers
  const prevPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(maxPage, safePage + 1);

  // Smart pagination logic for better UX
  const generatePageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const startPage = Math.max(2, safePage - Math.floor(visiblePages / 2));
    const endPage = Math.min(
      maxPage - 1,
      safePage + Math.floor(visiblePages / 2)
    );

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("ellipsis");
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== maxPage) {
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (endPage < maxPage - 1) {
      pages.push("ellipsis");
    }

    // Always show last page (if different from first)
    if (maxPage > 1) {
      pages.push(maxPage);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col items-center space-y-6 py-12">
      {/* Premium Pagination Container */}
      <div className="relative">
        <div className="relative p-4">
          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              <PaginationItem>
                {safePage <= 1 ? (
                  <PaginationPrevious
                    className="pointer-events-none opacity-40 hover:scale-100"
                    aria-disabled="true"
                  />
                ) : (
                  <PaginationPrevious href={getPaginationUrl(prevPage)} />
                )}
              </PaginationItem>

              {/* Page Numbers */}
              {pageNumbers.map((pageNum, index) => (
                <PaginationItem key={index}>
                  {pageNum === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href={getPaginationUrl(pageNum)}
                      isActive={pageNum === safePage}
                      className="min-w-[40px] h-10 rounded-xl font-medium"
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {/* Next Button */}
              <PaginationItem>
                {safePage >= maxPage ? (
                  <PaginationNext
                    className="pointer-events-none opacity-40 hover:scale-100"
                    aria-disabled="true"
                  />
                ) : (
                  <PaginationNext href={getPaginationUrl(nextPage)} />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Enhanced Page Info */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="backdrop-blur-md bg-gray-900/40 border border-gray-700/40 rounded-xl px-4 py-2">
          <span className="text-gray-300">
            Page{" "}
            <span className="font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {safePage}
            </span>{" "}
            of <span className="font-medium text-gray-100">{maxPage}</span>
          </span>
        </div>
        <span className="hidden sm:inline text-gray-500">•</span>
        <div className="hidden sm:inline backdrop-blur-md bg-gray-900/30 border border-gray-700/30 rounded-xl px-4 py-2">
          <span className="text-gray-400">
            {maxPage.toLocaleString()} total pages
          </span>
        </div>
      </div>
    </div>
  );
};

export default GenericPagination;
