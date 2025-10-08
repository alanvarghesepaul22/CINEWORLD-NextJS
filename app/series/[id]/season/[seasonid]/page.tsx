import SeasonInfo from "@/components/info/SeasonInfo";
import React from "react";

async function getSeasonDetails(seriesId: string, seasonId: string) {
  try {
    const accessToken = process.env.TMDB_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('TMDB Access Token not configured');
    }

    // Validate IDs are numeric and positive
    const numericSeriesId = parseInt(seriesId, 10);
    const numericSeasonId = parseInt(seasonId, 10);
    
    if (isNaN(numericSeriesId) || isNaN(numericSeasonId) || numericSeriesId <= 0 || numericSeasonId <= 0) {
      throw new Error('Invalid ID format - IDs must be positive integers');
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const resp = await fetch(
      `https://api.themoviedb.org/3/tv/${numericSeriesId}/season/${numericSeasonId}`,
      { 
        headers,
        next: { revalidate: 3600 } // Revalidate every hour
      }
    );

    if (!resp.ok) {
      console.error('Season API Response Error:', resp.status);
      throw new Error('Failed to fetch season data');
    }
    
    const data = await resp.json();
    return { data, id: seriesId };
    
  } catch (error) {
    console.error('Season fetch error:', error);
    return { data: null, id: seriesId };
  }
}

interface SeasonsDetailsPageProps {
  params: Promise<{
    id: string;
    seasonid: string;
  }>;
}

const SeasonsDetailsPage: React.FC<SeasonsDetailsPageProps> = async ({ params }) => {
  const { id: seriesId, seasonid: seasonId } = await params;
  
  // Validate URL parameters
  if (!seriesId || !seasonId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="glass-container text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Invalid Season URL</h1>
          <p className="text-sm text-gray-400">Missing required parameters in the URL.</p>
        </div>
      </div>
    );
  }

  const { data, id } = await getSeasonDetails(seriesId, seasonId);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="glass-container text-center max-w-md w-full">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.98-6.084-2.709" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Season Not Found</h1>
          <p className="text-sm text-gray-400 mb-3">
            Could not find season {seasonId} for this series.
          </p>
          <p className="text-xs text-gray-500">
            Please check the URL or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <SeasonInfo SeasonInfos={data} id={id} />
      </div>
    </div>
  );
};

export default SeasonsDetailsPage;
