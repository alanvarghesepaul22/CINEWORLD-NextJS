import MovieInfo from "@/components/info/MovieInfo";
import { api } from "@/lib/api";
import { TMDBMovieDetail, Genre } from "@/lib/types";

async function getMovieDetails(id: string): Promise<{ data: TMDBMovieDetail | null; genreArr: string[]; id: number }> {
  const parsedId = parseInt(id, 10);
  
  try {
    // Validate that the ID is a positive integer and the original string only contains digits
    if (isNaN(parsedId) || parsedId <= 0 || !/^\d+$/.test(id.trim())) {
      console.error('Invalid movie ID format:', id);
      return { data: null, genreArr: [], id: -1 };
    }
    
    const data = await api.getDetails('movie', parsedId) as TMDBMovieDetail;
    const genreArr = data.genres?.map((genre: Genre) => genre.name) || [];
    return { data, genreArr, id: parsedId };
  } catch (error) {
    console.error('Failed to fetch movie details:', error);
    return { data: null, genreArr: [], id: Number.isNaN(parsedId) ? -1 : parsedId };
  }
}

interface MovieDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const MovieDetail: React.FC<MovieDetailProps> = async ({ params }) => {
  const { id: idStr } = await params;
  const { data, genreArr, id } = await getMovieDetails(idStr);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 pt-16">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
          <p className="text-gray-400">The movie you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return <MovieInfo MovieDetail={data} genreArr={genreArr} id={id} />;
};

export default MovieDetail;
