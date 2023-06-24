import React from "react";
import EpisodeDetails from "./EpisodeDetails";

const EpisodeInfo = () => {
  return (
    <div>
      <div className="flex flex-row place-content-center items-center mb-10 mt-5">
        <EpisodeDetails/>
      </div>
      <div className="pt-2 pb-8 flex justify-center">
        <iframe
          className="w-4/5 aspect-video"
          src="https://www.youtube.com/embed/VE8BkImUciY"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  );
};

export default EpisodeInfo;
