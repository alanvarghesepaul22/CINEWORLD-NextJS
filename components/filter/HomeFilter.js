import React from "react";
import Filter from "./Filter";


const HomeFilter = () => {
  return (
    <div className="w-100 flex justify-center mt-5">
      <div className="flex">
       <Filter/>
       <Filter/>
       <Filter/>
      </div>
    </div>
  );
};

export default HomeFilter;
