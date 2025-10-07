import React from "react";

interface TextSegment {
  text: string;
  isPrimary?: boolean;
}

interface PageTitleProps {
  segments: TextSegment[];
}

/**
 * PageTitle - A reusable title component that supports multiple text segments
 * with primary color highlighting for specific words/phrases.
 * 
 * @param segments - Array of text segments, each can be marked as primary color
 */
const PageTitle: React.FC<PageTitleProps> = ({ segments }) => {
  return (
    <div className="flex place-content-center mt-5 m-5">
      <h1 className="w-full md:w-1/2 lg:w-1/3 text-white text-xl sm:text-2xl md:text-3xl text-center font-semibold">
        {segments.map((segment, index) => (
          <span key={index} className={segment.isPrimary ? "text-primary" : ""}>
            {segment.text}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default PageTitle;