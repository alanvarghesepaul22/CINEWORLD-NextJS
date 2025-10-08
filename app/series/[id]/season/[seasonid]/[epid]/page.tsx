import EpisodeInfo from "@/components/info/EpisodeInfo";
import Link from "next/link";
import React from "react";

async function getEpisodeDetails(seriesId: string, seasonId: string, episodeId: string) {
  // Declare variables at function scope for catch block access
  let numericSeriesId: number;
  
  try {
    // Validate IDs are numeric
    numericSeriesId = parseInt(seriesId, 10);
    const numericSeasonId = parseInt(seasonId, 10);
    const numericEpisodeId = parseInt(episodeId, 10);
    
    if (isNaN(numericSeriesId) || isNaN(numericSeasonId) || isNaN(numericEpisodeId)) {
      throw new Error('Invalid ID format - IDs must be numeric');
    }

    const accessToken = process.env.TMDB_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('TMDB Access Token not configured');
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    // Make API calls with time-based revalidation (1 hour TTL)
    const [episodeRes, seasonRes, seriesRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/tv/${numericSeriesId}/season/${numericSeasonId}/episode/${numericEpisodeId}`, { 
        headers,
        next: { revalidate: 3600 } // Revalidate every hour
      }),
      fetch(`https://api.themoviedb.org/3/tv/${numericSeriesId}/season/${numericSeasonId}`, { 
        headers,
        next: { revalidate: 3600 } // Revalidate every hour
      }),
      fetch(`https://api.themoviedb.org/3/tv/${numericSeriesId}`, { 
        headers,
        next: { revalidate: 3600 } // Revalidate every hour
      })
    ]);

    // Check if responses are ok
    if (!episodeRes.ok || !seasonRes.ok || !seriesRes.ok) {
      console.error('API Response Error:', {
        episode: episodeRes.status,
        season: seasonRes.status,
        series: seriesRes.status
      });
      throw new Error('Failed to fetch episode data');
    }

    // Parse JSON responses
    const [episodeData, seasonData, seriesData] = await Promise.all([
      episodeRes.json(),
      seasonRes.json(),
      seriesRes.json()
    ]);

    return { data: episodeData, id: numericSeriesId, seasonData, seriesData };
    
  } catch (error) {
    console.error('Episode fetch error:', error);
    return { data: null, id: numericSeriesId || 0, seasonData: null, seriesData: null };
  }
}

interface EpisodeDetailsPageProps {
  params: Promise<{
    id: string;
    seasonid: string;
    epid: string;
  }>;
}

const EpisodeDetailsPage: React.FC<EpisodeDetailsPageProps> = async ({ params }) => {
  const { id: seriesId, seasonid: seasonId, epid: episodeId } = await params;
  
  // Validate URL parameters
  if (!seriesId || !seasonId || !episodeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="glass-container text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Episode URL</h1>
          <p className="text-gray-300">Missing required parameters in the URL.</p>
        </div>
      </div>
    );
  }

  const { data, id, seasonData, seriesData } = await getEpisodeDetails(seriesId, seasonId, episodeId);

  if (!data || !seasonData || !seriesData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="glass-container text-center max-w-lg">
          <h1 className="text-2xl font-bold text-white mb-4">Episode Not Found</h1>
          <p className="text-gray-300 mb-4">
            Could not find episode S{seasonId}E{episodeId} for this series.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>This could be due to:</p>
            <ul className="text-left space-y-1">
              <li>• Episode not yet released</li>
              <li>• Invalid episode number</li>
              <li>• Network connectivity issues</li>
              <li>• Temporary server problems</li>
            </ul>
          </div>
          <div className="mt-6">
            <Link
              href={`/series/${seriesId}/season/${seasonId}`}
              className="bg-primary hover:bg-primary/90 text-black font-semibold px-4 py-2 rounded smooth-transition inline-block"
            >
              Back to Season
            </Link>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <EpisodeInfo
      episodeDetails={data}
      seriesId={id}
      seasonData={seasonData}
      seriesData={seriesData}
    />
  );
  
};

export default EpisodeDetailsPage;
