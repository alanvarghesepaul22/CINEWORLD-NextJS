import TvInfo from "@/components/info/TvInfo";
import { api } from "@/lib/api";

async function getTVDetails(id: string) {
  try {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error('Invalid TV series ID');
    }
    const data = await api.getDetails('tv', numericId);
    const genreArr = data.genres?.map((genre: any) => genre.name) || [];
    return { data, genreArr, id };
  } catch (error) {
    console.error('Failed to fetch TV details:', error);
    return { data: null, genreArr: [], id };
  }
}

interface TvDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const TvDetail: React.FC<TvDetailProps> = async ({ params }) => {
  const { id: idStr } = await params;
  const { data, genreArr, id } = await getTVDetails(idStr);

  if (!data) {
    return <div>TV show not found</div>;
  }

  return <TvInfo tvDetail={data} genreArr={genreArr} />;
};

export default TvDetail;
