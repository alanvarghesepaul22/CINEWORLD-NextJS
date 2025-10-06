import TvDisplay from "@/components/display/TvDisplay";
import SearchBar from "@/components/searchbar/SearchBar";
import TvTitle from "@/components/title/TvTitle";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

// Error tracking utility - can be configured for different services
const captureError = async (error: unknown, context: Record<string, any>) => {
  try {
    // In production, you would import and use your error tracking service:
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.captureException(error, { extra: context });
    
    // Or DataDog:
    // import { logger } from "@datadog/logs-sdk";
    // logger.error("API fetch failed", { error: error.message, ...context });
    
    // Or AWS CloudWatch:
    // import AWS from "aws-sdk";
    // const cloudWatch = new AWS.CloudWatchLogs();
    // await cloudWatch.putLogEvents({ ... });
    
    // Placeholder for production error tracking
    if (process.env.NODE_ENV === 'production') {
      // Replace this console.error with your actual error tracking service
      console.error('[PRODUCTION ERROR]', { error, context });
    }
  } catch (trackingError) {
    // Don't let error tracking failures break the app
    console.warn('Error tracking failed:', trackingError);
  }
};

async function getTrendingTV(page: number): Promise<TMDBTVShow[]> {
  try {
    const data = await api.getTrending('tv', 'day', page);
    return data.results as TMDBTVShow[];
  } catch (error) {
    const errorContext = {
      pageid: page,
      endpoint: 'api.getTrending',
      params: { type: 'tv', timeWindow: 'day', page },
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'server-side',
    };

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch trending TV shows:', error, errorContext);
    }

    // Production error tracking (non-blocking)
    if (process.env.NODE_ENV !== 'development') {
      captureError(error, errorContext).catch(() => {
        // Silently fail if error tracking fails - don't block the response
      });
    }

    return [];
  }
}

interface TrendingPageProps {
  params: Promise<{
    pageid: string;
  }>;
}

const TrendingPage: React.FC<TrendingPageProps> = async ({ params }) => {
  const { pageid: pageidStr } = await params;
  const pageid = Math.max(1, parseInt(pageidStr) || 1);
  const data = await getTrendingTV(pageid);

  return (
    <div className="h-auto">
      <TvTitle />
      {/* <SearchBar />
      <HomeFilter /> */}
      <TvDisplay series={data} pageid={pageid.toString()} category="trending" />
    </div>
  );
};

export default TrendingPage;
