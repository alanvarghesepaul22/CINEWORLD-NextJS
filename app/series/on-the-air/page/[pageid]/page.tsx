import TvDisplay from "@/components/display/TvDisplay";
import TvTitle from "@/components/title/TvTitle";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { z } from "zod";

async function getOnTheAirTV(page: number): Promise<TMDBTVShow[]> {
  const TMDBTVShowSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string(),
    poster_path: z.string().nullable().default(null),
    backdrop_path: z.string().nullable().default(null),
    first_air_date: z.string(),
    genre_ids: z.array(z.number()),
    origin_country: z.array(z.string()),
    original_language: z.string(),
    original_name: z.string(),
    popularity: z.number(),
    vote_average: z.number(),
    vote_count: z.number(),
    adult: z.boolean(),
  });

  try {
    const data = await api.getNowPlaying("tv", page);
    return TMDBTVShowSchema.array().parse(data.results);
  } catch (error) {
    console.error("Failed to fetch on the air TV shows:", error);
    return [];
  }
}

interface OnTheAirPageProps {
  params: Promise<{
    pageid: string;
  }>;
}

const OnTheAirPage: React.FC<OnTheAirPageProps> = async ({ params }) => {
  const { pageid: pageidStr } = await params;
  const pageid = Math.max(1, parseInt(pageidStr) || 1);
  const data = await getOnTheAirTV(pageid);

  return (
    <div className="h-auto">
      <TvTitle />
      <TvDisplay series={data} pageid={pageid.toString()} category="on-the-air" />
    </div>
  );
};

export default OnTheAirPage;
