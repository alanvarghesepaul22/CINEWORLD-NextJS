import MovieInfo from "@/components/info/MovieInfo";

export async function getData(id) {
  const apiKey = process.env.API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
  );
  let data = await res.json();
  let genreArr = [];

  data.genres.map((element) => {
    genreArr.push(element.name);
  });

  if (!res.ok) {
    throw new Error("Failed to Fetch data");
  }

  return { data, genreArr, id };
}
const MovieDetail = async ({ params }) => {
  let {data, genreArr, id} = await getData(params.id);
  return (
    <>
      <MovieInfo MovieDetail={data} genreArr={genreArr} id={id} />
    </>
  );
};

export default MovieDetail;
