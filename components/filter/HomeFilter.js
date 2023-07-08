import React from "react";
import Filter from "./Filter";


const HomeFilter = () => {
  return (
    <div className=" flex justify-center mt-5">
      <div className="flex">
       <Filter/>
       <Filter/>
       <Filter/>
      </div>
    </div>
  );
};

export default HomeFilter;
