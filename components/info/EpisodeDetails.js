import React from "react";

function formatDate(dateString) {
  const dateParts = dateString.split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // Months are zero-indexed
  const day = parseInt(dateParts[2]);

  const date = new Date(year, month, day);

  const monthName = date.toLocaleString("default", { month: "long" });
  const formattedDate = day + " " + monthName + " " + year;

  return formattedDate;
}

const EpisodeDetails = (props) => {
  let { episodeDetails } = props;
  let formattedDate = "";
  if (episodeDetails.air_date != null) {
    formattedDate = formatDate(episodeDetails.air_date);
  }

  return (
    <div className="text-white text-left w-4/5">
      <h1 className="text-2xl sm:text-3xl text-center">
        <span className="text-primary">
          S{episodeDetails.season_number}E{episodeDetails.episode_number}
        </span>{" "}
        : {episodeDetails.name}
      </h1>

      <div className="flex w-full flex-wrap justify-center font-light text-slate-300 text-sm sm:text-base mt-3">
        <p className="px-5">{formattedDate}</p>
        <p className="px-5">{episodeDetails.runtime} mins.</p>
      </div>

      <p className="text-light-white mt-5 text-justify text-base sm:text-lg">
        {episodeDetails.overview}
      </p>
    </div>
  );
};

export default EpisodeDetails;
