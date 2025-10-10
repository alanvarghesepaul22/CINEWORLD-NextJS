interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component for section headers with space-between layout
 * Commonly used for title + action button combinations
 */
const SectionHeader = ({ children, className = "" }: SectionHeaderProps) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      {children}
    </div>
  );
};

export default SectionHeader;
