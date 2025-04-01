import MovieInfo from "@/components/info/MovieInfo";

export async function getData(id) {
  const apiKey = process.env.API_KEY;

  // Fetch movie details
  const movieRes = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
  );
  let data = await movieRes.json();

  // Fetch movie videos (trailers, clips, etc.)
  const videoRes = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`
  );
  let videoData = await videoRes.json();

  let genreArr = data.genres ? data.genres.map((element) => element.name) : [];

  // Get the highest-quality trailer
  let trailer = null;
  if (videoData.results && videoData.results.length > 0) {
    const officialTrailer = videoData.results.find(
      (vid) => vid.type === "Trailer" && vid.site === "YouTube"
    );
    trailer = officialTrailer || videoData.results[0];
  }

  if (!movieRes.ok || !videoRes.ok) {
    throw new Error("Failed to Fetch data");
  }

  return { data, genreArr, id, trailer };
}

const MovieDetail = async ({ params }) => {
  let { data, genreArr, id, trailer } = await getData(params.id);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
        <MovieInfo MovieDetail={data} genreArr={genreArr} id={id} />

        {/* Download Button */}
        {trailer && (
          <div className="mt-6 flex justify-center">
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              download
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Watch Trailer
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
