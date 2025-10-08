import Link from 'next/link';
import { Film, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MovieNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="glass-container">
          <div className="space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-red-500/20 rounded-full">
                <Film className="w-12 h-12 text-red-400" />
              </div>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Movie Not Found
              </h1>
              <p className="text-gray-400 mb-3">
                The movie you&apos;re looking for doesn&apos;t exist or may have been removed.
              </p>
              <p className="text-gray-500 text-sm">
                Make sure the movie ID is a valid number (e.g., /movie/123456)
              </p>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <Button 
                asChild 
                className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
              >
                <Link href="/movie">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Movies
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-gray-500/50 text-gray-300 hover:text-white hover:bg-gray-600/50"
              >
                <Link href="/">
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}