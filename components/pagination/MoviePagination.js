import Link from "next/link";
import React from "react";

const MoviePagination = (props) => {
  let { pageid } = props;
  let pagenum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  if (isNaN(pageid) == true) {
    pageid = 1;
  }
  return (
    <div className="flex justify-center items-center list-none flex-wrap">
      <li className="mb-10 md:mb-0">
        <Link
          href="/movie/popular/page/[pageid]"
          as={`/movie/popular/page/${Number(pageid) - 1}`}
          className="bg-grey p-3 mx-2 text-light-white rounded-md stroke-2 hover:opacity-70 hover:text-white"
        >
          {`<`}
        </Link>
      </li>

      {pagenum &&
        pagenum.map((element, index) => {
          return (
            <li key={index} className="mb-10 md:mb-0">
              <Link
                href="/movie/popular/page/[pageid]"
                as={`/movie/popular/page/${element}`}
                className="bg-grey p-3 mx-2 text-light-white rounded-md stroke-2 hover:opacity-70 hover:text-white"
              >
                {`${element}`}
              </Link>
            </li>
          );
        })}

      <li className="mb-10 md:mb-0">
        <Link
          href="/movie/popular/page/[pageid]"
          as={`/movie/popular/page/${Number(pageid) + 1}`}
          className="bg-grey p-3 mx-2 text-light-white rounded-md stroke-2 hover:opacity-70 hover:text-white"
        >
          {`>`}
        </Link>
      </li>
    </div>
  );
};

export default MoviePagination;
