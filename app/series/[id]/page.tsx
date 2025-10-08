import TvInfo from "@/components/info/TvInfo";
import { api } from "@/lib/api";
import { TMDBTVDetail } from "@/lib/types";

async function getTVDetails(id: string): Promise<{ data: TMDBTVDetail | null; genreArr: string[]; id: number | null }> {
  const numericId = parseInt(id, 10);
  
  try {
    // Validate that the ID is a positive integer and the original string only contains digits
    if (isNaN(numericId) || numericId <= 0 || !/^\d+$/.test(id.trim())) {
      console.error('Invalid TV series ID format:', id);
      return { data: null, genreArr: [], id: null };
    }
    
    const data = await api.getDetails('tv', numericId);
    const genreArr = data.genres?.map((genre: { name: string }) => genre.name) || [];
    return { data, genreArr, id: numericId };
  } catch (error) {
    console.error('Failed to fetch TV details:', error);
    return { data: null, genreArr: [], id: isNaN(numericId) ? null : numericId };
  }
}

interface TvDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const TvDetail: React.FC<TvDetailProps> = async ({ params }) => {
  const { id: idStr } = await params;
  const { data, genreArr } = await getTVDetails(idStr);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 pt-16">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">TV Series Not Found</h1>
          <p className="text-gray-400">The TV series you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return <TvInfo tvDetail={data} genreArr={genreArr} />;
};

export default TvDetail;
