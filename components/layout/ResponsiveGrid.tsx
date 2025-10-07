import React from "react";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: boolean; // For search results that need min-h-screen
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = "",
  minHeight = false,
}) => {
  const baseClasses =
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 py-10 px-6 md:px-16";
  const heightClass = minHeight ? "min-h-screen" : "";

  return (
    <div className={`${baseClasses} ${heightClass} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
