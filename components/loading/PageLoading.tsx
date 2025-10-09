import React, { ReactNode } from "react";

export default function PageLoading({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        {children}
      </div>
    </div>
  );
}

export function PageEmpty({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-400 text-lg mb-2">{children}</div>
      <div className="text-gray-500 text-sm">Try adjusting your filters</div>
    </div>
  );
}

export function InfoLoading({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 pt-16">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">{children}</h2>
        <p className="text-gray-400">Please wait, this may take a moment...</p>
      </div>
    </div>
  );
}
